import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Plus,
    Clock,
    Award,
    CheckCircle2,
    PlayCircle,
    ArrowRight,
    HelpCircle,
    Flame
} from 'lucide-react';

export default function Index({ quizzes, recentAttempts, subjects }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-cyan-400" />
                            <span>মক টেস্ট ও পরীক্ষার প্রস্তুতি</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            টাইমার ও নেগেটিভ মার্কিংসহ বাস্তব চাকরির পরীক্ষার আদলে মক টেস্ট দিন।
                        </p>
                    </div>

                    <Link
                        href={route('quizzes.create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন মক টেস্ট বানান</span>
                    </Link>
                </div>
            }
        >
            <Head title="মক টেস্ট - IT Exam Prep" />

            {/* Quizzes Grid */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>উপলব্ধ মক টেস্টসমূহ</span>
                </h3>

                {quizzes.data.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-slate-800/80 border border-slate-700">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-white mb-1">কোনো মক টেস্ট তৈরি করা হয়নি</h4>
                        <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                            আপনার পছন্দের আইটি বিষয়ের প্রশ্ন নিয়ে কাস্টম মক টেস্ট তৈরি করুন এবং প্র্যাকটিস করুন।
                        </p>
                        <Link
                            href={route('quizzes.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>মক টেস্ট তৈরি করুন</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {quizzes.data.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md flex flex-col justify-between hover:border-indigo-500/50 transition group"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
                                            {quiz.subject?.name || 'ফুল আইটি সিলেবাস'}
                                        </span>
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            {quiz.duration_minutes} মিনিট
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-white text-base mb-1 group-hover:text-cyan-300 transition line-clamp-1">
                                        {quiz.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                                        {quiz.description || 'সম্পূর্ণ পরীক্ষার জন্য সময়োপযোগী আইটি প্রশ্নাবলি।'}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium">
                                        {quiz.questions_count} টি প্রশ্ন • {quiz.total_marks} নম্বর
                                    </span>
                                    <Link
                                        href={route('quizzes.show', quiz.id)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-sm"
                                    >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        <span>শুরু করুন</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Exam Attempts */}
            {recentAttempts.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span>আপনার সাম্প্রতিক পরীক্ষার ফলাফল</span>
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/80 shadow-md">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/60 border-b border-slate-700 text-slate-400 uppercase text-[11px] font-semibold">
                                <tr>
                                    <th className="px-5 py-3">মক টেস্টের নাম</th>
                                    <th className="px-5 py-3">তারিখ</th>
                                    <th className="px-5 py-3">সঠিক / মোট</th>
                                    <th className="px-5 py-3">অ্যাকুরেসি</th>
                                    <th className="px-5 py-3">প্রাপ্ত স্কোর</th>
                                    <th className="px-5 py-3 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60 text-slate-300">
                                {recentAttempts.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-5 py-3.5 font-medium text-white">
                                            {attempt.quiz?.title || 'মক টেস্ট'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400">
                                            {new Date(attempt.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-emerald-400 font-semibold">{attempt.correct_count}</span>
                                            <span className="text-slate-500"> / {attempt.total_questions}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                                                {attempt.accuracy_rate}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-emerald-400">
                                            {attempt.score}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Link
                                                href={route('quizzes.result', attempt.id)}
                                                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 justify-end"
                                            >
                                                রিভিউ দেখুন <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
