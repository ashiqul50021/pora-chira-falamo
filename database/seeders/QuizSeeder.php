<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $questions = Question::take(10)->get();

        if ($questions->count() < 3) {
            return;
        }

        $quiz = Quiz::firstOrCreate(
            ['title' => 'আইটি অফিসার ও সহকারী প্রোগ্রামার স্পেশাল মক টেস্ট - ০১'],
            [
                'user_id' => $user?->id,
                'description' => 'কম্পিউটার সায়েন্স ও আইটি বিষয়ের স্ট্যান্ডার্ড প্রশ্ন নিয়ে ১৫ মিনিটের পূর্ণাঙ্গ মডেল টেস্ট।',
                'type' => 'mock',
                'duration_minutes' => 15,
                'total_marks' => $questions->count(),
                'negative_marking' => 0.25,
            ]
        );

        $attachData = [];
        foreach ($questions as $idx => $q) {
            $attachData[$q->id] = ['order' => $idx + 1];
        }

        $quiz->questions()->sync($attachData);
    }
}
