import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    FileText,
    ArrowLeft,
    Clock,
    ShieldCheck,
    Sparkles,
    BookOpen,
    Layers,
    Building2,
    Calendar,
    Check,
    Filter,
} from 'lucide-react';

export default function Create({
    subjects,
    totalAvailableQuestions,
    availableExams = [],
    availableYears = [],
}) {
    const [creationMode, setCreationMode] = useState('syllabus'); // 'syllabus' or 'exam'

    const { data, setData, post, processing, errors } = useForm({
        title: 'কম্পিউটার সায়েন্স ও আইটি কাস্টম মক টেস্ট',
        creation_mode: 'syllabus',
        subject_id: '',
        subject_ids: [],
        topic_id: '',
        topic_ids: [],
        exam_name: '',
        year: '',
        type: 'mock',
        question_type: 'mcq',
        question_count: 10,
        duration_minutes: 15,
        negative_marking: 0.25,
        description: 'বাস্তব পরীক্ষার সময় ও নেগেটিভ মার্কিং স্ট্যান্ডার্ড মেনে তৈরি করা মক টেস্ট।',
    });

    const handleModeSwitch = (mode) => {
        setCreationMode(mode);
        setData((prev) => ({
            ...prev,
            creation_mode: mode,
            title:
                mode === 'exam'
                    ? 'বিগত বছরের চাকরির পরীক্ষা মক টেস্ট'
                    : 'কম্পিউটার সায়েন্স ও আইটি কাস্টম মক টেস্ট',
        }));
    };

    // Multiple Subjects Selection Toggle
    const handleSubjectToggle = (subjectId) => {
        setData((prev) => {
            const currentSubs = prev.subject_ids || [];
            let updatedSubs = [];
            if (currentSubs.includes(subjectId)) {
                updatedSubs = currentSubs.filter((id) => id !== subjectId);
            } else {
                updatedSubs = [...currentSubs, subjectId];
            }

            // Filter out topics that belong to deselected subjects
            const validTopicIds = subjects
                .filter((s) => updatedSubs.includes(s.id))
                .flatMap((s) => s.topics || [])
                .map((t) => t.id);

            const updatedTopics = (prev.topic_ids || []).filter((tId) => validTopicIds.includes(tId));

            return {
                ...prev,
                subject_ids: updatedSubs,
                topic_ids: updatedTopics,
            };
        });
    };

    const handleSelectAllSubjects = () => {
        const allSubIds = subjects.map((s) => s.id);
        setData((prev) => ({
            ...prev,
            subject_ids: prev.subject_ids.length === allSubIds.length ? [] : allSubIds,
            topic_ids: [],
        }));
    };

    // Topics available for all selected subjects
    const availableTopics = subjects
        .filter((s) => data.subject_ids?.includes(s.id))
        .flatMap((s) => (s.topics || []).map((t) => ({ ...t, subject_name: s.name })));

    const handleTopicToggle = (topicId) => {
        setData((prev) => {
            const current = prev.topic_ids || [];
            if (current.includes(topicId)) {
                return {
                    ...prev,
                    topic_ids: current.filter((id) => id !== topicId),
                };
            } else {
                return {
                    ...prev,
                    topic_ids: [...current, topicId],
                };
            }
        });
    };

    const handleSelectAllTopics = () => {
        const allIds = availableTopics.map((t) => t.id);
        setData((prev) => ({
            ...prev,
            topic_ids: prev.topic_ids.length === allIds.length ? [] : allIds,
        }));
    };

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
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Plus className="w-6 h-6 text-cyan-400" />
                            <span>নতুন কাস্টম পরীক্ষা তৈরি করুন</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            প্রশ্নের ধরন ও সংখ্যা বেছে বিষয়, টপিক বা বিগত বছরের প্রশ্ন দিয়ে পরীক্ষা তৈরি করুন।
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="কাস্টম পরীক্ষা তৈরি - IT Exam Prep" />

            <div className="max-w-3xl mx-auto">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-sm">
                    <button
                        type="button"
                        onClick={() => handleModeSwitch('syllabus')}
                        className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                            creationMode === 'syllabus'
                                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>১. বিষয় ও টপিক ভিত্তিক (Multi-Subject & Topics)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleModeSwitch('exam')}
                        className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                            creationMode === 'exam'
                                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Building2 className="w-4 h-4 text-emerald-300" />
                        <span>২. বিগত বছরের চাকরি পরীক্ষা ভিত্তিক</span>
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-6"
                >
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            প্রশ্নের ধরন:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setData((prev) => ({ ...prev, question_type: 'mcq', negative_marking: 0.25 }))}
                                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition ${data.question_type === 'mcq' ? 'bg-cyan-600/20 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                MCQ পরীক্ষা
                            </button>
                            <button
                                type="button"
                                onClick={() => setData((prev) => ({ ...prev, question_type: 'written', negative_marking: 0 }))}
                                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition ${data.question_type === 'written' ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                লিখিত পরীক্ষা
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            পরীক্ষার শিরোনাম:
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 font-medium"
                            required
                        />
                        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Mode 1: Syllabus with Multiple Subjects & Multi-Topic Selector */}
                    {creationMode === 'syllabus' && (
                        <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                            {/* Multi-Subject Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        <span>এক বা একাধিক বিষয় নির্বাচন করুন (Select Subjects):</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllSubjects}
                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline"
                                    >
                                        {data.subject_ids.length === subjects.length
                                            ? 'সব আনসিলেক্ট করুন'
                                            : 'সব বিষয় সিলেক্ট করুন (Full Syllabus)'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {subjects.map((sub) => {
                                        const isSelected = data.subject_ids.includes(sub.id);
                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => handleSubjectToggle(sub.id)}
                                                className={`p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between border ${
                                                    isSelected
                                                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                                }`}
                                            >
                                                <span className="truncate pr-2 font-medium">
                                                    {sub.name}
                                                    {typeof sub[`${data.question_type}_questions_count`] !== 'undefined' && (
                                                        <span className={`ml-1 text-[10px] ${sub[`${data.question_type}_questions_count`] > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                                                            ({sub[`${data.question_type}_questions_count`]} {data.question_type === 'written' ? 'লিখিত' : 'MCQ'})
                                                        </span>
                                                    )}
                                                </span>
                                                <div
                                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition ${
                                                        isSelected
                                                            ? 'bg-indigo-500 border-indigo-400 text-white'
                                                            : 'border-slate-700 bg-slate-900'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1.5">
                                    {data.subject_ids.length > 0 ? (
                                        <span className="text-indigo-400 font-semibold">
                                            {data.subject_ids.length}টি বিষয় নির্বাচিত হয়েছে।
                                        </span>
                                    ) : (
                                        <span>কোনো বিষয় টিক না দিলে স্বয়ংক্রিয়ভাবে সব বিষয় (পূর্ণাঙ্গ সিলেবাস) থেকে প্রশ্ন আসবে।</span>
                                    )}
                                </div>
                            </div>

                            {/* Multiple Topics Checkbox Selector (Aggregated from all selected subjects) */}
                            {data.subject_ids.length > 0 && availableTopics.length > 0 && (
                                <div className="pt-3 border-t border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                                            <Filter className="w-3.5 h-3.5" />
                                            <span>নির্দিষ্ট টপিকসমূহ বেছে নিন (ঐচ্ছিক - একাধিক বাছাই করা যাবে):</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllTopics}
                                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
                                        >
                                            {data.topic_ids.length === availableTopics.length
                                                ? 'সব আনসিলেক্ট করুন'
                                                : 'সব টপিক সিলেক্ট করুন'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                        {availableTopics.map((topic) => {
                                            const isSelected = data.topic_ids.includes(topic.id);
                                            return (
                                                <button
                                                    key={topic.id}
                                                    type="button"
                                                    onClick={() => handleTopicToggle(topic.id)}
                                                    className={`p-2 rounded-xl text-left text-xs font-medium transition flex items-center justify-between border ${
                                                        isSelected
                                                            ? 'bg-cyan-600/20 border-cyan-500 text-white'
                                                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="min-w-0 pr-2">
                                                        <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1.5">
                                                            <span className="truncate">{topic.name}</span>
                                                            {typeof topic[`${data.question_type}_questions_count`] !== 'undefined' && (
                                                                <span className={`text-[9px] px-1 rounded ${topic[`${data.question_type}_questions_count`] > 0 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                                                                    {topic[`${data.question_type}_questions_count`]} {data.question_type === 'written' ? 'লিখিত' : 'MCQ'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-slate-500 truncate">
                                                            {topic.subject_name}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition ${
                                                            isSelected
                                                                ? 'bg-cyan-500 border-cyan-400 text-black'
                                                                : 'border-slate-700 bg-slate-900'
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-2">
                                        {data.topic_ids.length > 0 ? (
                                            <span className="text-cyan-400 font-semibold">
                                                নির্দিষ্ট নির্বাচিত টপিক: {data.topic_ids.length}টি (শুধুমাত্র এই টপিকগুলো থেকেই প্রশ্ন আসবে)
                                            </span>
                                        ) : (
                                            <span>টপিক টিক না দিলে নির্বাচিত বিষয়গুলোর সব টপিক থেকে প্রশ্ন আসবে।</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mode 2: Job Exam & Year Based */}
                    {creationMode === 'exam' && (
                        <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                                <Building2 className="w-4 h-4" />
                                <span>বিগত বছরের চাকরির পরীক্ষা প্রশ্নপত্র ফিল্টার</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        পরীক্ষার নাম (Exam Name):
                                    </label>
                                    <select
                                        value={data.exam_name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            setData((prev) => ({
                                                ...prev,
                                                exam_name: name,
                                                title: name
                                                    ? `${name} বিগত বছরের প্রশ্ন মক টেস্ট`
                                                    : prev.title,
                                            }));
                                        }}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                                        required={creationMode === 'exam'}
                                    >
                                        <option value="">পরীক্ষা নির্বাচন করুন...</option>
                                        {availableExams.filter((exam) => exam.type === data.question_type).map((ex, idx) => (
                                            <option key={idx} value={ex.exam_name}>
                                                {ex.exam_name} ({ex.count}টি {data.question_type === 'written' ? 'লিখিত' : 'MCQ'} প্রশ্ন উপলব্ধ)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>পরীক্ষার সাল (ঐচ্ছিক):</span>
                                    </label>
                                    <select
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                                    >
                                        <option value="">সব সাল মিলিয়ে</option>
                                        {availableYears.filter((year) => year.type === data.question_type).map((year, idx) => (
                                            <option key={`${year.type}-${year.year}-${idx}`} value={year.year}>
                                                {year.year} সাল
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                নির্বাচিত পরীক্ষা ও সালের {data.question_type === 'written' ? 'লিখিত' : 'MCQ'} প্রশ্নগুলো নিয়ে টাইমড পরীক্ষা তৈরি হবে।
                            </p>
                        </div>
                    )}

                    {/* Question Count & Duration & Negative Marking */}
                    <div className={`grid grid-cols-1 ${data.question_type === 'written' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                প্রশ্নের সংখ্যা:
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="100"
                                value={data.question_count}
                                onChange={(e) => setData('question_count', Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                                required
                            />
                            <p className="text-[10px] text-slate-500 mt-1">৩ থেকে ১০০টি প্রশ্ন</p>
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

                        {data.question_type === 'mcq' && <div>
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
                                <option value={0.5}>০.৫০ (কঠোর)</option>
                                <option value={0.0}>০.০০ (কোনো নেগেটিভ মার্কিং নেই)</option>
                            </select>
                        </div>}
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
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>পরীক্ষা তৈরি করুন</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
