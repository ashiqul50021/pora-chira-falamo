<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

class QuestionService
{
    public function __construct(
        protected GeminiService $gemini
    ) {}

    /**
     * System instruction prompt for parsing IT exam questions.
     */
    protected function getExtractionPrompt(): string
    {
        $subjectsList = Subject::with('topics')->get()->map(function ($subject) {
            return $subject->name.' (Topics: '.$subject->topics->pluck('name')->implode(', ').')';
        })->implode("\n- ");

        return <<<PROMPT
You are an expert IT Exam Question Extractor and Computer Science Professor.
Analyze the provided text or image carefully and extract all multiple-choice questions (MCQs).
If code is part of the question, isolate it in the `code_snippet` field.
Map the subject and topic to the closest match from the following available IT subjects and topics:
- {$subjectsList}

Return a valid JSON array of objects. Each object MUST strictly follow this JSON schema:
[
  {
    "question_text": "Question statement without options or code",
    "code_snippet": "Optional code snippet if present, else null",
    "options": {
      "A": "Option text A",
      "B": "Option text B",
      "C": "Option text C",
      "D": "Option text D"
    },
    "correct_option": "A or B or C or D",
    "explanation": "Detailed technical explanation explaining why the correct option is right and others are wrong",
    "subject_name": "Closest matching Subject name from the provided list",
    "topic_name": "Closest matching Topic name from the provided list",
    "difficulty": "easy or medium or hard"
  }
]
Always return valid JSON only.
PROMPT;
    }

    /**
     * Extract questions from raw pasted text.
     *
     * @return array<int, array<string, mixed>>
     */
    public function extractFromText(string $rawText): array
    {
        $prompt = $this->getExtractionPrompt()."\n\nHere is the raw text to extract questions from:\n\"\"\"\n{$rawText}\n\"\"\"";

        $result = $this->gemini->generateJson($prompt);

        return $this->normalizeQuestionsResult($result);
    }

    /**
     * Extract questions from an uploaded image.
     *
     * @return array<int, array<string, mixed>>
     */
    public function extractFromImage(UploadedFile $image): array
    {
        $base64 = base64_encode(file_get_contents($image->getRealPath()));
        $mimeType = $image->getMimeType() ?: 'image/jpeg';

        $prompt = $this->getExtractionPrompt()."\n\nExtract all multiple choice questions shown in this image.";

        $result = $this->gemini->extractFromImage($base64, $mimeType, $prompt, true);

        if (! is_array($result)) {
            throw new RuntimeException('Gemini did not return an array from the image.');
        }

        return $this->normalizeQuestionsResult($result);
    }

    /**
     * Generate fresh questions using Gemini for a given topic or subject.
     *
     * @return array<int, array<string, mixed>>
     */
    public function generateQuestions(string $topicOrSubject, int $count = 3, string $difficulty = 'medium'): array
    {
        $prompt = $this->getExtractionPrompt()."\n\nGenerate {$count} high-quality IT exam multiple choice questions on \"{$topicOrSubject}\" with difficulty \"{$difficulty}\". Include technical code or architecture scenarios where relevant.";

        $result = $this->gemini->generateJson($prompt);

        return $this->normalizeQuestionsResult($result);
    }

    /**
     * Save an extracted question into the database.
     */
    public function saveQuestion(array $data, ?int $userId = null, string $source = 'manual'): Question
    {
        $subjectName = $data['subject_name'] ?? 'Data Structures & Algorithms';
        $topicName = $data['topic_name'] ?? null;

        $subject = Subject::where('name', 'LIKE', "%{$subjectName}%")->first();
        if (! $subject) {
            $subject = Subject::firstOrCreate(
                ['slug' => Str::slug($subjectName)],
                ['name' => $subjectName]
            );
        }

        $topic = null;
        if ($topicName) {
            $topic = Topic::where('subject_id', $subject->id)
                ->where('name', 'LIKE', "%{$topicName}%")
                ->first();

            if (! $topic) {
                $topic = Topic::firstOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'slug' => Str::slug($topicName),
                    ],
                    [
                        'name' => $topicName,
                    ]
                );
            }
        }

        // Format options
        $options = $data['options'] ?? [];
        if (! is_array($options)) {
            $options = [];
        }

        return Question::create([
            'user_id' => $userId,
            'subject_id' => $subject->id,
            'topic_id' => $topic?->id,
            'question_text' => $data['question_text'] ?? '',
            'code_snippet' => $data['code_snippet'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'options' => $options,
            'correct_option' => strtoupper(trim((string) ($data['correct_option'] ?? 'A'))),
            'explanation' => $data['explanation'] ?? null,
            'difficulty' => in_array($data['difficulty'] ?? '', ['easy', 'medium', 'hard']) ? $data['difficulty'] : 'medium',
            'source' => $source,
        ]);
    }

    /**
     * Ensure the result is an array of questions.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeQuestionsResult(array $result): array
    {
        if (isset($result['question_text'])) {
            return [$result];
        }

        if (isset($result['questions']) && is_array($result['questions'])) {
            return $result['questions'];
        }

        return array_values($result);
    }
}
