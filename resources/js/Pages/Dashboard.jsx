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
    Settings2,
    Calendar,
    ChevronRight,
    Check
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

    const targetQ = todayGoal?.target_questions || 15;
    const completedQ = todayGoal?.completed_questions || 0;
    const questionProgress = Math.min(100, Math.round((completedQ / targetQ) * 100));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>স্টাডি ওভারভিউ ও প্রস্তুতি ড্যাশবোর্ড</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            আজকের পড়ার লক্ষ্য পূরণ করুন, নিয়মিত অনুশীলনে স্ট্রিক বৃদ্ধি করুন।
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('questions.upload')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                            <UploadCloud className="w-4 h-4 text-purple-400" />
                            <span>AI দিয়ে প্রশ্ন যোগ</span>
                        </Link>

                        <Link
                            href={route('questions.practice')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>কুইক প্র্যাকটিস শুরু</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="ড্যাশবোর্ড - IT Exam Prep" />

            {/* Missed Day Penalty Alert Banner */}
            {penaltyCount > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <h4 className="font-semibold text-rose-200">
                            সতর্কতা: স্টাডি গ্যাপ বা পড়ার দিন মিস হয়েছে!
                        </h4>
                        <p className="text-rose-300/90 mt-0.5">
                            আপনি মোট <span className="font-bold underline">{penaltyCount} দিন</span> প্র্যাকটিস মিস করেছেন, ফলে বর্তমান স্ট্রিক রিসেট হয়েছে। আজ অন্তত ১৫টি প্রশ্ন সমাধান করে আপনার গতি ফিরিয়ে আনুন।
                        </p>
                    </div>
                    <Link
                        href={route('questions.practice')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-white text-xs font-semibold shrink-0 transition"
                    >
                        প্র্যাকটিস করুন
                    </Link>
                </div>
            )}

            {/* Top 3 Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* 1. Daily Goal Card */}
                <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-slate-200 text-sm">আজকের পড়ার লক্ষ্য</h3>
                            </div>
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="টার্গেট পরিবর্তন করুন"
                            >
                                <Settings2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-extrabold text-white">
                                {completedQ} <span className="text-sm font-normal text-slate-400">/ {targetQ} প্রশ্ন</span>
                            </span>
                            <span className="text-xs font-bold text-indigo-400">{questionProgress}% সম্পন্ন</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${questionProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>মক টেস্ট লক্ষ্য: {todayGoal?.completed_quizzes || 0}/{todayGoal?.target_quizzes || 1}</span>
                        {todayGoal?.is_achieved ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> অর্জিত!
                            </span>
                        ) : (
                            <span className="text-amber-400 font-medium">চলমান...</span>
                        )}
                    </div>
                </div>

                {/* 2. Streak Habit Card */}
                <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-slate-200 text-sm">স্টাডি স্ট্রিক (Habit Tracker)</h3>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                                একটিভ
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-extrabold text-white">
                                {streak?.current_streak || 0}
                            </span>
                            <span className="text-xs font-semibold text-amber-400">দিন একটানা পড়ার রেকর্ড</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            প্রতিদিন অন্তত ১টি কুইজ বা প্রশ্ন পড়লে স্ট্রিক বজায় থাকবে।
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>সর্বোচ্চ রেকর্ড: <strong className="text-slate-200">{streak?.longest_streak || 0} দিন</strong></span>
                        <span>মোট সলভ: <strong className="text-slate-200">{streak?.total_questions_solved || 0}টি</strong></span>
                    </div>
                </div>

                {/* 3. Question Bank & Quick Stats Card */}
                <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-slate-200 text-sm">প্রশ্নভাণ্ডার (Question Bank)</h3>
                            </div>
                            <Link
                                href={route('questions.index')}
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
                            >
                                তালিকা <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-extrabold text-white">
                                {totalQuestionsCount}
                            </span>
                            <span className="text-xs font-semibold text-cyan-400">টি সংরক্ষিত প্রশ্ন</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {subjects.length} টি কম্পিউটার সায়েন্স বিষয়ে বিন্যস্ত।
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <Link href={route('quizzes.create')} className="text-indigo-400 hover:underline font-medium">
                            + নতুন মক টেস্ট বানান
                        </Link>
                        <Link href={route('questions.upload')} className="text-purple-400 hover:underline font-medium">
                            + AI দিয়ে প্রশ্ন তুলুন
                        </Link>
                    </div>
                </div>
            </div>

            {/* 7-Day Activity Sparkline */}
            <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>বিগত ৭ দিনের পড়ার ইতিহাস (Daily Practice Consistency)</span>
                    </h3>
                    <Link
                        href={route('analytics.index')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
                    >
                        উইকলি ফুল রিপোর্ট <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {weeklyActivity?.map((day, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border transition ${
                                day.completed_questions >= day.target_questions
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : day.completed_questions > 0
                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                    : 'bg-slate-900/60 border-slate-800'
                            }`}
                        >
                            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                {day.day}
                            </span>
                            <span className="text-base font-bold text-white block">
                                {day.completed_questions}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                                / {day.target_questions}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core IT Subjects Grid */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-base font-bold text-white">
                            আইটি পরীক্ষার বিষয়ভিত্তিক সিলেবাস
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">যেকোনো বিষয়ে ক্লিক করে কুইক প্র্যাকটিস শুরু করুন</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((sub) => (
                        <Link
                            key={sub.id}
                            href={route('questions.practice', { subject_id: sub.id })}
                            className="p-5 rounded-xl bg-[#0f172a] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition text-sm">
                                        {sub.name}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                                        {sub.questions_count || 0} প্রশ্ন
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {sub.description}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
                                <span>{sub.topics_count || 0} টি টপিক অন্তর্ভুক্ত</span>
                                <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                                    অনুশীলন <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Mock Attempts Table */}
            <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>সাম্প্রতিক মক টেস্ট ও পরীক্ষার ফলাফল</span>
                    </h4>
                    <Link href={route('quizzes.index')} className="text-xs text-cyan-400 hover:text-cyan-300">
                        সকল মক টেস্ট
                    </Link>
                </div>

                {recentAttempts.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold">
                                <tr>
                                    <th className="px-4 py-3">মক টেস্ট</th>
                                    <th className="px-4 py-3">বিষয়</th>
                                    <th className="px-4 py-3">সঠিক / মোট</th>
                                    <th className="px-4 py-3">স্কোর</th>
                                    <th className="px-4 py-3">অ্যাকুরেসি</th>
                                    <th className="px-4 py-3 text-right">রিভিউ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {recentAttempts.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3 font-medium text-white">
                                            {attempt.quiz?.title || 'মক টেস্ট'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {attempt.quiz?.subject?.name || 'জেনারেল আইটি'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-emerald-400 font-bold">{attempt.correct_count}</span> / {attempt.total_questions}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-400">
                                            {attempt.score}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                                                {attempt.accuracy_rate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={route('quizzes.result', attempt.id)}
                                                className="text-indigo-400 hover:underline font-semibold"
                                            >
                                                রিভিউ দেখুন →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                        এখনো কোনো মক টেস্ট দেওয়া হয়নি।
                        <div className="mt-2">
                            <Link href={route('quizzes.index')} className="text-indigo-400 hover:underline font-medium">
                                প্রথম মক টেস্ট শুরু করুন
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Set Daily Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl">
                        <h3 className="text-base font-bold text-white mb-1">দৈনিক পড়ার লক্ষ্য নির্ধারণ</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            প্রতিদিন কতগুলো প্রশ্ন সমাধান ও কয়টি মক টেস্ট দিতে চান তা সেট করুন।
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
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
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
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGoalModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
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
