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
        ]);
    }
}
