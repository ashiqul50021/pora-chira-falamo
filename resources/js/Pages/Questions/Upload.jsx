import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
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
    Code,
    HelpCircle,
    ArrowRight,
    Sliders,
    Layers
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

    const handleQuestionChange = (index, field, value) => {
        const updated = [...extractedQuestions];
        updated[index][field] = value;
        setExtractedQuestions(updated);
    };

    const handleOptionChange = (qIndex, optKey, value) => {
        const updated = [...extractedQuestions];
        if (!updated[qIndex].options) {
            updated[qIndex].options = {};
        }
        updated[qIndex].options[optKey] = value;
        setExtractedQuestions(updated);
    };

    const handleRemoveQuestion = (index) => {
        setExtractedQuestions(extractedQuestions.filter((_, i) => i !== index));
    };

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
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>প্রশ্ন আপলোড ও এআই স্টুডিও</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            ছবি বা বইয়ের টেক্সট থেকে স্বয়ংক্রিয়ভাবে প্রশ্ন বের করুন অথবা সিলেবাস টপিক থেকে নতুন প্রশ্ন তৈরি করুন।
                        </p>
                    </div>

                    {extractedQuestions.length > 0 && (
                        <button
                            onClick={handleSaveAll}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                        >
                            <Save className="w-4 h-4" />
                            <span>সবগুলো ডাটাবেসে সেভ করুন ({extractedQuestions.length})</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="AI স্টুডিও - IT Exam Prep" />

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Options Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm mb-8">
                {/* Clean Segmented Tab Control */}
                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-lg mb-6">
                    <button
                        onClick={() => { setActiveTab('image'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'image'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>১. ছবি আপলোড (OCR)</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('text'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'text'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>২. টেক্সট পেস্ট</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('generate'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'generate'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>৩. নতুন প্রশ্ন জেনারেট</span>
                    </button>
                </div>

                {/* Tab 1: Image Upload */}
                {activeTab === 'image' && (
                    <div className="border border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-8 text-center bg-slate-900/40 transition">
                        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
                        <h4 className="text-sm font-semibold text-white mb-1">
                            প্রশ্নপত্র বা বইয়ের পাতার ছবি ড্রপ করুন
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                            PNG, JPG, JPEG ফরম্যাট সমর্থিত। Gemini Vision স্বয়ংক্রিয়ভাবে প্রশ্ন, কোড ও অপশনসমূহ ডিটেক্ট করবে।
                        </p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition">
                            <span>কম্পিউটার থেকে ছবি ব্রাউজ করুন</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSubmit}
                                disabled={loading}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {/* Tab 2: Text Paste */}
                {activeTab === 'text' && (
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                যেকোনো অগোছালো প্রশ্ন টেক্সট এখানে পেস্ট করুন:
                            </label>
                            <textarea
                                rows={5}
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="1. What is an index in SQL? A) A pointer B) A table C) A key D) None. Correct: A. Explanation..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !rawText.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Gemini দিয়ে প্রসেস করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab 3: AI Question Generator */}
                {activeTab === 'generate' && (
                    <form onSubmit={handleGenerateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    আইটি টপিক বা বিষয়ের নাম:
                                </label>
                                <input
                                    type="text"
                                    value={generateTopic}
                                    onChange={(e) => setGenerateTopic(e.target.value)}
                                    placeholder="e.g. B-Trees and Indexing, Linux Semaphore, TCP 3-Way Handshake"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    প্রশ্নের সংখ্যা:
                                </label>
                                <select
                                    value={generateCount}
                                    onChange={(e) => setGenerateCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                >
                                    <option value={1}>১টি প্রশ্ন</option>
                                    <option value={3}>৩টি প্রশ্ন</option>
                                    <option value={5}>৫টি প্রশ্ন</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">কঠিনতার মাত্রা:</span>
                                {['easy', 'medium', 'hard'].map((diff) => (
                                    <label key={diff} className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="difficulty"
                                            value={diff}
                                            checked={generateDifficulty === diff}
                                            onChange={() => setGenerateDifficulty(diff)}
                                            className="text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                                        />
                                        <span>{diff === 'easy' ? 'সহজ' : diff === 'medium' ? 'মাঝারি' : 'কঠিন'}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !generateTopic.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>নতুন প্রশ্ন তৈরি করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="mt-5 p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <RefreshCw className="w-6 h-6 text-indigo-400 mx-auto animate-spin mb-2" />
                        <h5 className="font-semibold text-slate-200 text-xs">Gemini AI প্রশ্ন বিশ্লেষণ করছে...</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            প্রশ্ন, অপশন এবং টেকনিক্যাল ব্যাখ্যা স্ট্রাকচার্ড করা হচ্ছে।
                        </p>
                    </div>
                )}
            </div>

            {/* Extracted Questions Review Cards */}
            {extractedQuestions.length > 0 && (
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>এক্সট্র্যাক্ট করা প্রশ্নসমূহ ({extractedQuestions.length})</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                নিচের ফর্মগুলো চেক বা এডিট করে "ডাটাবেসে সেভ করুন" বাটনে ক্লিক করুন।
                            </p>
                        </div>

                        <button
                            onClick={handleSaveAll}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>সবগুলো সেভ করুন</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {extractedQuestions.map((q, idx) => (
                            <div
                                key={idx}
                                className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm"
                            >
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                            #{idx + 1}
                                        </span>
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

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(idx)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                        title="বাদ দিন"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Question Text */}
                                <div className="mb-3">
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                        প্রশ্ন:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.question_text || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Code Snippet */}
                                {q.code_snippet !== undefined && (
                                    <div className="mb-3">
                                        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <Code className="w-3 h-3 text-cyan-400" />
                                            <span>কোড স্নিপেট:</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={q.code_snippet || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'code_snippet', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                )}

                                {/* Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <div
                                            key={opt}
                                            className={`p-2 rounded-lg border flex items-center gap-2 ${
                                                q.correct_option?.toUpperCase() === opt
                                                    ? 'bg-emerald-500/10 border-emerald-500/40'
                                                    : 'bg-slate-900 border-slate-800'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(idx, 'correct_option', opt)}
                                                className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                                    q.correct_option?.toUpperCase() === opt
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-800 text-slate-400'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                            <input
                                                type="text"
                                                value={q.options?.[opt] || ''}
                                                onChange={(e) => handleOptionChange(idx, opt, e.target.value)}
                                                placeholder={`অপশন ${opt}`}
                                                className="w-full bg-transparent border-0 p-0 text-xs text-slate-200 focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                        সঠিক উত্তরের টেকনিক্যাল ব্যাখ্যা:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.explanation || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
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
