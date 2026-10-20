import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    Flame,
    Target,
    HelpCircle,
    PlayCircle,
    RefreshCw
} from 'lucide-react';

export default function Index({ performance }) {
    const [aiAdvice, setAiAdvice] = useState('');
    const [loadingAdvice, setLoadingAdvice] = useState(false);

    const handleGetAiAdvice = async () => {
        setLoadingAdvice(true);
        try {
            const res = await axios.post(route('analytics.ai-advice'));
            if (res.data.success) {
                setAiAdvice(res.data.advice);
            }
        } catch (e) {
            setAiAdvice('পরামর্শ লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
        } finally {
            setLoadingAdvice(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-rose-400" />
                            <span>সাপ্তাহিক পারফরম্যান্স অ্যানালাইসিস</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            আপনার পড়াশোনার গতি, নির্ভুলতা এবং দুর্বল টপিকসমূহ শনাক্ত করুন।
                        </p>
                    </div>

                    <button
                        onClick={handleGetAiAdvice}
                        disabled={loadingAdvice}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
                    >
                        {loadingAdvice ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        <span>Gemini AI স্টাডি পরামর্শ পান</span>
                    </button>
                </div>
            }
        >
            <Head title="ডেইলি ও উইকলি রিপোর্ট - IT Exam Prep" />

            {/* AI Advisor Box */}
            {aiAdvice && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/40 shadow-2xl animate-fadeIn">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <span>Gemini AI এর পার্সোনালাইজড স্টাডি ইনসাইট:</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                        {aiAdvice}
                    </div>
                </div>
            )}

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>গড় অ্যাকুরেসি রেট</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white block">
                        {performance.average_accuracy}%
                    </span>
                    <span className="text-[10px] text-slate-500">বিগত ৭ দিনে</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span>সমাধানকৃত প্রশ্ন</span>
                    </div>
                    <span className="text-3xl font-extrabold text-emerald-400 block">
                        {performance.total_questions_solved}
                    </span>
                    <span className="text-[10px] text-slate-500">
                        সঠিক: {performance.total_correct} • ভুল: {performance.total_wrong}
                    </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>বর্তমান স্ট্রিক</span>
                    </div>
                    <span className="text-3xl font-extrabold text-amber-400 block">
                        {performance.current_streak} দিন
                    </span>
                    <span className="text-[10px] text-slate-500">
                        রেকর্ড: {performance.longest_streak} দিন
                    </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>মিসড ডে পেনাল্টি</span>
                    </div>
                    <span className="text-3xl font-extrabold text-rose-400 block">
                        {performance.penalty_count} দিন
                    </span>
                    <span className="text-[10px] text-slate-500">পড়ার ফাঁক / গ্যাপ</span>
                </div>
            </div>

            {/* 7-Day Activity & Weak Topics 2-Col Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 7-Day Practice Consistency */}
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl">
                    <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span>বিগত ৭ দিনের নিয়মিত পড়ার গ্রাফ</span>
                    </h3>

                    <div className="space-y-3">
                        {performance.daily_history?.map((day, i) => {
                            const pct = Math.min(100, Math.round((day.completed_questions / day.target_questions) * 100));

                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span className="font-medium text-slate-200">
                                            {day.day} ({day.date})
                                        </span>
                                        <span>
                                            {day.completed_questions} / {day.target_questions} প্রশ্ন
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                day.is_achieved
                                                    ? 'bg-emerald-500'
                                                    : day.completed_questions > 0
                                                    ? 'bg-indigo-500'
                                                    : 'bg-slate-700'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weak Topics Analysis */}
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl">
                    <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>যেসব টপিকে বেশি ভুল হয়েছে (Weak Areas)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                        যেসকল টপিকে নির্ভুলতার হার ৬৫% এর নিচে, সেগুলোতে অতিরিক্ত নজর দেওয়া প্রয়োজন।
                    </p>

                    {performance.weak_topics?.length > 0 ? (
                        <div className="space-y-2.5">
                            {performance.weak_topics.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">
                                            {item.topic}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {item.subject} • মোট {item.total} বার ট্রাই করা হয়েছে
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs font-bold">
                                            {item.accuracy}% অ্যাকুরেসি
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-900/40 rounded-xl text-slate-500 text-xs">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p>কোনো ক্রিটিক্যাল দুর্বল টপিক পাওয়া যায়নি। আপনার প্রস্তুতি বেশ ভারসাম্যপূর্ণ!</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
