<?php

namespace Tests\Feature\Services;

use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiServiceTest extends TestCase
{
    public function test_it_detects_when_not_configured(): void
    {
        $service = new GeminiService(apiKey: '');
        $this->assertFalse($service->isConfigured());

        $result = $service->testConnection();
        $this->assertFalse($result['success']);
    }

    public function test_it_can_generate_text(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Gemini connection successful!'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new GeminiService(apiKey: 'test-api-key', model: 'gemini-2.5-flash');
        $this->assertTrue($service->isConfigured());

        $result = $service->testConnection();
        $this->assertTrue($result['success']);
        $this->assertSame('Gemini connection successful!', $result['response']);
    }

    public function test_it_can_generate_json(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '{"question":"What is a binary search tree?","topic":"Data Structures"}'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new GeminiService(apiKey: 'test-api-key', model: 'gemini-2.5-flash');
        $data = $service->generateJson('Generate a question');

        $this->assertIsArray($data);
        $this->assertSame('What is a binary search tree?', $data['question']);
        $this->assertSame('Data Structures', $data['topic']);
    }
}
