<?php

namespace Tests\Feature;

use App\Models\StudyNote;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudyNoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('notes.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_can_view_study_notes_list(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        StudyNote::factory()->create([
            'subject_id' => $subject->id,
            'title' => 'Operating Systems Concurrency',
        ]);

        $response = $this->actingAs($user)->get(route('notes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Notes/Index')
            ->has('notes.data', 1)
        );
    }

    public function test_user_can_view_single_study_note(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $note = StudyNote::factory()->create([
            'subject_id' => $subject->id,
            'title' => 'Database Indexing B-Trees',
            'views_count' => 5,
        ]);

        $response = $this->actingAs($user)->get(route('notes.show', $note->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Notes/Show')
            ->where('note.title', 'Database Indexing B-Trees')
        );

        $this->assertEquals(6, $note->fresh()->views_count);
    }

    public function test_user_can_store_study_note(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $topic = Topic::factory()->create(['subject_id' => $subject->id]);

        $payload = [
            'subject_id' => $subject->id,
            'topic_id' => $topic->id,
            'title' => 'Object Oriented Programming 4 Pillars',
            'summary' => 'Encapsulation, Abstraction, Inheritance, Polymorphism.',
            'content' => "## OOP Fundamentals\nDetailed lecture sheet with examples.",
            'key_points' => ['Abstraction hides complexity', 'Polymorphism allows multiple forms'],
            'read_time_minutes' => 6,
        ];

        $response = $this->actingAs($user)->post(route('notes.store'), $payload);

        $this->assertDatabaseHas('study_notes', [
            'title' => 'Object Oriented Programming 4 Pillars',
            'subject_id' => $subject->id,
        ]);

        $note = StudyNote::where('title', 'Object Oriented Programming 4 Pillars')->first();
        $response->assertRedirect(route('notes.show', $note));
    }

    public function test_user_can_delete_study_note(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $note = StudyNote::factory()->create([
            'subject_id' => $subject->id,
        ]);

        $response = $this->actingAs($user)->delete(route('notes.destroy', $note));

        $this->assertDatabaseMissing('study_notes', [
            'id' => $note->id,
        ]);
        $response->assertRedirect(route('notes.index'));
    }
}
