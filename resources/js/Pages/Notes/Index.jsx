import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Library,
    BookOpen,
    Clock,
    Search,
    Sparkles,
    Plus,
    Tag,
    ChevronRight,
    ArrowRight,
    Eye,
    CheckCircle2,
    Filter,
    Flame
} from 'lucide-react';

export default function Index({ notes, subjects, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters?.subject_id || '');
    const [selectedTopic, setSelectedTopic] = useState(filters?.topic_id || '');

    const handleFilterChange = (newSubject, newTopic, newSearch) => {
        router.get(
            route('notes.index'),
            {
                subject_id: newSubject !== undefined ? newSubject : selectedSubject,
                topic_id: newTopic !== undefined ? newTopic : selectedTopic,
                search: newSearch !== undefined ? newSearch : search,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(selectedSubject, selectedTopic, search);
    };

    const handleSubjectSelect = (subId) => {
        const nextSub = selectedSubject === String(subId) ? '' : String(subId);
        setSelectedSubject(nextSub);
        setSelectedTopic('');
        handleFilterChange(nextSub, '', search);
    };

    const activeSubjectObj = subjects.find((s) => String(s.id) === String(selectedSubject));
    const availableTopics = activeSubjectObj?.topics || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                            <Library className="w-6 h-6 text-cyan-400" />
                            <span>টপিকভিত্তিক লেকচার শিট ও স্টাডি নোটস</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            আইটি নিয়োগ ও বিসিএস পরীক্ষার গুরুত্বপূর্ণ টপিকগুলোর সাজানো থিওরি নোট ও রিভিশন শিট।
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('notes.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
                        >
                            <Sparkles className="w-4 h-4 text-cyan-200" />
                            <span>AI দিয়ে নোট তৈরি করুন</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="লেকচার শিট ও নোটস - IT Exam Prep" />

            {/* Search & Topic Filters Bar */}
            <div className="mb-8 space-y-4">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="যেকোনো টপিক বা কনসেপ্ট সার্চ করুন (যেমন: OSI Model, Normalization, QuickSort, Subnetting)..."
                        className="w-full pl-12 pr-28 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    >
                        সার্চ করুন
                    </button>
                </form>

                {/* Subject Pills Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => handleSubjectSelect('')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                            !selectedSubject
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        সকল বিষয় ({notes?.total || 0})
                    </button>

                    {subjects.map((sub) => {
                        const isSelected = String(sub.id) === String(selectedSubject);
                        return (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => handleSubjectSelect(sub.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                                    isSelected
                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                            >
                                {sub.name}
                            </button>
                        );
                    })}
                </div>

                {/* Topics pills if subject selected */}
                {availableTopics.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
                        <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                            <Tag className="w-3.5 h-3.5 text-cyan-400" />
                            টপিক:
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTopic('');
                                handleFilterChange(selectedSubject, '', search);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                !selectedTopic
                                    ? 'bg-indigo-600 text-white font-semibold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            সব টপিক
                        </button>
                        {availableTopics.map((top) => {
                            const isTopSelected = String(top.id) === String(selectedTopic);
                            return (
                                <button
                                    key={top.id}
                                    type="button"
                                    onClick={() => {
                                        const nextTop = isTopSelected ? '' : String(top.id);
                                        setSelectedTopic(nextTop);
                                        handleFilterChange(selectedSubject, nextTop, search);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                        isTopSelected
                                            ? 'bg-indigo-600 text-white font-semibold'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                >
                                    {top.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Notes Grid */}
            {notes?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {notes.data.map((note) => (
                        <div
                            key={note.id}
                            className="group rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0e1628] border border-slate-800/90 hover:border-cyan-500/40 p-5 shadow-lg hover:shadow-cyan-500/5 transition flex flex-col justify-between"
                        >
                            <div>
                                {/* Top Badges */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider truncate max-w-[170px]">
                                        {note.subject?.name || 'Computer Science'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{note.read_time_minutes} মিনিট পড়ার সময়</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <Link
                                    href={route('notes.show', note.slug)}
                                    className="block group-hover:text-cyan-300 transition"
                                >
                                    <h3 className="text-base font-bold text-white line-clamp-2 leading-snug mb-2">
                                        {note.title}
                                    </h3>
                                </Link>

                                {/* Summary */}
                                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                                    {note.summary || 'এই টপিকের বিস্তারিত থিওরি ও লেকচার নোটস পড়তে ক্লিক করুন...'}
                                </p>

                                {/* Key Points Highlight (if available) */}
                                {Array.isArray(note.key_points) && note.key_points.length > 0 && (
                                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4 space-y-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                                            প্রধান পয়েন্টসমূহ:
                                        </span>
                                        {note.key_points.slice(0, 2).map((point, pIdx) => (
                                            <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300 line-clamp-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{note.views_count || 0} বার পঠিত</span>
                                </div>

                                <Link
                                    href={route('notes.show', note.slug)}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition"
                                >
                                    <span>নোট পড়ুন</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">কোনো স্টাডি নোট পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                        আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো লেকচার শিট নেই। আপনি AI দিয়ে তাৎক্ষণিক নতুন নোট তৈরি করতে পারেন।
                    </p>
                    <Link
                        href={route('notes.create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Gemini দিয়ে নতুন নোট তৈরি করুন</span>
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {notes?.links && notes.links.length > 3 && (
                <div className="flex items-center justify-center gap-1">
                    {notes.links.map((link, idx) => (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                link.active
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : !link.url
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
