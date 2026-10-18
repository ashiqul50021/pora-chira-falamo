import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Flame,
    Target,
    BookOpen,
    PlayCircle,
    UploadCloud,
    FileText,
    BarChart3,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    ShieldAlert,
    Sparkles,
    Settings2
} from 'lucide-react';

export default function Dashboard({
    streak,
    todayGoal,
    totalQuestionsCount,
    subjects,
    recentAttempts,
    recentQuestions,
    weeklyActivity,
    penaltyCount,
}) {
    const [showGoalModal, setShowGoalModal] = useState(false);
    const { data, setData, post, processing } = useForm({
        target_questions: todayGoal?.target_questions || 15,
        target_quizzes: todayGoal?.target_quizzes || 1,
    });

    const handleUpdateGoal = (e) => {
        e.preventDefault();
        post(route('daily-goal.update'), {
            onSuccess: () => setShowGoalModal(false),
        });
    };

    const questionProgress = Math.min(
        100,
        Math.round(((todayGoal?.completed_questions || 0) / (todayGoal?.target_questions || 15)) * 100)
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>স্বাগতম, আপনার আইটি স্টাডি ড্যাশবোর্ড</span>
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            নিয়মিত প্র্যাকটিস করুন, স্ট্রিক রক্ষা করুন এবং চাকরির পরীক্ষায় এগিয়ে থাকুন।
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('questions.upload')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>AI দিয়ে প্রশ্ন যোগ</span>
                        </Link>

                        <Link
                            href={route('questions.practice')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 transition"
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>কুইক প্র্যাকটিস</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="ড্যাশবোর্ড - IT Exam Prep" />

            {/* Missed Day Penalty Alert Banner */}
            {penaltyCount > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-rose-200">
                            সতর্কতা: স্টাডি গ্যাপ বা মিসড প্র্যাকটিস পরিলক্ষিত হয়েছে!
                        </h4>
                        <p className="text-xs text-rose-300/90 mt-1">
                            আপনি মোট <span className="font-bold underline">{penaltyCount} দিন</span> প্র্যাকটিস মিস করেছেন, যার কারণে দৈনিক স্ট্রিক ড্রপ করেছে। আজ অন্তত ১৫টি প্রশ্ন সমাধান করে আপনার মোমেন্টাম ফিরিয়ে আনুন!
                        </p>
                    </div>
                    <Link
                        href={route('questions.practice')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-xs font-semibold shrink-0 transition"
                    >
                        এখনই পড়ুন
                    </Link>
                </div>
            )}

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* 1. Daily Learning Goal Card */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-200">আজকের পড়ার লক্ষ্য</h3>
                        </div>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                            title="গোল পরিবর্তন করুন"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                                <span>প্রশ্ন সমাধান</span>
                                <span className="text-slate-200 font-bold">
                                    {todayGoal?.completed_questions || 0} / {todayGoal?.target_questions || 15}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${questionProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-xs">
                            <span className="text-slate-400">মক টেস্ট লক্ষ্য:</span>
                            <span className="text-slate-300 font-medium">
                                {todayGoal?.completed_quizzes || 0} / {todayGoal?.target_quizzes || 1} সম্পন্ন
                            </span>
                        </div>

                        {todayGoal?.is_achieved ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 py-1.5 px-2.5 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>আজকের লক্ষ্য পূর্ণ হয়েছে! সাবাশ! 🎉</span>
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-400 italic">
                                লক্ষ্য পূরণ করতে আরও {Math.max(0, (todayGoal?.target_questions || 15) - (todayGoal?.completed_questions || 0))}টি প্রশ্ন পড়ুন।
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Streak & Habit System Card */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                                <Flame className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-200">স্টাডি স্ট্রিক</h3>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            অবিচ্ছিন্ন
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                            {streak?.current_streak || 0}
                        </span>
                        <span className="text-sm font-semibold text-amber-400">দিন একটানা</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
                        <div>
                            <span>সর্বোচ্চ রেকর্ড: </span>
                            <span className="text-slate-200 font-semibold">{streak?.longest_streak || 0} দিন</span>
                        </div>
                        <div>
                            <span>মোট প্রশ্ন সলভ: </span>
                            <span className="text-slate-200 font-semibold">{streak?.total_questions_solved || 0}টি</span>
                        </div>
                    </div>
                </div>

                {/* 3. Question Bank & Quick Stats Card */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition"></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-200">আইটি প্রশ্নভাণ্ডার</h3>
                        </div>
                        <Link
                            href={route('questions.index')}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                            সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                            {totalQuestionsCount}
                        </span>
                        <span className="text-sm font-semibold text-cyan-400">সংরক্ষিত প্রশ্ন</span>
                    </div>

                    <div className="pt-2 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between items-center">
                        <span>ক্যাটাগরি: {subjects.length} টি IT বিষয়</span>
                        <Link
                            href={route('quizzes.create')}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            + মক টেস্ট বানান
                        </Link>
                    </div>
                </div>
            </div>

            {/* 7-Day Activity Sparkline */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span>বিগত ৭ দিনের পড়ার ইতিহাস (Daily Activity)</span>
                    </h3>
                    <Link
                        href={route('analytics.index')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                        উইকলি ফুল রিপোর্ট <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {weeklyActivity?.map((day, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-xl border transition ${
                                day.completed_questions >= day.target_questions
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : day.completed_questions > 0
                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                    : 'bg-slate-900/40 border-slate-700/50'
                            }`}
                        >
                            <span className="text-[11px] font-medium text-slate-400 block mb-1">
                                {day.day}
                            </span>
                            <span className="text-lg font-bold text-white block">
                                {day.completed_questions}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                                / {day.target_questions}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* IT Subjects Explorer Grid */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <span>আইটি সিলেবাস ও বিষয়ভিত্তিক প্রস্তুতি</span>
                    </h3>
                    <span className="text-xs text-slate-400">যেকোনো বিষয়ে ক্লিক করে প্র্যাকটিস শুরু করুন</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((sub) => (
                        <Link
                            key={sub.id}
                            href={route('questions.practice', { subject_id: sub.id })}
                            className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition group shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300 transition text-base">
                                        {sub.name}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                                        {sub.questions_count || 0} প্রশ্ন
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {sub.description}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
                                <span>{sub.topics_count || 0} টি টপিক অন্তর্ভুক্ত</span>
                                <span className="text-indigo-400 group-hover:translate-x-1 transition font-medium flex items-center gap-1">
                                    পড়ুন →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity: Quizzes & Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Mock Attempts */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <span>সাম্প্রতিক মক টেস্ট ও স্কোর</span>
                        </h4>
                        <Link href={route('quizzes.index')} className="text-xs text-cyan-400 hover:text-cyan-300">
                            সকল পরীক্ষা
                        </Link>
                    </div>

                    {recentAttempts.length > 0 ? (
                        <div className="space-y-2.5">
                            {recentAttempts.map((attempt) => (
                                <Link
                                    key={attempt.id}
                                    href={route('quizzes.result', attempt.id)}
                                    className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 flex items-center justify-between transition"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-slate-200">
                                            {attempt.quiz?.title || 'মক টেস্ট'}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(attempt.created_at).toLocaleDateString('bn-BD')} • {attempt.quiz?.subject?.name || 'জেনারেল'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-emerald-400">
                                            স্কোর: {attempt.score}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            সঠিক: {attempt.correct_count} / {attempt.total_questions}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-xs">
                            এখনো কোনো মক টেস্ট দেওয়া হয়নি।
                            <div className="mt-2">
                                <Link
                                    href={route('quizzes.index')}
                                    className="text-indigo-400 hover:underline font-medium"
                                >
                                    প্রথম মক টেস্ট শুরু করুন
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recently Added Questions */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>নতুন যুক্ত হওয়া প্রশ্ন</span>
                        </h4>
                        <Link href={route('questions.upload')} className="text-xs text-purple-400 hover:text-purple-300">
                            + নতুন প্রশ্ন তুলুন
                        </Link>
                    </div>

                    {recentQuestions.length > 0 ? (
                        <div className="space-y-2.5">
                            {recentQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-xs"
                                >
                                    <div className="font-medium text-slate-200 line-clamp-1 mb-1">
                                        {q.question_text}
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                                        <span className="text-indigo-400 font-medium">
                                            {q.subject?.name} • {q.topic?.name || 'সাধারণ'}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase text-[10px]">
                                            {q.difficulty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-xs">
                            ডাটাবেসে এখনো কোনো প্রশ্ন যোগ করা হয়নি।
                            <div className="mt-2">
                                <Link
                                    href={route('questions.upload')}
                                    className="text-purple-400 hover:underline font-medium"
                                >
                                    Gemini AI দিয়ে প্রশ্ন যোগ করুন
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Set Daily Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">দৈনিক পড়ার লক্ষ্য পরিবর্তন</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            প্রতিদিন আপনি কতগুলো প্রশ্ন সমাধান ও কুইজ দিতে চান তা নির্ধারণ করুন।
                        </p>

                        <form onSubmit={handleUpdateGoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    প্রতিদিনের প্রশ্ন টার্গেট:
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="100"
                                    value={data.target_questions}
                                    onChange={(e) => setData('target_questions', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    প্রতিদিনের মক টেস্ট টার্গেট:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.target_quizzes}
                                    onChange={(e) => setData('target_quizzes', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGoalModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
                                >
                                    সেভ করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
