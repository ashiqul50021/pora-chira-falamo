<?php

namespace App\Models;

use Database\Factories\DailyGoalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyGoal extends Model
{
    /** @use HasFactory<DailyGoalFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'target_questions',
        'completed_questions',
        'target_quizzes',
        'completed_quizzes',
        'is_achieved',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_achieved' => 'boolean',
            'target_questions' => 'integer',
            'completed_questions' => 'integer',
            'target_quizzes' => 'integer',
            'completed_quizzes' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
