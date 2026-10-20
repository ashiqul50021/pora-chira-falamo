import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    XCircle,
    Clock,
    HelpCircle,
    ArrowRight,
    RotateCcw,
    BarChart3,
    BookOpen,
    Code
} from 'lucide-react';

export default function Result({ attempt }) {
    const quiz = attempt.quiz;
    const answers = attempt.answers || [];

    const formatSeconds = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m} মিনিট ${s} সেকেন্ড`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                                পরীক্ষা সম্পন্ন
                            </span>
                            <span className="text-xs text-slate-400">
                                {quiz?.subject?.name || 'জেনারেল আইটি'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            {quiz?.title || 'মক টেস্টের ফলাফল ও রিভিউ'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('quizzes.show', quiz.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>পুনরায় দিন</span>
                        </Link>

                        <Link
                            href={route('analytics.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>ডেইলি ও উইকলি রিপোর্ট</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`ফলাফল: ${quiz?.title}`} />

            {/* Score Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">প্রাপ্ত স্কোর</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
                        {attempt.score}
                    </span>
                    <span className="text-[10px] text-slate-500 block">মোট {attempt.total_questions} তে</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">অ্যাকুরেসি রেট</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 block">
                        {attempt.accuracy_rate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">নির্ভুলতার হার</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">সঠিক উত্তর</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
                        {attempt.correct_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block">টি প্রশ্ন</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">ভুল উত্তর</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 block">
                        {attempt.wrong_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block">(-{quiz.negative_marking} করে কাটা)</span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">মোট সময় লেগেছে</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-200 block mt-1">
                        {formatSeconds(attempt.time_spent_seconds)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">টাইমার শেষ হওয়ার আগে</span>
                </div>
            </div>

            {/* Answer by Answer Review */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span>প্রশ্নোত্তর রিভিউ ও ব্যাখ্যা (Detailed Review)</span>
                </h3>

                <div className="space-y-4">
                    {answers.map((ans, idx) => {
                        const q = ans.question;
                        if (!q) return null;

                        const userSelected = ans.selected_option;
                        const correctOpt = q.correct_option;
                        const isCorrect = ans.is_correct;

                        return (
                            <div
                                key={ans.id}
                                className={`p-6 rounded-2xl border transition ${
                                    isCorrect
                                        ? 'bg-slate-800/90 border-emerald-500/30'
                                        : userSelected
                                        ? 'bg-slate-800/90 border-rose-500/30'
                                        : 'bg-slate-800/90 border-slate-700'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                                            #{idx + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-indigo-400">
                                            {q.subject?.name} {q.topic ? `• ${q.topic.name}` : ''}
                                        </span>
                                    </div>

                                    <div>
                                        {isCorrect ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+1)
                                            </span>
                                        ) : userSelected ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                                                <XCircle className="w-3.5 h-3.5" /> ভুল (-{quiz.negative_marking})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs font-medium">
                                                উত্তর দেওয়া হয়নি
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h4 className="text-base font-semibold text-slate-100 mb-3">
                                    {q.question_text}
                                </h4>

                                {q.code_snippet && (
                                    <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-700/60 font-mono text-xs text-emerald-300 overflow-x-auto">
                                        <pre>{q.code_snippet}</pre>
                                    </div>
                                )}

                                {/* Options View */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                                    {Object.entries(q.options || {}).map(([key, val]) => {
                                        const isChosen = userSelected === key;
                                        const isActualRight = key.toUpperCase() === correctOpt.toUpperCase();

                                        let style = 'bg-slate-900/40 border-slate-700/60 text-slate-300';
                                        if (isActualRight) {
                                            style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium';
                                        } else if (isChosen && !isActualRight) {
                                            style = 'bg-rose-500/20 border-rose-500 text-rose-200';
                                        }

                                        return (
                                            <div
                                                key={key}
                                                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}
                                            >
                                                <span
                                                    className={`w-5 h-5 rounded font-bold flex items-center justify-center text-[10px] shrink-0 ${
                                                        isActualRight
                                                            ? 'bg-emerald-600 text-white'
                                                            : isChosen
                                                            ? 'bg-rose-600 text-white'
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {key}
                                                </span>
                                                <span className="flex-1">{val}</span>
                                                {isActualRight && (
                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                                                        সঠিক
                                                    </span>
                                                )}
                                                {isChosen && !isActualRight && (
                                                    <span className="text-[10px] text-rose-400 font-bold uppercase">
                                                        আপনার উত্তর
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                {q.explanation && (
                                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                                        <span className="font-semibold text-indigo-400 block mb-1">
                                            ব্যাখ্যা:
                                        </span>
                                        {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
