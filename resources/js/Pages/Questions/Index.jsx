import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    Search,
    Filter,
    UploadCloud,
    Trash2,
    Code,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function Index({ questions, subjects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [selectedTopic, setSelectedTopic] = useState(filters.topic_id || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters.difficulty || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('questions.index'),
            {
                search,
                subject_id: selectedSubject,
                topic_id: selectedTopic,
                difficulty: selectedDifficulty,
                type: selectedType,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedSubject('');
        setSelectedTopic('');
        setSelectedDifficulty('');
        setSelectedType('');
        router.get(route('questions.index'));
    };

    const handleDelete = (id) => {
        if (confirm('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?')) {
            router.delete(route('questions.destroy', id));
        }
    };

    const availableTopics = selectedSubject
        ? subjects.find((s) => String(s.id) === String(selectedSubject))?.topics || []
        : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-amber-400" />
                            <span>আইটি প্রশ্নভাণ্ডার (Question Bank)</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            মোট {questions.total} টি প্রশ্ন সংরক্ষিত রয়েছে।
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('questions.practice')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>প্র্যাকটিস শুরু</span>
                        </Link>

                        <Link
                            href={route('questions.upload')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>AI দিয়ে প্রশ্ন যোগ</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="প্রশ্নব্যাংক - IT Exam Prep" />

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="প্রশ্ন, ব্যাখ্যা বা কোড খুঁজুন..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">সকল ফরম্যাট (All)</option>
                            <option value="mcq">শুধু MCQ</option>
                            <option value="written">শুধু লিখিত (Written)</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value);
                                setSelectedTopic('');
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">সকল বিষয়</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            disabled={!selectedSubject || availableTopics.length === 0}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                        >
                            <option value="">সকল টপিক</option>
                            {availableTopics.map((top) => (
                                <option key={top.id} value={top.id}>
                                    {top.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">সকল লেভেল</option>
                            <option value="easy">সহজ</option>
                            <option value="medium">মাঝারি</option>
                            <option value="hard">কঠিন</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition"
                        >
                            ফিল্টার
                        </button>
                    </div>
                </div>
            </form>

            {/* Questions Grid */}
            {questions.data.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-800/80 border border-slate-700">
                    <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        আপনার সার্চ অনুযায়ী কোনো প্রশ্ন মেলেনি। অন্য কি-ওয়ার্ড বা বিষয় বাছাই করুন।
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                    >
                        ফিল্টার রিসেট করুন
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.data.map((q, idx) => {
                        const isExpanded = expandedQuestionId === q.id;
                        const isWritten = q.type === 'written';

                        return (
                            <div
                                key={q.id}
                                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 shadow-md transition"
                            >
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                            isWritten
                                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                        }`}>
                                            {isWritten ? `লিখিত (${q.marks || 5} মার্কস)` : 'MCQ'}
                                        </span>

                                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                                            {q.subject?.name}
                                        </span>
                                        {q.topic && (
                                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs font-medium">
                                                {q.topic.name}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase text-[10px] font-semibold">
                                            {q.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
                                            title="ব্যাখ্যা / মডেল উত্তর দেখুন"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                            title="মুছে ফেলুন"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-base font-semibold text-slate-100 mb-3">
                                    {q.question_text}
                                </h3>

                                {q.code_snippet && (
                                    <div className="mb-3 p-3 rounded-xl bg-slate-950 border border-slate-700/60 font-mono text-xs text-emerald-300 overflow-x-auto">
                                        <pre>{q.code_snippet}</pre>
                                    </div>
                                )}

                                {/* If Written: show preview banner, else show MCQ options */}
                                {isWritten ? (
                                    <div className="mb-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>লিখিত প্রশ্নটির আদর্শ মডেল উত্তর ডাটাবেসে সেভ আছে।</span>
                                        </div>
                                        <button
                                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                                        >
                                            {isExpanded ? 'লুকান' : 'মডেল উত্তর দেখুন'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                        {Object.entries(q.options || {}).map(([key, val]) => (
                                            <div
                                                key={key}
                                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                                                    key.toUpperCase() === (q.correct_option || '').toUpperCase()
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                                                        : 'bg-slate-900/40 border-slate-700/60 text-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`w-5 h-5 rounded font-bold flex items-center justify-center text-[10px] shrink-0 ${
                                                        key.toUpperCase() === (q.correct_option || '').toUpperCase()
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {key}
                                                </span>
                                                <span>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Expanded Area for Model Answer and/or Explanation */}
                                {isExpanded && (
                                    <div className="mt-3 space-y-3">
                                        {isWritten && q.written_answer && (
                                            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200">
                                                <span className="font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>মডেল সমাধান ও লিখিত উত্তর:</span>
                                                </span>
                                                <div className="font-mono whitespace-pre-wrap leading-relaxed text-slate-200">
                                                    {q.written_answer}
                                                </div>
                                            </div>
                                        )}

                                        {q.explanation && (
                                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                                                <span className="font-semibold text-indigo-400 block mb-1">
                                                    {isWritten ? 'অতিরিক্ত ব্যাখ্যা বা নোট:' : 'সঠিক উত্তরের ব্যাখ্যা:'}
                                                </span>
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {questions.links && questions.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-1.5">
                    {questions.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                link.active
                                    ? 'bg-indigo-600 text-white'
                                    : link.url
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'text-slate-600 cursor-not-allowed'
                            }`}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
