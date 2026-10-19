<?php

namespace App\Services;

use App\Models\DailyGoal;
use App\Models\PracticeLog;
use App\Models\QuizAttempt;
use App\Models\StudyStreak;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;

class StreakService
{
    public function __construct(
        protected GeminiService $gemini
    ) {}

    /**
     * Check and refresh user's streak status (applying penalties if past days were missed).
     */
    public function syncStreak(User $user): StudyStreak
    {
        $streak = $user->getOrCreateStreak();
        $today = Carbon::today();

        if ($streak->last_activity_date) {
            $lastDate = Carbon::parse($streak->last_activity_date);
            $diffInDays = (int) $lastDate->diffInDays($today, false);

            if ($diffInDays > 1) {
                // Missed one or more days!
                $missedDays = $diffInDays - 1;
                $streak->penalty_count += $missedDays;
                $streak->current_streak = 0;
                $streak->save();
            }
        }

        return $streak;
    }

    /**
     * Record questions practiced by user towards daily goal and streak.
     */
    public function recordQuestionPracticed(User $user, int $count = 1): DailyGoal
    {
        $this->syncStreak($user);

        $goal = $user->getTodayGoal();
        $goal->completed_questions += $count;

        if ($goal->completed_questions >= $goal->target_questions && $goal->completed_quizzes >= $goal->target_quizzes) {
            $goal->is_achieved = true;
        }
        $goal->save();

        $streak = $user->getOrCreateStreak();
        $streak->recordActivity($count, 0);

        return $goal;
    }

    /**
     * Record quiz completed by user towards daily goal and streak.
     */
    public function recordQuizCompleted(User $user, int $questionsAnsweredCount = 0): DailyGoal
    {
        $this->syncStreak($user);

        $goal = $user->getTodayGoal();
        $goal->completed_quizzes += 1;
        $goal->completed_questions += $questionsAnsweredCount;

        if ($goal->completed_questions >= $goal->target_questions && $goal->completed_quizzes >= $goal->target_quizzes) {
            $goal->is_achieved = true;
        }
        $goal->save();

        $streak = $user->getOrCreateStreak();
        $streak->recordActivity($questionsAnsweredCount, 1);

        return $goal;
    }

    /**
     * Compute weekly performance analytics and weak topic breakdown.
     *
     * @return array<string, mixed>
     */
    public function getWeeklyPerformance(User $user): array
    {
        $startOfWeek = Carbon::now()->subDays(7)->startOfDay();

        $attempts = QuizAttempt::with(['quiz.subject', 'answers.question.topic'])
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)
            ->get();

        $totalAttempts = $attempts->count();
        $totalQuestions = $attempts->sum('total_questions');
        $totalCorrect = $attempts->sum('correct_count');
        $totalWrong = $attempts->sum('wrong_count');
        $averageAccuracy = $totalQuestions > 0 ? round(($totalCorrect / $totalQuestions) * 100, 1) : 0.0;

        // Calculate accuracy per subject
        $subjectStats = [];
        $topicStats = [];

        foreach ($attempts as $attempt) {
            foreach ($attempt->answers as $ans) {
                $q = $ans->question;
                if (! $q) {
                    continue;
                }

                $subName = $q->subject?->name ?? 'General IT';
                $topName = $q->topic?->name ?? 'General';

                if (! isset($subjectStats[$subName])) {
                    $subjectStats[$subName] = ['total' => 0, 'correct' => 0];
                }
                $subjectStats[$subName]['total'] += 1;
                if ($ans->is_correct) {
                    $subjectStats[$subName]['correct'] += 1;
                }

                if (! isset($topicStats[$topName])) {
                    $topicStats[$topName] = ['total' => 0, 'correct' => 0, 'subject' => $subName];
                }
                $topicStats[$topName]['total'] += 1;
                if ($ans->is_correct) {
                    $topicStats[$topName]['correct'] += 1;
                }
            }
        }

        // Identify weak topics (accuracy < 60% with at least 2 attempts)
        $weakTopics = [];
        foreach ($topicStats as $topic => $stats) {
            $acc = $stats['total'] > 0 ? round(($stats['correct'] / $stats['total']) * 100, 1) : 0;
            if ($acc < 65) {
                $weakTopics[] = [
                    'topic' => $topic,
                    'subject' => $stats['subject'],
                    'accuracy' => $acc,
                    'total' => $stats['total'],
                ];
            }
        }

        // Daily breakdown for last 7 days
        $dailyHistory = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $dayString = $day->toDateString();
            $dayName = $day->format('D');

            $dayGoal = DailyGoal::where('user_id', $user->id)
                ->where('date', $dayString)
                ->first();

