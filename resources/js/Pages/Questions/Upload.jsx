import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    UploadCloud,
    FileText,
    Sparkles,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Save,
    RefreshCw,
    Edit3,
    Plus,
    Code,
    HelpCircle
} from 'lucide-react';

export default function Upload({ subjects }) {
    const [activeTab, setActiveTab] = useState('image'); // 'image', 'text', 'generate'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    // Form states
    const [rawText, setRawText] = useState('');
    const [generateTopic, setGenerateTopic] = useState('Database Indexing & B-Trees');
    const [generateCount, setGenerateCount] = useState(3);
    const [generateDifficulty, setGenerateDifficulty] = useState('medium');

    // Handle Image Upload & Gemini Extraction
    const handleImageSubmit = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(route('questions.extract-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
                setUploadedImageUrl(res.data.image_url);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'ছবি থেকে প্রশ্ন বিশ্লেষণ করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    // Handle Text Paste Extraction
    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!rawText.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(route('questions.extract-text'), {
                text: rawText,
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'টেক্সট থেকে প্রশ্ন বিশ্লেষণ করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    // Handle AI Question Generation
    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        if (!generateTopic.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(route('questions.generate-ai'), {
                topic: generateTopic,
                count: generateCount,
                difficulty: generateDifficulty,
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    // Update field of an extracted question
    const handleQuestionChange = (index, field, value) => {
        const updated = [...extractedQuestions];
        updated[index][field] = value;
        setExtractedQuestions(updated);
    };

    // Update an option of a question
    const handleOptionChange = (qIndex, optKey, value) => {
        const updated = [...extractedQuestions];
        if (!updated[qIndex].options) {
            updated[qIndex].options = {};
        }
        updated[qIndex].options[optKey] = value;
        setExtractedQuestions(updated);
    };

    // Remove a question from preview
    const handleRemoveQuestion = (index) => {
        setExtractedQuestions(extractedQuestions.filter((_, i) => i !== index));
    };

    // Save all reviewed questions to database
    const handleSaveAll = () => {
        if (extractedQuestions.length === 0) return;

        router.post(route('questions.store'), {
            questions: extractedQuestions,
            source: activeTab === 'image' ? 'gemini_image' : activeTab === 'text' ? 'gemini_text' : 'gemini_generated',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                            <span>Gemini AI প্রশ্ন স্টুডিও (Smart Extractor)</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            ছবি, টেক্সট থেকে স্বয়ংক্রিয়ভাবে প্রশ্ন বের করুন অথবা AI দিয়ে যেকোনো আইটি টপিকে নতুন প্রশ্ন জেনারেট করুন।
                        </p>
                    </div>

                    {extractedQuestions.length > 0 && (
                        <button
                            onClick={handleSaveAll}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.02]"
                        >
                            <Save className="w-4 h-4" />
                            <span>সবগুলো ডাটাবেসে সেভ করুন ({extractedQuestions.length})</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Gemini AI প্রশ্ন স্টুডিও" />

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Selection Tabs */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl mb-8">
                <div className="flex border-b border-slate-700/80 mb-6 gap-2 sm:gap-6">
                    <button
                        onClick={() => { setActiveTab('image'); setError(null); }}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                            activeTab === 'image'
                                ? 'border-purple-500 text-purple-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>১. ছবি আপলোড (OCR / Vision)</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('text'); setError(null); }}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                            activeTab === 'text'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>২. টেক্সট পেস্ট (Text Parsing)</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('generate'); setError(null); }}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                            activeTab === 'generate'
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>৩. AI দিয়ে নতুন প্রশ্ন তৈরি</span>
                    </button>
                </div>

                {/* Tab 1: Image Upload Form */}
                {activeTab === 'image' && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-8 text-center bg-slate-900/40 transition">
                            <UploadCloud className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                            <h4 className="text-base font-semibold text-white mb-1">
                                প্রশ্নপত্রের বা বইয়ের ছবি আপলোড করুন
                            </h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                                PNG, JPG, JPEG (সর্বোচ্চ ১০ এমবি)। Gemini 3.8 Flash স্বয়ংক্রিয়ভাবে ছবি স্ক্যান করে প্রশ্ন, কোড ও অপশনসমূহ এক্সট্র্যাক্ট করবে।
                            </p>
                            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold cursor-pointer shadow-md shadow-purple-500/20 transition">
                                <span>ছবি বাছাই করুন</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSubmit}
                                    disabled={loading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* Tab 2: Raw Text Extraction */}
                {activeTab === 'text' && (
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                পরীক্ষার প্রশ্ন বা বইয়ের টেক্সট এখানে পেস্ট করুন:
                            </label>
                            <textarea
                                rows={6}
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="উদাহরণ: 1. Which data structure is used in Breadth First Search (BFS)? A) Stack B) Queue C) Priority Queue D) Tree. Answer: B. Explanation: BFS uses a Queue (FIFO) to explore nodes level by level..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !rawText.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Gemini দিয়ে এক্সট্র্যাক্ট করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab 3: AI Question Generator */}
                {activeTab === 'generate' && (
                    <form onSubmit={handleGenerateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    আইটি টপিক বা বিষয়ের নাম:
                                </label>
                                <input
                                    type="text"
                                    value={generateTopic}
                                    onChange={(e) => setGenerateTopic(e.target.value)}
                                    placeholder="e.g. B-Trees and Indexing, TCP Handshake, Docker Containers, Deadlocks"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    প্রশ্নের সংখ্যা:
                                </label>
                                <select
                                    value={generateCount}
                                    onChange={(e) => setGenerateCount(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                                >
                                    <option value={1}>১টি প্রশ্ন</option>
                                    <option value={3}>৩টি প্রশ্ন</option>
                                    <option value={5}>৫টি প্রশ্ন</option>
                                    <option value={10}>১০টি প্রশ্ন</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-400">কঠিনতার মাত্রা:</span>
                                {['easy', 'medium', 'hard'].map((diff) => (
                                    <label key={diff} className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="difficulty"
                                            value={diff}
                                            checked={generateDifficulty === diff}
                                            onChange={() => setGenerateDifficulty(diff)}
                                            className="text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                                        />
                                        <span className="capitalize">{diff === 'easy' ? 'সহজ' : diff === 'medium' ? 'মাঝারি' : 'কঠিন'}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !generateTopic.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>নতুন প্রশ্ন জেনারেট করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="mt-6 p-6 rounded-xl bg-slate-900/60 border border-slate-700/60 text-center animate-pulse">
                        <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto animate-spin mb-2" />
                        <h5 className="font-semibold text-slate-200">Gemini AI বিশ্লেষণ করছে...</h5>
                        <p className="text-xs text-slate-400 mt-1">
                            প্রশ্ন, অপশন, কোড স্নিপেট এবং ব্যাখ্যা স্ট্রাকচার্ড ফরম্যাটে প্রসেস করা হচ্ছে।
                        </p>
                    </div>
                )}
            </div>

            {/* Extracted Questions Review & Save Section */}
            {extractedQuestions.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span>এক্সট্র্যাক্ট করা প্রশ্নসমূহ ({extractedQuestions.length})</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                প্রয়োজন অনুযায়ী এডিট করুন, সঠিক উত্তর ও ব্যাখ্যা চেক করুন এবং সেভ করুন।
                            </p>
                        </div>

                        <button
                            onClick={handleSaveAll}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition"
                        >
                            <Save className="w-4 h-4" />
                            <span>সবগুলো ডাটাবেসে সেভ করুন</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {extractedQuestions.map((q, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl relative group"
                            >
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={q.subject_name || ''}
                                                onChange={(e) => handleQuestionChange(idx, 'subject_name', e.target.value)}
                                                placeholder="বিষয় (Subject)"
                                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={q.topic_name || ''}
                                                onChange={(e) => handleQuestionChange(idx, 'topic_name', e.target.value)}
                                                placeholder="টপিক (Topic)"
                                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(idx)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                        title="প্রশ্নটি বাদ দিন"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Question Text Input */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                                        প্রশ্নের বিবরণ:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.question_text || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-medium focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Code Snippet (if applicable) */}
                                {q.code_snippet !== undefined && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                                            <Code className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>প্রোগ্রামিং কোড স্নিপেট (ঐচ্ছিক):</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={q.code_snippet || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'code_snippet', e.target.value)}
                                            placeholder="Paste code snippet if present..."
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                )}

                                {/* Options Grid (A, B, C, D) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <div
                                            key={opt}
                                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                                q.correct_option?.toUpperCase() === opt
                                                    ? 'bg-emerald-500/10 border-emerald-500/40'
                                                    : 'bg-slate-900/60 border-slate-700/60'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(idx, 'correct_option', opt)}
                                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                                    q.correct_option?.toUpperCase() === opt
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                                title="সঠিক উত্তর হিসেবে নির্বাচন করুন"
                                            >
                                                {opt}
                                            </button>
                                            <input
                                                type="text"
                                                value={q.options?.[opt] || ''}
                                                onChange={(e) => handleOptionChange(idx, opt, e.target.value)}
                                                placeholder={`অপশন ${opt}`}
                                                className="w-full bg-transparent border-0 p-0 text-xs text-slate-200 focus:ring-0 focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>সঠিক উত্তরের ব্যাখ্যা (Explanation):</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.explanation || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
