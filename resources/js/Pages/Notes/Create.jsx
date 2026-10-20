import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    Library,
    Sparkles,
    ArrowLeft,
    Save,
    RefreshCw,
    Plus,
    X,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react';

export default function Create({ subjects }) {
    const [generatingAi, setGeneratingAi] = useState(false);
    const [aiTopicInput, setAiTopicInput] = useState('');
    const [aiSubjectInput, setAiSubjectInput] = useState('');
    const [aiError, setAiError] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
        topic_id: '',
        title: '',
        summary: '',
        content: '',
        key_points: ['', '', ''],
        read_time_minutes: 5,
    });

    const activeSubject = subjects.find((s) => String(s.id) === String(data.subject_id));
    const availableTopics = activeSubject?.topics || [];

    const handleKeyPointChange = (index, value) => {
        const updated = [...data.key_points];
        updated[index] = value;
        setData('key_points', updated);
    };

    const handleAddKeyPoint = () => {
        setData('key_points', [...data.key_points, '']);
    };

    const handleRemoveKeyPoint = (index) => {
        const updated = data.key_points.filter((_, i) => i !== index);
        setData('key_points', updated);
    };

    const handleGenerateWithAi = async () => {
        if (!aiTopicInput.trim()) {
            setAiError('অনুগ্রহ করে টপিকের নাম লিখুন।');
            return;
        }

        setGeneratingAi(true);
        setAiError(null);

        try {
            const res = await axios.post(route('notes.generate-ai'), {
                topic: aiTopicInput.trim(),
                subject: aiSubjectInput.trim() || activeSubject?.name,
            });

            if (res.data?.success && res.data?.data) {
                const generated = res.data.data;
                setData({
                    ...data,
                    title: generated.title || aiTopicInput,
                    summary: generated.summary || '',
                    content: generated.content || '',
                    key_points: Array.isArray(generated.key_points) && generated.key_points.length > 0
                        ? generated.key_points
                        : data.key_points,
                    read_time_minutes: generated.read_time_minutes || 5,
                });
            }
        } catch (err) {
            setAiError(err.response?.data?.message || 'AI জেনারেশন ব্যর্থ হয়েছে। পরে চেষ্টা করুন।');
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('notes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('notes.index')}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <span>নতুন স্টাডি নোট / লেকচার শিট তৈরি</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Gemini AI দিয়ে সরাসরি এক্সাম লেকচার নোট জেনারেট করুন অথবা নিজে লিখুন।
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="নতুন স্টাডি নোট তৈরি - IT Exam Prep" />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* 1. Gemini AI Instant Generator Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 shadow-xl">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <span>Gemini AI স্টাডি নোট জেনারেটর (এক ক্লিকে পূর্ণাঙ্গ লেকচার শিট)</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        আপনি যে টপিকের ওপর পড়তে চান তার নাম লিখুন (যেমন: *Normalization in DBMS, Deadlock, OSI Layers, B-Tree, TCP Handshake* ইত্যাদি)। AI স্বয়ংক্রিয়ভাবে পয়েন্ট, টেবিল ও কোড সহ সম্পূর্ণ নোট প্রস্তুত করে দেবে।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                        <div className="sm:col-span-8">
                            <input
                                type="text"
                                value={aiTopicInput}
                                onChange={(e) => setAiTopicInput(e.target.value)}
                                placeholder="টপিকের নাম লিখুন (যেমন: Process Scheduling Algorithms in OS)..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <button
                                type="button"
                                onClick={handleGenerateWithAi}
                                disabled={generatingAi}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                            >
                                {generatingAi ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>নোট তৈরি হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>AI দিয়ে জেনারেট করুন</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {aiError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{aiError}</span>
                        </div>
                    )}
                </div>

                {/* 2. Note Edit & Save Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                    <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>নোটের বিস্তারিত তথ্য পর্যালোচনা ও সংরক্ষণ</span>
                    </h2>

                    {/* Subject & Topic Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                বিষয় (Subject) <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={data.subject_id}
                                onChange={(e) => {
                                    setData({
                                        ...data,
                                        subject_id: e.target.value,
                                        topic_id: '',
                                    });
                                }}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                            >
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                            {errors.subject_id && <p className="text-xs text-rose-400 mt-1">{errors.subject_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                নির্দিষ্ট টপিক (ঐচ্ছিক)
                            </label>
                            <select
                                value={data.topic_id}
                                onChange={(e) => setData('topic_id', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">টপিক নির্বাচন করুন (বা নতুন রাখুন)</option>
                                {availableTopics.map((top) => (
                                    <option key={top.id} value={top.id}>
                                        {top.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            নোটের শিরোনাম (Title) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="যেমন: OSI ৭-লেয়ার মডেল: কার্যপ্রণালী ও প্রটোকল সামারি"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            সংক্ষিপ্ত সারসংক্ষেপ (Summary)
                        </label>
                        <textarea
                            rows={2}
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            placeholder="টপিকটির ২-৩ লাইনের সংক্ষিপ্ত বর্ণনা..."
                            className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                        />
                    </div>

                    {/* Key Takeaways */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-300">
                                গুরুত্বপূর্ণ পয়েন্টসমূহ (Key Takeaways / Cheat Sheet Points)
                            </label>
                            <button
                                type="button"
                                onClick={handleAddKeyPoint}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>পয়েন্ট যোগ করুন</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {data.key_points.map((pt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={pt}
                                        onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                                        placeholder={`পয়েন্ট #${idx + 1}...`}
                                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                                    />
                                    {data.key_points.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveKeyPoint(idx)}
                                            className="p-2 text-slate-500 hover:text-rose-400 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content (Markdown) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            মূল লেকচার কন্টেন্ট (Markdown সমর্থিত) <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                            rows={14}
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="## ১. ভূমিকা...
* গুরুত্বপূর্ণ পয়েন্ট...
| তুলনা টেবিল | বিষয় |
```c
int a = 10;
```"
                            className="w-full p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500 leading-relaxed"
                        />
                        {errors.content && <p className="text-xs text-rose-400 mt-1">{errors.content}</p>}
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <Link
                            href={route('notes.index')}
                            className="text-xs text-slate-400 hover:text-white transition font-medium"
                        >
                            বাতিল করুন
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'স্টাডি নোট সংরক্ষণ করুন'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