            $dailyHistory[] = [
                'date' => $dayString,
                'day' => $dayName,
                'completed_questions' => $dayGoal?->completed_questions ?? 0,
                'target_questions' => $dayGoal?->target_questions ?? 15,
                'is_achieved' => $dayGoal?->is_achieved ?? false,
            ];
        }

        $streak = $this->syncStreak($user);

        return [
            'total_quizzes_taken' => $totalAttempts,
            'total_questions_solved' => $totalQuestions,
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
            'average_accuracy' => $averageAccuracy,
            'current_streak' => $streak->current_streak,
            'longest_streak' => $streak->longest_streak,
            'penalty_count' => $streak->penalty_count,
            'subject_stats' => $subjectStats,
            'weak_topics' => $weakTopics,
            'daily_history' => $dailyHistory,
        ];
    }

    /**
     * Generate an AI-powered personalized study advice using Gemini based on performance metrics.
     */
    public function generateAiWeeklyAdvice(User $user, array $performanceData): string
    {
        $weakTopicsList = collect($performanceData['weak_topics'] ?? [])
            ->map(fn ($item) => "- {$item['topic']} ({$item['subject']}): {$item['accuracy']}% accuracy")
            ->implode("\n");

        if (empty($weakTopicsList)) {
            $weakTopicsList = 'No severe weak topics identified yet. Candidate has either consistent accuracy or fresh study history.';
        }

        $prompt = <<<PROMPT
You are a Computer Science Professor and IT Exam Coach.
Analyze the student's study performance for this week:
- Total Questions Solved: {$performanceData['total_questions_solved']}
- Overall Accuracy: {$performanceData['average_accuracy']}%
- Current Daily Streak: {$performanceData['current_streak']} days
- Missed Day Penalties: {$performanceData['penalty_count']}
- Weak Areas Identified:
{$weakTopicsList}

Provide a short, motivating, highly actionable 3-part study advice in Bengali:
1. **পারফরম্যান্সের মূল্যায়ন** (Quick appraisal)
2. **যে বিষয়গুলোতে আগামী সপ্তাহে জোর দেওয়া দরকার** (Specific focus areas for IT exam)
3. **পড়ার নিয়মানুবর্তিতা ও স্ট্রিক পরামর্শ** (Habit & consistency advice)

Keep the tone encouraging, concise and focused on IT competitive exams (Software Engineer, IT Officer, BCS/Bank IT).
PROMPT;

        try {
            return $this->gemini->generateText($prompt);
        } catch (\Exception $e) {
            return 'নিয়মিত অনুশীলন বজায় রাখুন এবং দুর্বল টপিকগুলোতে প্রতিদিন অন্তত ১৫টি প্রশ্ন সমাধান করার চেষ্টা করুন।';
        }
    }

    /**
     * Compute today's daily activity, quick practice logs, and performance scale.
     *
     * @return array<string, mixed>
     */
    public function getDailyReport(User $user): array
    {
        $today = Carbon::today();
        $todayGoal = $user->getTodayGoal();

        // 1. Fetch Today's Quick Practice Logs with question, subject, topic
        $practiceLogs = PracticeLog::with(['question.subject:id,name', 'question.topic:id,name'])
            ->where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->latest()
            ->get();

        $quickPracticeCount = $practiceLogs->count();
        $quickPracticeCorrect = $practiceLogs->where('is_correct', true)->count();
        $quickPracticeWrong = $practiceLogs->where('is_correct', false)->count();
        $quickPracticeAccuracy = $quickPracticeCount > 0
            ? round(($quickPracticeCorrect / $quickPracticeCount) * 100, 1)
            : 0.0;

        // Formatted log items for the UI
        $formattedPracticeLogs = $practiceLogs->take(25)->map(function ($log) {
            $question = $log->question;

            return [
                'id' => $log->id,
                'question_id' => $log->question_id,
                'question_text' => $question?->question_text ?? 'প্রশ্ন পাওয়া যায়নি',
                'subject_name' => $question?->subject?->name ?? 'আইটি',
                'topic_name' => $question?->topic?->name,
                'type' => $log->type,
                'selected_option' => $log->selected_option,
                'correct_option' => $question?->correct_option,
                'is_correct' => (bool) $log->is_correct,
                'time' => $log->created_at->diffForHumans(),
                'exact_time' => $log->created_at->format('h:i A'),
            ];
        })->values()->all();

        // 2. Fetch Today's Quiz / Mock Test Attempts
        $todayAttempts = QuizAttempt::with('quiz.subject')
            ->where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->latest()
            ->get();

        $quizzesCount = $todayAttempts->count();
        $quizzesQuestionsTotal = (int) $todayAttempts->sum('total_questions');
        $quizzesCorrect = (int) $todayAttempts->sum('correct_count');
        $quizzesWrong = (int) $todayAttempts->sum('wrong_count');
        $quizzesAccuracy = $quizzesQuestionsTotal > 0
            ? round(($quizzesCorrect / $quizzesQuestionsTotal) * 100, 1)
            : 0.0;

        // 3. Total Combined Activity Today
        $totalQuestionsSolved = max($todayGoal->completed_questions, $quickPracticeCount + $quizzesQuestionsTotal);
        $totalEvaluated = $quickPracticeCount + $quizzesQuestionsTotal;
        $totalCorrect = $quickPracticeCorrect + $quizzesCorrect;
        $totalWrong = $quickPracticeWrong + $quizzesWrong;

        $overallAccuracy = $totalEvaluated > 0
            ? round(($totalCorrect / $totalEvaluated) * 100, 1)
            : 0.0;

        // 4. Performance Scale Calculation (0 to 100)
        // Weighted formula:
        // - Accuracy Weight (50% max): accuracy * 0.5
        // - Goal Volume Completion Weight (40% max): min(1.0, completed / target) * 40
        // - Mock Test Practice Bonus (10% max): min(1.0, quizzes_count / target_quizzes) * 10
        $accuracyScore = ($overallAccuracy * 0.5);
        $goalRatio = $todayGoal->target_questions > 0
            ? min(1.0, $todayGoal->completed_questions / $todayGoal->target_questions)
            : 0;
        $volumeScore = $goalRatio * 40;
        $quizRatio = $todayGoal->target_quizzes > 0
            ? min(1.0, $quizzesCount / $todayGoal->target_quizzes)
            : 0;
        $quizBonus = $quizRatio * 10;

        if ($totalQuestionsSolved === 0 && $quizzesCount === 0) {
            $performanceScore = 0;
            $performanceGrade = 'N/A';
            $performanceTier = 'inactive';
            $performanceLabel = 'এখনো শুরু হয়নি';
            $performanceColor = 'slate';
            $performanceBadge = 'bg-slate-800 text-slate-400 border-slate-700';
            $performanceAdvice = 'আজকে এখনো কোনো প্র্যাকটিস করা হয়নি। কুইক প্র্যাকটিস শুরু করে স্কোর অর্জন করুন!';
        } else {
            $performanceScore = (int) round($accuracyScore + $volumeScore + $quizBonus);
            $performanceScore = min(100, max(5, $performanceScore));

            if ($performanceScore >= 90) {
                $performanceGrade = 'A+';
                $performanceTier = 'elite';
                $performanceLabel = 'এলিট / অসাধারণ';
                $performanceColor = 'emerald';
                $performanceBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                $performanceAdvice = 'চমৎকার পারফরম্যান্স! আপনি আজকের লক্ষ্য ও নির্ভুলতার শীর্ষে রয়েছেন।';
            } elseif ($performanceScore >= 75) {
                $performanceGrade = 'A';
                $performanceTier = 'proficient';
                $performanceLabel = 'সুদক্ষ / প্রফিশিয়েন্ট';
                $performanceColor = 'indigo';
                $performanceBadge = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
                $performanceAdvice = 'দারুণ গতি! আরেকটু নিয়মিত থাকলে আপনি সহজেই এলিট স্কেলে পৌঁছাবেন।';
            } elseif ($performanceScore >= 50) {
                $performanceGrade = 'B';
                $performanceTier = 'steady';
                $performanceLabel = 'অগ্রসর / সন্তোষজনক';
                $performanceColor = 'amber';
                $performanceBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                $performanceAdvice = 'ভালো শুরু হয়েছে। আজকের লক্ষ্যমাত্রা পূরণ করতে আরো কিছু প্রশ্ন সমাধান করুন।';
            } else {
                $performanceGrade = 'C';
                $performanceTier = 'developing';
                $performanceLabel = 'উন্নতিশীল / রানিং';
                $performanceColor = 'rose';
                $performanceBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                $performanceAdvice = 'অনুশীলন চালিয়ে যান। সঠিক উত্তরের হার বাড়াতে ব্যাখ্যাগুলো মন দিয়ে পড়ুন।';
            }
        }

        $goalProgressPercent = $todayGoal->target_questions > 0
            ? min(100, (int) round(($todayGoal->completed_questions / $todayGoal->target_questions) * 100))
            : 0;

        return [
            'date' => $today->toDateString(),
            'formatted_date' => $today->format('d M, Y (l)'),
            'quick_practice' => [
                'count' => $quickPracticeCount,
                'correct' => $quickPracticeCorrect,
                'wrong' => $quickPracticeWrong,
                'accuracy' => $quickPracticeAccuracy,
                'logs' => $formattedPracticeLogs,
            ],
            'quizzes' => [
                'count' => $quizzesCount,
                'total_questions' => $quizzesQuestionsTotal,
                'correct' => $quizzesCorrect,
                'wrong' => $quizzesWrong,
                'accuracy' => $quizzesAccuracy,
            ],
            'summary' => [
                'total_questions' => $totalQuestionsSolved,
                'total_correct' => $totalCorrect,
                'total_wrong' => $totalWrong,
                'accuracy' => $overallAccuracy,
                'target_questions' => $todayGoal->target_questions,
                'goal_progress_percent' => $goalProgressPercent,
                'is_goal_achieved' => (bool) $todayGoal->is_achieved,
            ],
            'scale' => [
                'score' => $performanceScore,
                'grade' => $performanceGrade,
                'tier' => $performanceTier,
                'label' => $performanceLabel,
                'color' => $performanceColor,
                'badge' => $performanceBadge,
                'advice' => $performanceAdvice,
            ],
        ];
    }
}
