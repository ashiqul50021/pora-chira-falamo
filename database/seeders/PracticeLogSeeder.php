<?php

namespace Database\Seeders;

use App\Models\PracticeLog;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;

class PracticeLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $questions = Question::take(5)->get();

        if ($user && $questions->isNotEmpty()) {
            foreach ($questions as $q) {
                PracticeLog::create([
                    'user_id' => $user->id,
                    'question_id' => $q->id,
                    'selected_option' => $q->correct_option,
                    'is_correct' => true,
                    'type' => $q->type,
                ]);
            }
        }
    }
}
