<?php

namespace Database\Factories;

use App\Models\PracticeLog;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeLog>
 */
class PracticeLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'question_id' => Question::factory(),
            'selected_option' => fake()->randomElement(['A', 'B', 'C', 'D']),
            'is_correct' => fake()->boolean(70),
            'type' => 'mcq',
        ];
    }
}
