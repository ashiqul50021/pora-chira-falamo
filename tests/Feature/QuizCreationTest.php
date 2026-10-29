<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\Subject;
use App\Models\User;
use Tests\TestCase;

class QuizCreationTest extends TestCase
{
    public function test_user_can_create_written_mock_test_with_custom_question_count(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'written-db'], ['name' => 'Written Database']);

        foreach (range(1, 4) as $number) {
            Question::create([
                'subject_id' => $subject->id,
                'type' => 'written',
                'marks' => 5,
                'question_text' => "Explain database concept {$number}.",
                'written_answer' => 'A written model answer.',
            ]);
        }

        $response = $this->actingAs($user)->post(route('quizzes.store'), [
            'title' => 'Four Written Database Questions',
            'creation_mode' => 'syllabus',
            'subject_id' => '',
            'subject_ids' => [$subject->id],
            'topic_id' => '',
            'topic_ids' => [],
            'exam_name' => '',
            'year' => '',
            'type' => 'mock',
            'question_type' => 'written',
            'question_count' => 4,
            'duration_minutes' => 30,
            'negative_marking' => 0,
            'description' => null,
        ]);

        $quiz = Quiz::query()->where('title', 'Four Written Database Questions')->firstOrFail();

        $response->assertRedirect(route('quizzes.show', $quiz));
        $this->assertDatabaseHas('quizzes', [
            'id' => $quiz->id,
            'total_marks' => 20,
        ]);
        $this->assertSame(4, $quiz->questions()->count());
        $this->assertSame(4, $quiz->questions()->where('type', 'written')->count());
    }
}