<?php

namespace App\Http\Controllers;

use App\Models\PracticeLog;
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

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'LIKE', "%{$search}%")
                    ->orWhere('explanation', 'LIKE', "%{$search}%")
                    ->orWhere('written_answer', 'LIKE', "%{$search}%")
                    ->orWhere('exam_name', 'LIKE', "%{$search}%")
                    ->orWhere('year', 'LIKE', "%{$search}%")
                    ->orWhere('code_snippet', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('exam_name')) {
            $query->where('exam_name', 'LIKE', "%{$request->input('exam_name')}%");
        }

        $questions = $query->paginate(12)->withQueryString();
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Questions/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id', 'topic_id', 'difficulty', 'type', 'search', 'exam_name']),
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
            'exam_name' => 'nullable|string|max:150',
            'year' => 'nullable|string|max:10',
        ]);

        try {
            $questions = $this->questionService->extractFromText(
                $validated['text'],
                $validated['exam_name'] ?? null,
                $validated['year'] ?? null
            );

            $duplicateChecked = $this->questionService->attachDuplicateStatus($questions);
            if (! empty($duplicateChecked)) {
                $questions = $duplicateChecked;
            }

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
        $validated = $request->validate([
            'images' => 'nullable|array|min:1|max:10',
            'images.*' => 'image|max:30720',
            'image' => 'nullable|image|max:30720',
            'exam_name' => 'nullable|string|max:150',
            'year' => 'nullable|string|max:10',
        ]);

        $files = [];
        if ($request->hasFile('images')) {
            $files = $request->file('images');
        } elseif ($request->hasFile('image')) {
            $files = [$request->file('image')];
        }

        if (empty($files)) {
            return response()->json([
                'success' => false,
                'message' => 'অনুগ্রহ করে অন্তত একটি ছবি সিলেক্ট করুন।',
            ], 422);
        }

        try {
            $questions = $this->questionService->extractFromMultipleImages(
                $files,
                $validated['exam_name'] ?? null,
                $validated['year'] ?? null
            );

            // Store all images
            $storedUrls = [];
            foreach ($files as $file) {
                $storedPath = $file->store('question-uploads', 'public');
                $storedUrls[] = Storage::url($storedPath);
            }

            $primaryImageUrl = $storedUrls[0] ?? null;

            // Attach image path to extracted questions
            foreach ($questions as &$q) {
                $q['image_path'] = $primaryImageUrl;
            }

            $duplicateChecked = $this->questionService->attachDuplicateStatus($questions);
            if (! empty($duplicateChecked)) {
                $questions = $duplicateChecked;
            }

            return response()->json([
                'success' => true,
                'questions' => $questions,
                'count' => count($questions),
                'image_url' => $primaryImageUrl,
                'image_urls' => $storedUrls,
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
            'type' => 'nullable|string|in:mcq,written',
        ]);

        $count = (int) ($validated['count'] ?? 3);
        $difficulty = $validated['difficulty'] ?? 'medium';
        $type = $validated['type'] ?? 'mcq';

        try {
            $questions = $this->questionService->generateQuestions($validated['topic'], $count, $difficulty, $type);
            $duplicateChecked = $this->questionService->attachDuplicateStatus($questions);
            if (! empty($duplicateChecked)) {
                $questions = $duplicateChecked;
            }

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
     * Interactive conversational AI Question Studio endpoint (Chat with multiple images / drag & drop).
     */
    public function studioChat(Request $request): JsonResponse
    {
        $rawHistory = $request->input('history');
        if (is_string($rawHistory)) {
            $decoded = json_decode($rawHistory, true);
            if (is_array($decoded)) {
                $request->merge(['history' => $decoded]);
            }
        }

        $validated = $request->validate([
            'message' => 'nullable|string',
            'history' => 'nullable|array',
            'images.*' => 'nullable|image|max:12288',
        ]);

        $files = $request->file('images', []);
        $userMessage = trim($validated['message'] ?? '');
        $history = $validated['history'] ?? [];

        if (empty($userMessage) && empty($files)) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a message or upload at least one image.',
            ], 422);
        }

        try {
            // Build contents for Gemini API
            $contents = [];

            // Add previous history
            foreach ($history as $h) {
                if (isset($h['role'], $h['content']) && in_array($h['role'], ['user', 'model'])) {
                    $contents[] = [
                        'role' => $h['role'],
                        'parts' => [
                            ['text' => (string) $h['content']],
                        ],
                    ];
                }
            }

            // Current user turn parts
            $currentParts = [];

            // Add images if provided
            $storedUrls = [];
            foreach ($files as $file) {
                $currentParts[] = [
                    'inline_data' => [
                        'mime_type' => $file->getMimeType() ?: 'image/jpeg',
                        'data' => base64_encode(file_get_contents($file->getRealPath())),
                    ],
                ];

                $storedPath = $file->store('question-uploads', 'public');
                $storedUrls[] = Storage::url($storedPath);
            }

            // Add user text instruction
            $textPrompt = $userMessage !== ''
                ? $userMessage
                : 'Please extract all questions (MCQ and Written) from these exam images.';

            $currentParts[] = [
                'text' => $textPrompt,
            ];

            $contents[] = [
                'role' => 'user',
                'parts' => $currentParts,
            ];

            $systemInstruction = <<<'INSTRUCTION'
You are an expert Computer Science Professor and IT Exam Question Extraction Assistant in "PoraChira IT" platform.
When the user shares images or text of exam papers, questions, or topics:
1. Provide a friendly conversational summary/explanation of what was found.
2. If there are questions present, format them clearly and ALSO include a valid JSON block enclosed in ```json ... ``` with the questions following this exact schema:
```json
[
  {
    "type": "mcq or written",
    "marks": 1,
    "exam_name": "Exam name if mentioned or inferred, else null",
    "year": "Exam year if mentioned or inferred, else null",
    "question_text": "Clean question statement without options",
    "code_snippet": "Optional code snippet from question statement, else null",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correct_option": "A or B or C or D (for mcq only, null for written)",
    "written_answer": "Complete solution for written questions (null for mcq)",
    "explanation": "Detailed explanation and why the correct answer is correct",
    "subject_name": "Standard Computer Science Subject name",
    "topic_name": "Specific Topic name",
    "difficulty": "easy or medium or hard"
  }
]
```
3. If the user asks for corrections, clarifications, or explanations, answer helpfully in Bengali and English as appropriate.
INSTRUCTION;

            $replyText = $this->gemini->chat($contents, $systemInstruction);

            // Attempt to parse structured questions from reply
            $parsedQuestions = [];
            $cleanJson = $this->gemini->cleanJsonString($replyText);
            $decoded = json_decode($cleanJson, true);

            if (is_array($decoded)) {
                $rawList = $this->questionService->normalizeQuestionsResult($decoded);
                $withDuplicates = $this->questionService->attachDuplicateStatus($rawList);
                $primaryUrl = $storedUrls[0] ?? null;

                foreach ($withDuplicates as $q) {
                    if ($primaryUrl && empty($q['image_path'])) {
                        $q['image_path'] = $primaryUrl;
                    }
                    $parsedQuestions[] = $q;
                }
            }

            return response()->json([
                'success' => true,
                'reply' => $replyText,
                'questions' => $parsedQuestions,
                'count' => count($parsedQuestions),
                'image_urls' => $storedUrls,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI Studio Chat failed: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Check an array of questions for duplicates against the database and batch.
     */
    public function checkDuplicates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.question_text' => 'nullable|string',
        ]);

        $questions = $this->questionService->attachDuplicateStatus($validated['questions']);

        return response()->json([
            'success' => true,
            'questions' => $questions,
        ]);
    }

    /**
     * Batch save extracted/reviewed questions to the database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'questions' => 'required|array|min:1',
            'questions.*.type' => 'nullable|string|in:mcq,written',
            'questions.*.question_text' => 'required|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_option' => 'nullable|string',
            'questions.*.written_answer' => 'nullable|string',
            'questions.*.marks' => 'nullable|integer|min:1|max:100',
            'questions.*.exam_name' => 'nullable|string|max:150',
            'questions.*.year' => 'nullable|string|max:10',
            'questions.*.subject_name' => 'nullable|string',
            'questions.*.topic_name' => 'nullable|string',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.code_snippet' => 'nullable|string',
            'questions.*.difficulty' => 'nullable|string|in:easy,medium,hard',
            'source' => 'nullable|string',
            'skip_duplicates' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $source = $validated['source'] ?? 'manual';
        $skipDuplicates = (bool) ($validated['skip_duplicates'] ?? false);
        $savedCount = 0;
        $skippedCount = 0;

        foreach ($validated['questions'] as $qData) {
            $questionText = $qData['question_text'] ?? '';
            if ($skipDuplicates && $this->questionService->findExistingQuestion($questionText)) {
                $skippedCount++;

                continue;
            }

            $this->questionService->saveQuestion($qData, $user?->id, $source);
            $savedCount++;
        }

        // Update streak & practice count
        if ($user && $savedCount > 0) {
            $this->streakService->recordQuestionPracticed($user, $savedCount);
        }

        $message = "{$savedCount} টি প্রশ্ন সফলভাবে ডাটাবেসে সেভ করা হয়েছে!";
        if ($skippedCount > 0) {
            $message .= " ({$skippedCount} টি ডুপ্লিকেট প্রশ্ন স্কিপ করা হয়েছে)";
        }

        return redirect()->route('questions.index')
            ->with('success', $message);
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

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $questions = $query->take(20)->get();
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Questions/Practice', [
            'questions' => $questions,
            'subjects' => $subjects,
            'selectedSubject' => $request->input('subject_id'),
            'selectedTopic' => $request->input('topic_id'),
            'selectedType' => $request->input('type'),
        ]);
    }

    /**
     * Record practicing a question in practice mode.
     */
    public function recordPractice(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'question_id' => 'nullable|exists:questions,id',
            'selected_option' => 'nullable|string|max:10',
            'is_correct' => 'nullable|boolean',
            'type' => 'nullable|string|in:mcq,written',
        ]);

        if (! empty($validated['question_id'])) {
            // Check if there is a recent log within last 15 mins for the same question (e.g. self-evaluation after reveal)
            $recentLog = PracticeLog::where('user_id', $user->id)
                ->where('question_id', $validated['question_id'])
                ->where('created_at', '>=', now()->subMinutes(15))
                ->latest()
                ->first();

            if ($recentLog && array_key_exists('is_correct', $validated)) {
                $recentLog->update([
                    'is_correct' => (bool) $validated['is_correct'],
                    'selected_option' => $validated['selected_option'] ?? $recentLog->selected_option,
                    'type' => $validated['type'] ?? $recentLog->type,
                ]);
                $goal = $user->getTodayGoal();
            } else {
                PracticeLog::create([
                    'user_id' => $user->id,
                    'question_id' => $validated['question_id'],
                    'selected_option' => $validated['selected_option'] ?? null,
                    'is_correct' => (bool) ($validated['is_correct'] ?? false),
                    'type' => $validated['type'] ?? 'mcq',
                ]);
                $goal = $this->streakService->recordQuestionPracticed($user, 1);
            }
        } else {
            $goal = $this->streakService->recordQuestionPracticed($user, 1);
        }

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
