<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\Subject;
use App\Services\StreakService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function __construct(
        protected StreakService $streakService
    ) {}

    /**
     * Display quizzes list and mock tests.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $quizzes = Quiz::with(['subject', 'topic'])
            ->withCount('questions')
            ->latest()
            ->paginate(9);

        $recentAttempts = QuizAttempt::with('quiz.subject')
            ->where('user_id', $user->id)
            ->latest()
            ->take(8)
            ->get();

        $subjects = Subject::with('topics')->get();

        return Inertia::render('Quizzes/Index', [
            'quizzes' => $quizzes,
            'recentAttempts' => $recentAttempts,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Show form to create a new quiz or mock test.
     */
    public function create(): Response
    {
        $subjects = Subject::with('topics')->get();
        $totalQuestions = Question::count();

        // Get distinct exam names and years available in question bank (for MCQ questions)
        $availableExams = Question::where('type', 'mcq')
            ->whereNotNull('exam_name')
            ->where('exam_name', '!=', '')
            ->select('exam_name')
            ->selectRaw('count(*) as count')
            ->groupBy('exam_name')
            ->orderByDesc('count')
            ->get();

        $availableYears = Question::where('type', 'mcq')
            ->whereNotNull('year')
            ->where('year', '!=', '')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');

        return Inertia::render('Quizzes/Create', [
            'subjects' => $subjects,
            'totalAvailableQuestions' => $totalQuestions,
            'availableExams' => $availableExams,
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Store a newly created quiz in database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'creation_mode' => 'nullable|string|in:syllabus,exam',
            'subject_id' => 'nullable|exists:subjects,id',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'integer|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'topic_ids' => 'nullable|array',
            'topic_ids.*' => 'integer|exists:topics,id',
            'exam_name' => 'nullable|string|max:150',
            'year' => 'nullable|string|max:20',
            'type' => 'required|in:practice,mock',
            'question_count' => 'required|integer|min:3|max:100',
            'duration_minutes' => 'required|integer|min:1|max:180',
            'negative_marking' => 'required|numeric|min:0|max:1',
            'description' => 'nullable|string',
        ]);

        $query = Question::query()->where('type', 'mcq');

        // Mode 1: Real Job Exam Based
        if (($validated['creation_mode'] ?? 'syllabus') === 'exam' && ! empty($validated['exam_name'])) {
            $query->where('exam_name', 'LIKE', '%'.trim($validated['exam_name']).'%');
            if (! empty($validated['year'])) {
                $query->where('year', trim($validated['year']));
            }
        } else {
            // Mode 2: Syllabus / Multiple Subjects & Multiple Topics
            if (! empty($validated['topic_ids']) && is_array($validated['topic_ids'])) {
                $query->whereIn('topic_id', $validated['topic_ids']);
            } elseif (! empty($validated['topic_id'])) {
                $query->where('topic_id', $validated['topic_id']);
            } elseif (! empty($validated['subject_ids']) && is_array($validated['subject_ids'])) {
                $query->whereIn('subject_id', $validated['subject_ids']);
            } elseif (! empty($validated['subject_id'])) {
                $query->where('subject_id', $validated['subject_id']);
            }
        }

        $questions = $query->inRandomOrder()->take($validated['question_count'])->get();

        if ($questions->count() < 3) {
            return redirect()->back()->withErrors([
                'question_count' => 'আপনার নির্বাচিত বিষয়ের ফিল্টারের অধীনে পর্যাপ্ত প্রশ্ন (কমপক্ষে ৩টি) পাওয়া যায়নি। অন্য টপিক বা বিষয় বাছাই করুন।',
            ]);
        }

        $firstTopicId = ! empty($validated['topic_ids']) && is_array($validated['topic_ids'])
            ? $validated['topic_ids'][0]
            : ($validated['topic_id'] ?? null);

        $firstSubjectId = ! empty($validated['subject_ids']) && is_array($validated['subject_ids'])
            ? $validated['subject_ids'][0]
            : ($validated['subject_id'] ?? null);

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'subject_id' => $firstSubjectId,
            'topic_id' => $firstTopicId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'duration_minutes' => $validated['duration_minutes'],
            'total_marks' => $questions->count(),
            'negative_marking' => $validated['negative_marking'],
        ]);

        // Attach questions to quiz
        $attachData = [];
        foreach ($questions as $index => $q) {
            $attachData[$q->id] = ['order' => $index + 1];
        }
        $quiz->questions()->attach($attachData);

        return redirect()->route('quizzes.show', $quiz)
            ->with('success', 'মক টেস্ট তৈরি সম্পন্ন হয়েছে! পরীক্ষা শুরু করুন।');
    }

    /**
     * Display the quiz taking interface.
     */
    public function show(Quiz $quiz): Response
    {
        $quiz->load(['subject', 'topic', 'questions.subject', 'questions.topic']);

        return Inertia::render('Quizzes/Take', [
            'quiz' => $quiz,
        ]);
    }

    /**
     * Submit and grade the quiz attempt.
     */
    public function submit(Request $request, Quiz $quiz): RedirectResponse
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'time_spent_seconds' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $quiz->load('questions');

        $userAnswers = $validated['answers'];
        $correctCount = 0;
        $wrongCount = 0;
        $answeredCount = 0;

        $attemptAnswers = [];

        foreach ($quiz->questions as $question) {
            $selected = $userAnswers[$question->id] ?? null;

            if ($selected !== null && $selected !== '') {
                $answeredCount++;
                $isCorrect = (strtoupper((string) $selected) === strtoupper((string) $question->correct_option));

                if ($isCorrect) {
                    $correctCount++;
                } else {
                    $wrongCount++;
                }

                $attemptAnswers[] = [
                    'question_id' => $question->id,
                    'selected_option' => $selected,
                    'is_correct' => $isCorrect,
                ];
            } else {
                $attemptAnswers[] = [
                    'question_id' => $question->id,
                    'selected_option' => null,
                    'is_correct' => false,
                ];
            }
        }

        $negativeMark = (float) $quiz->negative_marking;
        $totalScore = max(0, $correctCount - ($wrongCount * $negativeMark));
        $totalQuestions = $quiz->questions->count();
        $accuracyRate = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 2) : 0;

        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'total_questions' => $totalQuestions,
            'answered_count' => $answeredCount,
            'correct_count' => $correctCount,
            'wrong_count' => $wrongCount,
            'score' => $totalScore,
            'accuracy_rate' => $accuracyRate,
            'time_spent_seconds' => $validated['time_spent_seconds'],
            'completed_at' => Carbon::now(),
        ]);

        foreach ($attemptAnswers as $ans) {
            $ans['quiz_attempt_id'] = $attempt->id;
            QuizAttemptAnswer::create($ans);
        }

        // Update user's daily goals and study streak
        $this->streakService->recordQuizCompleted($user, $answeredCount);

        return redirect()->route('quizzes.result', $attempt)
            ->with('success', 'পরীক্ষা সম্পন্ন হয়েছে!');
    }

    /**
     * Display detailed quiz result and answer reviews.
     */
    public function result(QuizAttempt $attempt): Response
    {
        $attempt->load([
            'quiz.subject',
            'quiz.topic',
            'answers.question.subject',
            'answers.question.topic',
        ]);

        return Inertia::render('Quizzes/Result', [
            'attempt' => $attempt,
        ]);
    }
}
