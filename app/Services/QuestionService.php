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
     * System instruction prompt for parsing IT exam questions (Both MCQ and Written).
     */
    protected function getExtractionPrompt(): string
    {
        $existingSubjects = Subject::with('topics')->get();
        if ($existingSubjects->isNotEmpty()) {
            $list = $existingSubjects->map(function ($subject) {
                return $subject->name.' (Topics: '.$subject->topics->pluck('name')->implode(', ').')';
            })->implode("\n- ");
            $subjectsGuidance = "You can align with existing subjects or create clean new ones:\n- {$list}";
        } else {
            $subjectsGuidance = "Intelligently determine the standard Computer Science / IT Subject (e.g. 'Database Management Systems (DBMS)', 'Operating Systems', 'Digital Logic Design', 'Artificial Intelligence', 'Computer Networks', 'Data Structures & Algorithms', etc.) and the specific Topic (e.g. 'Indexing & B-Trees', 'Deadlocks', 'Boolean Algebra & K-Maps', 'Neural Networks', etc.).";
        }

        return <<<PROMPT
You are an expert Computer Science Professor and IT Competitive Exam Question Extractor.
Analyze the provided text or image carefully. Questions can be EITHER:
1. "mcq" (Multiple Choice Questions with options A, B, C, D)
2. "written" (Descriptive questions, Code writing, SQL queries, System design, Mathematical derivations, or Theoretical explanations)

For each question:
- Automatically detect whether it is "mcq" or "written".
- If code is part of the problem statement, isolate it in `code_snippet`.
- Check if any Competitive Exam name (e.g., "43rd BCS", "Sonali Bank Senior Officer IT", "BPSC Assistant Programmer", "Combined 8 Banks IT Officer", "Pubali Bank", "Agrani Bank", etc.) and Year (e.g., "2023", "2022", "2021") are mentioned in the question paper, header, watermark, or text.
- Intelligently categorize the Subject (`subject_name`) and Topic (`topic_name`) based on standard academic Computer Science curriculum:
{$subjectsGuidance}

Return a valid JSON array of objects following this schema:
[
  {
    "type": "mcq or written",
    "marks": 1 for mcq (or 5, 10 for written based on difficulty/length),
    "exam_name": "Exam name if mentioned or inferred, else null",
    "year": "Exam year if mentioned or inferred (e.g., 2023), else null",
    "question_text": "Clean question statement without options or code",
    "code_snippet": "Optional code snippet from question statement, else null",
    "options": {
      "A": "Option text A",
      "B": "Option text B",
      "C": "Option text C",
      "D": "Option text D"
    } // (for mcq only, MUST be null for written),
    "correct_option": "A or B or C or D" // (for mcq only, MUST be null for written),
    "written_answer": "Comprehensive model answer, complete code, SQL query, or technical solution for written questions (null for mcq)",
    "explanation": "Detailed technical explanation or marking guidelines",
    "subject_name": "Standard IT/CS Subject name (e.g., Database Management Systems, Operating Systems, Digital Logic Design, Artificial Intelligence)",
    "topic_name": "Specific Chapter/Topic name (e.g., SQL Queries, Process Scheduling, K-Maps, Neural Networks)",
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
    public function extractFromText(string $rawText, ?string $defaultExam = null, ?string $defaultYear = null): array
    {
        $context = '';
        if ($defaultExam || $defaultYear) {
            $context = "\nNote: User specified this exam is \"{$defaultExam}\" and year is \"{$defaultYear}\". Assign these if questions do not state otherwise.";
        }

        $prompt = $this->getExtractionPrompt()."{$context}\n\nHere is the raw text to extract questions from (both MCQ and Written):\n\"\"\"\n{$rawText}\n\"\"\"";

        $result = $this->gemini->generateJson($prompt);
        $questions = $this->normalizeQuestionsResult($result);

        if ($defaultExam || $defaultYear) {
            foreach ($questions as &$q) {
                if (empty($q['exam_name']) && $defaultExam) {
                    $q['exam_name'] = $defaultExam;
                }
                if (empty($q['year']) && $defaultYear) {
                    $q['year'] = $defaultYear;
                }
            }
        }

        return $questions;
    }

    /**
     * Extract questions from one or multiple uploaded images.
     *
     * @param  array<int, UploadedFile>  $images
     * @return array<int, array<string, mixed>>
     */
    public function extractFromMultipleImages(array $images, ?string $defaultExam = null, ?string $defaultYear = null): array
    {
        if (empty($images)) {
            return [];
        }

        $imagesData = [];
        foreach ($images as $img) {
            $imagesData[] = [
                'data' => base64_encode(file_get_contents($img->getRealPath())),
                'mime_type' => $img->getMimeType() ?: 'image/jpeg',
            ];
        }

        $context = '';
        if ($defaultExam || $defaultYear) {
            $context = "\nNote: User specified this exam is \"{$defaultExam}\" and year is \"{$defaultYear}\". Assign these if not stated otherwise.";
        }

        $imageCount = count($images);
        $prompt = $this->getExtractionPrompt()."{$context}\n\nExtract all questions (both MCQ and Written) shown across these {$imageCount} exam paper pages or book images.";

        $result = $this->gemini->extractFromMultipleImages($imagesData, $prompt, true);

        if (! is_array($result)) {
            throw new RuntimeException('Gemini did not return an array from the images.');
        }

        $questions = $this->normalizeQuestionsResult($result);

        if ($defaultExam || $defaultYear) {
            foreach ($questions as &$q) {
                if (empty($q['exam_name']) && $defaultExam) {
                    $q['exam_name'] = $defaultExam;
                }
                if (empty($q['year']) && $defaultYear) {
                    $q['year'] = $defaultYear;
                }
            }
        }

        return $questions;
    }

    /**
     * Extract questions from an uploaded image.
     *
     * @return array<int, array<string, mixed>>
     */
    public function extractFromImage(UploadedFile $image, ?string $defaultExam = null, ?string $defaultYear = null): array
    {
        return $this->extractFromMultipleImages([$image], $defaultExam, $defaultYear);
    }

    /**
     * Generate fresh questions using Gemini for a given topic or subject.
     *
     * @return array<int, array<string, mixed>>
     */
    public function generateQuestions(string $topicOrSubject, int $count = 3, string $difficulty = 'medium', string $type = 'mcq'): array
    {
        $typeInstruction = $type === 'written'
            ? 'Generate high-quality WRITTEN IT exam questions (e.g., write efficient code, write SQL query, explain internal mechanism, or design architecture) with complete model answers in `written_answer`.'
            : 'Generate high-quality multiple choice MCQ questions with 4 options and correct answer.';

        $prompt = $this->getExtractionPrompt()."\n\nTask: {$typeInstruction} on \"{$topicOrSubject}\" with difficulty \"{$difficulty}\". Generate {$count} questions.";

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

        $type = in_array($data['type'] ?? '', ['mcq', 'written']) ? $data['type'] : 'mcq';
        $options = $type === 'mcq' && is_array($data['options'] ?? null) ? $data['options'] : null;
        $correctOption = $type === 'mcq' && ! empty($data['correct_option']) ? strtoupper(trim((string) $data['correct_option'])) : null;
        $writtenAnswer = $type === 'written' ? ($data['written_answer'] ?? $data['explanation'] ?? null) : null;
        $marks = (int) ($data['marks'] ?? ($type === 'written' ? 5 : 1));
        $examName = ! empty($data['exam_name']) ? trim((string) $data['exam_name']) : null;
        $year = ! empty($data['year']) ? trim((string) $data['year']) : null;

        return Question::create([
            'user_id' => $userId,
            'subject_id' => $subject->id,
            'topic_id' => $topic?->id,
            'type' => $type,
            'marks' => $marks,
            'exam_name' => $examName,
            'year' => $year,
            'question_text' => $data['question_text'] ?? '',
            'code_snippet' => $data['code_snippet'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'options' => $options,
            'correct_option' => $correctOption,
            'written_answer' => $writtenAnswer,
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
