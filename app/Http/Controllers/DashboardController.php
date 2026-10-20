<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\StudyNote;
use App\Models\Subject;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected StreakService $streakService
    ) {}

    /**
     * Display the main user study dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $streak = $this->streakService->syncStreak($user);
        $todayGoal = $user->getTodayGoal();

        $subjects = Subject::withCount(['questions', 'topics'])->get();
        $totalQuestionsCount = Question::count();

        $recentAttempts = QuizAttempt::with('quiz.subject')
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $recentQuestions = Question::with(['subject', 'topic'])
            ->latest()
            ->take(6)
            ->get();

        // 7-day activity sparkline
        $weeklyPerformance = $this->streakService->getWeeklyPerformance($user);

        // Today's daily report with quick practice logs, activity, and performance scale
        $dailyReport = $this->streakService->getDailyReport($user);

        // Featured study notes
        $featuredNotes = StudyNote::with('subject')
            ->where('is_published', true)
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('Dashboard', [
            'streak' => $streak,
            'todayGoal' => $todayGoal,
            'totalQuestionsCount' => $totalQuestionsCount,
            'subjects' => $subjects,
            'recentAttempts' => $recentAttempts,
            'recentQuestions' => $recentQuestions,
            'weeklyActivity' => $weeklyPerformance['daily_history'],
            'penaltyCount' => $streak->penalty_count,
            'dailyReport' => $dailyReport,
            'featuredNotes' => $featuredNotes,
        ]);
    }
}
