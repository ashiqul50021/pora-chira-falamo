import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, FileText, ArrowLeft, Clock, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export default function Create({ subjects, totalAvailableQuestions }) {
    const { data, setData, post, processing, errors } = useForm({
        title: 'কম্পিউটার সায়েন্স ও আইটি ফুল মক টেস্ট',
        subject_id: '',
        topic_id: '',
        type: 'mock',
        question_count: 10,
        duration_minutes: 15,
        negative_marking: 0.25,
        description: 'বাস্তব চাকরির পরীক্ষার সময় ও নেগেটিভ মার্কিং স্ট্যান্ডার্ড মেনে তৈরি করা মক টেস্ট।',
    });

    const selectedSubjectObj = subjects.find((s) => String(s.id) === String(data.subject_id));
    const availableTopics = selectedSubjectObj?.topics || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('quizzes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('quizzes.index')}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Plus className="w-6 h-6 text-cyan-400" />
                            <span>নতুন কাস্টম মক টেস্ট তৈরি করুন</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            নির্দিষ্ট বিষয় বা পূর্ণাঙ্গ সিলেবাস থেকে প্রশ্ন বাছাই করে পরীক্ষা সাজান।
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="মক টেস্ট তৈরি - IT Exam Prep" />

            <div className="max-w-2xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-5"
                >
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            মক টেস্টের শিরোনাম:
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                            required
                        />
                        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Subject & Topic Select */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                বিষয় নির্বাচন (Subject):
                            </label>
                            <select
                                value={data.subject_id}
                                onChange={(e) => {
                                    setData((prev) => ({
                                        ...prev,
                                        subject_id: e.target.value,
                                        topic_id: '',
                                    }));
                                }}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">সবগুলো বিষয় (Full Mock)</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                নির্দিষ্ট টপিক (ঐচ্ছিক):
                            </label>
                            <select
                                value={data.topic_id}
                                onChange={(e) => setData('topic_id', e.target.value)}
                                disabled={!data.subject_id || availableTopics.length === 0}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                            >
                                <option value="">সব টপিক থেকে</option>
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Question Count & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                প্রশ্নের সংখ্যা:
                            </label>
                            <select
                                value={data.question_count}
                                onChange={(e) => setData('question_count', Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                            >
                                <option value={5}>৫টি প্রশ্ন</option>
                                <option value={10}>১০টি প্রশ্ন</option>
                                <option value={15}>১৫টি প্রশ্ন</option>
                                <option value={20}>২০টি প্রশ্ন</option>
                                <option value={30}>৩০টি প্রশ্ন</option>
                            </select>
                            {errors.question_count && (
                                <p className="text-xs text-rose-400 mt-1">{errors.question_count}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span>সময়সীমা (মিনিট):</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                                <span>নেগেটিভ মার্কিং:</span>
                            </label>
                            <select
                                value={data.negative_marking}
                                onChange={(e) => setData('negative_marking', Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                            >
                                <option value={0.25}>০.২৫ (স্ট্যান্ডার্ড)</option>
                                <option value={0.50}>০.৫০ (কঠোর)</option>
                                <option value={0.0}>০.০০ (কোনো নেগেটিভ মার্কিং নেই)</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            বিবরণ বা নোট (ঐচ্ছিক):
                        </label>
                        <textarea
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Link
                            href={route('quizzes.index')}
                            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition"
                        >
                            বাতিল
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                        >
                            <span>মক টেস্ট শুরু করুন</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
