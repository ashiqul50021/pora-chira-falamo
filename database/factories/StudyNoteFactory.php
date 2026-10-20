<?php

namespace Database\Factories;

use App\Models\StudyNote;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StudyNote>
 */
class StudyNoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'subject_id' => Subject::factory(),
            'topic_id' => null,
            'user_id' => null,
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 9999),
            'summary' => fake()->paragraph(),
            'content' => fake()->paragraphs(4, true),
            'key_points' => [
                fake()->sentence(),
                fake()->sentence(),
                fake()->sentence(),
            ],
            'read_time_minutes' => fake()->numberBetween(3, 10),
            'is_published' => true,
            'views_count' => fake()->numberBetween(0, 50),
        ];
    }
}
