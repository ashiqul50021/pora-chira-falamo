<?php

namespace App\Console\Commands;

use App\Services\GeminiService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('gemini:test {prompt? : Optional custom prompt to test with}')]
#[Description('Test Google Gemini API connection and response')]
class TestGeminiApi extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(GeminiService $gemini): int
    {
        $this->info('Testing Gemini API configuration...');
        $this->line('Model: <comment>'.config('services.gemini.model').'</comment>');

        $hasKey = ! empty(config('services.gemini.api_key'));
        $this->line('API Key configured: '.($hasKey ? '<info>YES</info>' : '<error>NO</error>'));

        if (! $hasKey) {
            $this->error('Please set GEMINI_API_KEY in your .env file.');

            return self::FAILURE;
        }

        $customPrompt = $this->argument('prompt');

        if ($customPrompt) {
            $this->info("Sending prompt: \"{$customPrompt}\"");
            try {
                $response = $gemini->generateText($customPrompt);
                $this->newLine();
                $this->info('--- Gemini Response ---');
                $this->line($response);
                $this->info('------------------------');

                return self::SUCCESS;
            } catch (\Exception $e) {
                $this->error('Request failed: '.$e->getMessage());

                return self::FAILURE;
            }
        }

        $result = $gemini->testConnection();

        if ($result['success']) {
            $this->info('✓ '.$result['message']);
            if (isset($result['response'])) {
                $this->line('Model replied: "<comment>'.$result['response'].'</comment>"');
            }

            return self::SUCCESS;
        }

        $this->error('✗ '.$result['message']);

        return self::FAILURE;
    }
}
