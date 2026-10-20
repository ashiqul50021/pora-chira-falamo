<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\StudyNote;
use App\Models\Subject;
use App\Models\Topic;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudyNoteController extends Controller
{
    public function __construct(
        protected GeminiService $gemini
    ) {}

    /**
     * Display a listing of study notes with search and filters.
     */
    public function index(Request $request): Response
    {
        $query = StudyNote::with(['subject', 'topic', 'user'])
            ->where('is_published', true)
            ->latest();

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        if ($request->filled('topic_id')) {
            $query->where('topic_id', $request->input('topic_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('summary', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        $notes = $query->paginate(9)->withQueryString();
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id', 'topic_id', 'search']),
        ]);
    }

    /**
     * Display a single study note.
     */
    public function show(StudyNote $note): Response
    {
        $note->increment('views_count');
        $note->load(['subject', 'topic', 'user']);

        // Related notes
        $relatedNotes = StudyNote::where('id', '!=', $note->id)
            ->where('subject_id', $note->subject_id)
            ->where('is_published', true)
            ->take(3)
            ->get();

        // Practice questions count for this topic or subject
        $questionQuery = Question::query();
        if ($note->topic_id) {
            $questionQuery->where('topic_id', $note->topic_id);
        } else {
            $questionQuery->where('subject_id', $note->subject_id);
        }
        $availableQuestionsCount = $questionQuery->count();

        return Inertia::render('Notes/Show', [
            'note' => $note,
            'relatedNotes' => $relatedNotes,
            'availableQuestionsCount' => $availableQuestionsCount,
        ]);
    }

    /**
     * Show form to create a new study note or generate one with AI.
     */
    public function create(): Response
    {
        $subjects = Subject::with('topics')->get();

        return Inertia::render('Notes/Create', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Generate an in-depth, exam-oriented study lecture sheet using Gemini AI.
     */
    public function generateAi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|min:2|max:150',
            'subject' => 'nullable|string|max:100',
        ]);

        $topic = $validated['topic'];
        $subject = $validated['subject'] ?? 'Computer Science & Engineering';

        $prompt = <<<PROMPT
You are a distinguished Computer Science Professor and author of top-tier Competitive IT Exam preparation books (like BCS, Bank IT Officer, BPSC Assistant Programmer, GATE CS).

Create an authoritative, highly comprehensive, crystal-clear, and exam-focused Study Note / Lecture Sheet for the topic: "{$topic}" under the subject: "{$subject}".

The response MUST be valid JSON matching this schema:
{
  "title": "Clear, engaging title in Bengali (e.g., 'OSI ৭-লেয়ার মডেল: কার্যপ্রণালী ও প্রটোকল')",
  "summary": "A concise 2-3 sentence overview highlighting what and why this topic is tested in competitive exams (in Bengali).",
  "read_time_minutes": 5,
  "key_points": [
    "Key Takeaway 1 (Exam formula / core rule)",
    "Key Takeaway 2",
    "Key Takeaway 3",
    "Key Takeaway 4"
  ],
  "content": "Rich markdown content in Bengali (with English technical terminology in brackets/code). Include:\n- Clear conceptual explanation\n- Bullet points and step-by-step mechanisms\n- ASCII or Markdown comparison tables (e.g. Big-O, Differences, Pros/Cons)\n- Real-world and code snippets if applicable (e.g., C/C++/Java/Python/SQL)\n- Common Exam Pitfalls & Viva Questions"
}

Respond ONLY with the JSON object. Do not wrap in markdown quotes or preamble.
PROMPT;

        try {
            $rawResponse = $this->gemini->generateText($prompt);
            $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawResponse));
            $data = json_decode($cleanJson, true);

            if (! is_array($data) || empty($data['title'])) {
                throw new \Exception('Failed to parse AI response into structured note.');
            }

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI লেকচার নোট জেনারেট করতে সমস্যা হয়েছে: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Store a newly created study note.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'key_points' => 'nullable|array',
            'key_points.*' => 'nullable|string|max:255',
            'read_time_minutes' => 'nullable|integer|min:1|max:60',
        ]);

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readTime = $validated['read_time_minutes'] ?? max(2, (int) ceil($wordCount / 120));

        // Filter empty key points
        $keyPoints = array_values(array_filter($validated['key_points'] ?? [], fn ($p) => ! empty(trim($p))));

        $note = StudyNote::create([
            'user_id' => $request->user()?->id,
            'subject_id' => $validated['subject_id'],
            'topic_id' => $validated['topic_id'] ?? null,
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'key_points' => $keyPoints,
            'read_time_minutes' => $readTime,
            'is_published' => true,
        ]);

        return redirect()->route('notes.show', $note)
            ->with('success', 'নতুন স্টাডি নোট সফলভাবে তৈরি হয়েছে!');
    }

    /**
     * Delete a study note.
     */
    public function destroy(StudyNote $note): RedirectResponse
    {
        $note->delete();

        return redirect()->route('notes.index')
            ->with('success', 'স্টাডি নোটটি ডিলিট করা হয়েছে।');
    }
}
