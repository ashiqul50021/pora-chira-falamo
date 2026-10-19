<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use App\Services\QuestionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_authenticated_user_can_save_question_with_exam_name_and_year(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'dld'], ['name' => 'Digital Logic Design & Computer Architecture']);

        $response = $this->actingAs($user)->post(route('questions.store'), [
            'questions' => [
                [
                    'type' => 'mcq',
                    'question_text' => 'How many 3-to-8 line decoders with an enable input are needed to construct a 6-to-64 line decoder without using any other logic gate?',
                    'options' => [
                        'A' => '7',
                        'B' => '8',
                        'C' => '9',
                        'D' => '10',
                    ],
                    'correct_option' => 'C',
                    'explanation' => 'We need 8 decoders for the 64 outputs and 1 decoder to enable one of the 8 decoders. Total = 9.',
                    'exam_name' => '43rd BCS (IT)',
                    'year' => '2021',
                    'subject_name' => $subject->name,
                    'topic_name' => 'Combinational Circuits',
                    'difficulty' => 'medium',
                ],
            ],
            'source' => 'manual',
        ]);

        $response->assertRedirect(route('questions.index'));
        $this->assertDatabaseHas('questions', [
            'question_text' => 'How many 3-to-8 line decoders with an enable input are needed to construct a 6-to-64 line decoder without using any other logic gate?',
            'exam_name' => '43rd BCS (IT)',
            'year' => '2021',
        ]);
    }

    public function test_authenticated_user_can_upload_multiple_images_for_extraction(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $mockService = $this->createMock(QuestionService::class);
        $mockService->expects($this->once())
            ->method('extractFromMultipleImages')
            ->willReturn([
                [
                    'type' => 'mcq',
                    'question_text' => 'Sample multi-image question?',
                    'options' => ['A' => '1', 'B' => '2', 'C' => '3', 'D' => '4'],
                    'correct_option' => 'A',
                    'explanation' => 'Exp',
                    'subject_name' => 'DBMS',
                    'topic_name' => 'SQL',
                    'difficulty' => 'easy',
                ],
            ]);

        $this->app->instance(QuestionService::class, $mockService);

        $file1 = UploadedFile::fake()->image('page1.jpg');
        $file2 = UploadedFile::fake()->image('page2.jpg');

        $response = $this->actingAs($user)->post(route('questions.extract-image'), [
            'images' => [$file1, $file2],
            'exam_name' => '44th BCS',
            'year' => '2022',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'count' => 1,
        ]);
        $response->assertJsonStructure(['image_urls', 'questions']);
    }

    public function test_check_duplicates_detects_database_and_batch_duplicates(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'dbms'], ['name' => 'Database Management Systems']);

        Question::factory()->create([
            'subject_id' => $subject->id,
            'question_text' => 'What is third normal form (3NF)?',
        ]);

        $response = $this->actingAs($user)->postJson(route('questions.check-duplicates'), [
            'questions' => [
                [
                    'question_text' => '1. What is third normal form (3NF)?',
                ],
                [
                    'question_text' => 'What is B-tree indexing?',
                ],
                [
                    'question_text' => 'What is B-tree indexing?',
                ],
            ],
        ]);

        $response->assertOk();
        $data = $response->json('questions');

        // First is in database
        $this->assertTrue($data[0]['is_duplicate']);
        $this->assertEquals('database', $data[0]['duplicate_reason']);
        $this->assertNotNull($data[0]['existing_question']);

        // Second is unique
        $this->assertFalse($data[1]['is_duplicate']);

        // Third is batch duplicate of second
        $this->assertTrue($data[2]['is_duplicate']);
        $this->assertEquals('batch', $data[2]['duplicate_reason']);
    }

    public function test_store_can_skip_duplicates_when_skip_duplicates_is_enabled(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'algo'], ['name' => 'Data Structures & Algorithms']);

        Question::factory()->create([
            'subject_id' => $subject->id,
            'question_text' => 'Explain Dijkstra shortest path algorithm.',
        ]);

        $initialCount = Question::count();

        $response = $this->actingAs($user)->post(route('questions.store'), [
            'questions' => [
                [
                    'type' => 'written',
                    'question_text' => 'Explain Dijkstra shortest path algorithm.',
                    'subject_name' => $subject->name,
                ],
                [
                    'type' => 'written',
                    'question_text' => 'Explain Bellman-Ford algorithm.',
                    'subject_name' => $subject->name,
                ],
            ],
            'skip_duplicates' => true,
        ]);

        $response->assertRedirect(route('questions.index'));
        $response->assertSessionHas('success');
        $this->assertStringContainsString('ডুপ্লিকেট প্রশ্ন স্কিপ করা হয়েছে', session('success'));

        // Only 1 new question should be saved
        $this->assertEquals($initialCount + 1, Question::count());
    }
}
