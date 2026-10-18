<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return HasOne<StudyStreak, $this>
     */
    public function studyStreak(): HasOne
    {
        return $this->hasOne(StudyStreak::class);
    }

    /**
     * @return HasMany<DailyGoal, $this>
     */
    public function dailyGoals(): HasMany
    {
        return $this->hasMany(DailyGoal::class);
    }

    /**
     * @return HasMany<QuizAttempt, $this>
     */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get or initialize user's study streak.
     */
    public function getOrCreateStreak(): StudyStreak
    {
        return $this->studyStreak()->firstOrCreate([], [
            'current_streak' => 0,
            'longest_streak' => 0,
            'total_questions_solved' => 0,
            'total_quizzes_taken' => 0,
            'penalty_count' => 0,
        ]);
    }

    /**
     * Get or initialize today's daily goal.
     */
    public function getTodayGoal(): DailyGoal
    {
        $today = Carbon::today()->toDateString();

        return $this->dailyGoals()->firstOrCreate(
            ['date' => $today],
            [
                'target_questions' => 15,
                'completed_questions' => 0,
                'target_quizzes' => 1,
                'completed_quizzes' => 0,
                'is_achieved' => false,
            ]
        );
    }
}
