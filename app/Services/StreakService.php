<?php

namespace App\Services;

use App\Models\DailyGoal;
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
}
