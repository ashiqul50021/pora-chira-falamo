<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiService
{
    protected string $apiKey;

    protected string $model;

    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    /**
     * Initialize Gemini service with configuration.
     */
    public function __construct(?string $apiKey = null, ?string $model = null)
    {
        $this->apiKey = $apiKey ?? (string) config('services.gemini.api_key', '');
        $this->model = $model ?? (string) config('services.gemini.model', 'gemini-2.5-flash');
    }

    /**
     * Verify if the API key is configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Test connection with a lightweight prompt.
     *
     * @return array{success: bool, message: string, response?: string}
     */
    public function testConnection(): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'Gemini API key is not configured in .env file (GEMINI_API_KEY).',
            ];
        }

        try {
            $response = $this->generateText('Respond with exactly "Gemini connection successful!" and nothing else.');

            return [
                'success' => true,
                'message' => 'Gemini API connected successfully!',
                'response' => trim($response),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Gemini API connection failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Generate text response from a prompt.
     */
    public function generateText(string $prompt, array $generationConfig = []): string
    {
        $this->ensureConfigured();

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
        ];

        if (! empty($generationConfig)) {
            $payload['generationConfig'] = $generationConfig;
        }

        $response = $this->sendRequest($payload);

        return $this->extractTextFromResponse($response);
    }

    /**
     * Generate structured JSON from a prompt.
     *
     * @return array<string, mixed>|array<int, mixed>
     */
    public function generateJson(string $prompt): array
    {
        $this->ensureConfigured();

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
            ],
        ];

        $response = $this->sendRequest($payload);
        $rawText = $this->extractTextFromResponse($response);

        $decoded = json_decode($rawText, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
            throw new RuntimeException('Failed to decode Gemini JSON response: '.json_last_error_msg().'. Raw: '.$rawText);
        }

        return $decoded;
    }

    /**
     * Extract questions or content from an image with a custom prompt.
     *
     * @return array<string, mixed>|array<int, mixed>|string
     */
    public function extractFromImage(string $imageBase64, string $mimeType, string $prompt, bool $jsonResponse = true): array|string
    {
        $this->ensureConfigured();

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $imageBase64,
                            ],
                        ],
                        ['text' => $prompt],
                    ],
                ],
            ],
        ];

        if ($jsonResponse) {
            $payload['generationConfig'] = [
                'responseMimeType' => 'application/json',
            ];
        }

        $response = $this->sendRequest($payload);
        $rawText = $this->extractTextFromResponse($response);

        if ($jsonResponse) {
            $decoded = json_decode($rawText, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $rawText;
    }

    /**
     * Send HTTP POST request to Google Gemini API.
     */
    protected function sendRequest(array $payload): Response
    {
        $url = sprintf('%s/models/%s:generateContent?key=%s', $this->baseUrl, $this->model, $this->apiKey);

        $response = Http::timeout(90)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post($url, $payload);

        if ($response->failed()) {
            $errorMessage = $response->json('error.message') ?? $response->body();
            throw new RuntimeException('Gemini API request failed ['.$response->status().']: '.$errorMessage);
        }

        return $response;
    }

    /**
     * Extract candidate text from API response.
     */
    protected function extractTextFromResponse(Response $response): string
    {
        $candidates = $response->json('candidates', []);
        if (empty($candidates)) {
            throw new RuntimeException('Gemini returned no candidates in the response.');
        }

        $parts = $candidates[0]['content']['parts'] ?? [];
        $text = '';

        foreach ($parts as $part) {
            if (isset($part['text'])) {
                $text .= $part['text'];
            }
        }

        return $text;
    }

    /**
     * Ensure that the API key is set.
     */
    protected function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('GEMINI_API_KEY is not set in your .env file.');
        }
    }
}
