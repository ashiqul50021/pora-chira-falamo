<?php

namespace Tests\Feature;

use App\Models\PracticeLog;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DailyReportTest extends TestCase
{
    public function test_quick_practice_records_log_successfully(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'networking'], ['name' => 'Computer Networks']);

        $question = Question::create([
            'subject_id' => $subject->id,
            'question_text' => 'What does HTTP stand for?',
            'options' => [
                'A' => 'HyperText Transfer Protocol',
                'B' => 'High Text Transfer Protocol',
                'C' => 'Hyperlink Transfer Protocol',
                'D' => 'None',
            ],
            'correct_option' => 'A',
            'explanation' => 'HTTP stands for HyperText Transfer Protocol.',
            'difficulty' => 'easy',
        ]);

        $response = $this->actingAs($user)->post(route('questions.practice.record'), [
            'question_id' => $question->id,
            'selected_option' => 'A',
            'is_correct' => true,
            'type' => 'mcq',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('practice_logs', [
            'user_id' => $user->id,
            'question_id' => $question->id,
            'selected_option' => 'A',
            'is_correct' => true,
            'type' => 'mcq',
        ]);
    }

    public function test_dashboard_renders_daily_report_and_performance_scale(): void
    {
        $user = User::factory()->create();
        $subject = Subject::firstOrCreate(['slug' => 'database'], ['name' => 'Database Systems']);

        $question = Question::create([
            'subject_id' => $subject->id,
            'question_text' => 'What is SQL?',
            'options' => [
                'A' => 'Structured Query Language',
                'B' => 'Simple Query Logic',
                'C' => 'System Query List',
                'D' => 'None',
            ],
            'correct_option' => 'A',
            'explanation' => 'SQL is Structured Query Language.',
            'difficulty' => 'easy',
        ]);

        PracticeLog::create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'selected_option' => 'A',
            'is_correct' => true,
            'type' => 'mcq',
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('dailyReport')
            ->where('dailyReport.quick_practice.count', 1)
            ->where('dailyReport.quick_practice.correct', 1)
            ->has('dailyReport.scale')
            ->has('dailyReport.summary')
        );
    }
}
