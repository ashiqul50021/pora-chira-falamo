<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use App\Services\QuestionService;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function __construct(
        protected QuestionService $questionService,
        protected StreakService $streakService
    ) {}

    /**
     * Display a listing of questions with filtering and search.
     */
    public function index(Request $request): Response
    {
        $query = Question::with(['subject', 'topic'])->latest();

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        if ($request->filled('topic_id')) {
            $query->where('topic_id', $request->input('topic_id'));
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'LIKE', "%{$search}%")
                    ->orWhere('explanation', 'LIKE', "%{$search}%")
                    ->orWhere('code_snippet', 'LIKE', "%{$search}%");
            });
        }

        $questions = $query->paginate(12)->withQueryString();
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Questions/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id', 'topic_id', 'difficulty', 'search']),
        ]);
    }

    /**
     * Show the question upload / Gemini AI extraction studio.
     */
    public function create(): Response
    {
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Questions/Upload', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Extract questions from pasted text using Gemini.
     */
    public function extractText(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|min:10',
        ]);

        try {
            $questions = $this->questionService->extractFromText($validated['text']);

            return response()->json([
                'success' => true,
                'questions' => $questions,
                'count' => count($questions),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini extraction failed: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Extract questions from uploaded image using Gemini multimodal vision.
     */
    public function extractImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // max 10MB
        ]);

        try {
            $imageFile = $request->file('image');
            $questions = $this->questionService->extractFromImage($imageFile);

            // Store image if user wants to keep a copy
            $storedPath = $imageFile->store('question-uploads', 'public');

            // Attach image path to extracted questions
            foreach ($questions as &$q) {
                $q['image_path'] = Storage::url($storedPath);
            }

            return response()->json([
                'success' => true,
                'questions' => $questions,
                'count' => count($questions),
                'image_url' => Storage::url($storedPath),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Image analysis failed: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Generate fresh questions with Gemini on a topic.
     */
    public function generateWithAi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|min:2|max:150',
            'count' => 'nullable|integer|min:1|max:10',
            'difficulty' => 'nullable|string|in:easy,medium,hard',
        ]);

        $count = (int) ($validated['count'] ?? 3);
        $difficulty = $validated['difficulty'] ?? 'medium';

        try {
            $questions = $this->questionService->generateQuestions($validated['topic'], $count, $difficulty);

            return response()->json([
                'success' => true,
                'questions' => $questions,
                'count' => count($questions),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Question generation failed: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Batch save extracted/reviewed questions to the database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.options' => 'required|array',
            'questions.*.correct_option' => 'required|string|in:A,B,C,D,a,b,c,d',
            'questions.*.subject_name' => 'nullable|string',
            'questions.*.topic_name' => 'nullable|string',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.code_snippet' => 'nullable|string',
            'questions.*.difficulty' => 'nullable|string|in:easy,medium,hard',
            'source' => 'nullable|string',
        ]);

        $user = $request->user();
        $source = $validated['source'] ?? 'manual';
        $savedCount = 0;

        foreach ($validated['questions'] as $qData) {
            $this->questionService->saveQuestion($qData, $user?->id, $source);
            $savedCount++;
        }

        // Update streak & practice count
        if ($user) {
            $this->streakService->recordQuestionPracticed($user, $savedCount);
        }

        return redirect()->route('questions.index')
            ->with('success', "{$savedCount} টি প্রশ্ন সফলভাবে ডাটাবেসে সেভ করা হয়েছে!");
    }

    /**
     * Interactive quick practice mode.
     */
    public function practice(Request $request): Response
    {
        $query = Question::with(['subject', 'topic'])->inRandomOrder();

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        if ($request->filled('topic_id')) {
            $query->where('topic_id', $request->input('topic_id'));
        }

        $questions = $query->take(20)->get();
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Questions/Practice', [
            'questions' => $questions,
            'subjects' => $subjects,
            'selectedSubject' => $request->input('subject_id'),
            'selectedTopic' => $request->input('topic_id'),
        ]);
    }

    /**
     * Record practicing a question in practice mode.
     */
    public function recordPractice(Request $request): JsonResponse
    {
        $user = $request->user();
        $goal = $this->streakService->recordQuestionPracticed($user, 1);

        return response()->json([
            'success' => true,
            'completed_questions' => $goal->completed_questions,
            'target_questions' => $goal->target_questions,
            'is_achieved' => $goal->is_achieved,
        ]);
    }

    /**
     * Delete a question.
     */
    public function destroy(Question $question): RedirectResponse
    {
        $question->delete();

        return redirect()->back()->with('success', 'প্রশ্নটি ডিলিট করা হয়েছে।');
    }
}
