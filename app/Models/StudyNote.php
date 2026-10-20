<?php

namespace App\Models;

use Database\Factories\StudyNoteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class StudyNote extends Model
{
    /** @use HasFactory<StudyNoteFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject_id',
        'topic_id',
        'title',
        'slug',
        'summary',
        'content',
        'key_points',
        'read_time_minutes',
        'is_published',
        'views_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key_points' => 'array',
            'is_published' => 'boolean',
            'read_time_minutes' => 'integer',
            'views_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($note) {
            if (empty($note->slug)) {
                $baseSlug = Str::slug($note->title);
                $slug = $baseSlug ?: 'study-note';
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }
                $note->slug = $slug;
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
