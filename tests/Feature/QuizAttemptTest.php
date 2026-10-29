<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\Subject;
use App\Models\User;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    public function test_user_can_submit_quiz_and_get_graded(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'os'], ['name' => 'Operating Systems']);

        $question = Question::create([
            'subject_id' => $subject->id,
            'question_text' => 'What is a process?',
            'options' => [
                'A' => 'A program in execution',
                'B' => 'A thread',
                'C' => 'A memory block',
                'D' => 'None',
            ],
            'correct_option' => 'A',
            'explanation' => 'A process is an active program in execution.',
            'difficulty' => 'easy',
        ]);

        $quiz = Quiz::create([
            'user_id' => $user->id,
            'title' => 'OS Quick Test',
            'duration_minutes' => 10,
            'total_marks' => 1,
            'negative_marking' => 0.25,
            'type' => 'practice',
        ]);
        $quiz->questions()->attach([$question->id => ['order' => 1]]);

        $response = $this->actingAs($user)->post(route('quizzes.submit', $quiz->id), [
            'answers' => [
                $question->id => 'A',
            ],
            'time_spent_seconds' => 45,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('quiz_attempts', [
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'correct_count' => 1,
            'score' => 1.00,
        ]);
    }

    public function test_written_answer_is_saved_without_mcq_grading(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'written-os'], ['name' => 'Written OS']);
        $question = Question::create([
            'subject_id' => $subject->id,
            'type' => 'written',
            'marks' => 5,
            'question_text' => 'Explain process scheduling.',
            'written_answer' => 'A scheduler selects processes for execution.',
        ]);
        $quiz = Quiz::create([
            'user_id' => $user->id,
            'title' => 'Written OS Test',
            'duration_minutes' => 20,
            'total_marks' => 5,
            'negative_marking' => 0,
            'type' => 'mock',
        ]);
        $quiz->questions()->attach([$question->id => ['order' => 1]]);

        $response = $this->actingAs($user)->post(route('quizzes.submit', $quiz->id), [
            'answers' => [
                $question->id => 'The operating system chooses the next process and allocates CPU time.',
            ],
            'time_spent_seconds' => 180,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('quiz_attempt_answers', [
            'question_id' => $question->id,
            'selected_option' => null,
            'written_response' => 'The operating system chooses the next process and allocates CPU time.',
            'is_correct' => false,
        ]);
        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'answered_count' => 1,
            'correct_count' => 0,
            'wrong_count' => 0,
            'score' => 0,
            'accuracy_rate' => 0,
        ]);
    }
}
