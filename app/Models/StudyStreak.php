<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\StudyStreakFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyStreak extends Model
{
    /** @use HasFactory<StudyStreakFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_streak',
        'longest_streak',
        'last_activity_date',
        'total_questions_solved',
        'total_quizzes_taken',
        'penalty_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_streak' => 'integer',
            'longest_streak' => 'integer',
            'last_activity_date' => 'date',
            'total_questions_solved' => 'integer',
            'total_quizzes_taken' => 'integer',
            'penalty_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record study activity for today and maintain streak logic.
     */
    public function recordActivity(int $questionsCount = 1, int $quizzesCount = 0): void
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $this->total_questions_solved += $questionsCount;
        $this->total_quizzes_taken += $quizzesCount;

        if ($this->last_activity_date === null) {
            $this->current_streak = 1;
        } elseif ($this->last_activity_date->isSameDay($today)) {
            // Already active today, streak remains same
        } elseif ($this->last_activity_date->isSameDay($yesterday)) {
            $this->current_streak += 1;
        } else {
            // Missed days - streak broken, penalty incremented
            $missedDays = (int) $this->last_activity_date->diffInDays($today) - 1;
            if ($missedDays > 0) {
                $this->penalty_count += $missedDays;
            }
            $this->current_streak = 1;
        }

        if ($this->current_streak > $this->longest_streak) {
            $this->longest_streak = $this->current_streak;
        }

        $this->last_activity_date = $today;
        $this->save();
    }
}
