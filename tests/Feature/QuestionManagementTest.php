<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Tests\TestCase;

class QuestionManagementTest extends TestCase
{
    public function test_authenticated_user_can_view_questions_index(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('questions.index'));

        $response->assertOk();
    }

    public function test_authenticated_user_can_batch_save_questions(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'dbms'], ['name' => 'Database Management Systems']);

        $response = $this->actingAs($user)->post(route('questions.store'), [
            'questions' => [
                [
                    'question_text' => 'What is an ACID transaction property?',
                    'options' => [
                        'A' => 'Atomicity, Consistency, Isolation, Durability',
                        'B' => 'Access, Control, Identity, Data',
                        'C' => 'Async, Call, Input, Output',
                        'D' => 'None of the above',
                    ],
                    'correct_option' => 'A',
                    'explanation' => 'ACID stands for Atomicity, Consistency, Isolation, Durability.',
                    'subject_name' => $subject->name,
                    'topic_name' => 'Transactions',
                    'difficulty' => 'medium',
                ],
            ],
            'source' => 'manual',
        ]);

        $response->assertRedirect(route('questions.index'));
        $this->assertDatabaseHas('questions', [
            'question_text' => 'What is an ACID transaction property?',
            'correct_option' => 'A',
            'type' => 'mcq',
        ]);
    }

    public function test_authenticated_user_can_save_written_question(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'os'], ['name' => 'Operating Systems']);

        $response = $this->actingAs($user)->post(route('questions.store'), [
            'questions' => [
                [
                    'type' => 'written',
                    'question_text' => 'Explain the concept of Deadlock and 4 Coffman conditions required for it to occur.',
                    'written_answer' => 'A deadlock is a situation where processes cannot proceed. The 4 conditions are: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait.',
                    'marks' => 8,
                    'subject_name' => $subject->name,
                    'topic_name' => 'Deadlock',
                    'difficulty' => 'hard',
                ],
            ],
            'source' => 'manual',
        ]);

        $response->assertRedirect(route('questions.index'));
        $this->assertDatabaseHas('questions', [
            'type' => 'written',
            'question_text' => 'Explain the concept of Deadlock and 4 Coffman conditions required for it to occur.',
            'marks' => 8,
        ]);
    }

    public function test_authenticated_user_can_filter_questions_by_type(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('questions.index', ['type' => 'written']));
        $response->assertOk();

        $mcqResponse = $this->actingAs($user)->get(route('questions.index', ['type' => 'mcq']));
        $mcqResponse->assertOk();
    }
}
