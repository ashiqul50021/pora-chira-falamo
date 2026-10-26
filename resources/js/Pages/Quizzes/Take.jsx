import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Send,
    Code,
    HelpCircle
} from 'lucide-react';

export default function Take({ quiz }) {
    const questions = quiz.questions || [];
    const totalDurationSeconds = (quiz.duration_minutes || 15) * 60;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(totalDurationSeconds);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            handleFinalSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (questionId, optionKey) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionKey,
        }));
    };

    const handleClearAnswer = (questionId) => {
        const updated = { ...answers };
        delete updated[questionId];
        setAnswers(updated);
    };

    const handleFinalSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const timeSpent = totalDurationSeconds - Math.max(0, timeLeft);

        router.post(route('quizzes.submit', quiz.id), {
            answers,
            time_spent_seconds: timeSpent,
        });
    };

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                                {quiz.subject?.name || 'জেনারেল আইটি'}
                            </span>
                            <span className="text-xs text-slate-400">
                                • নেগেটিভ মার্কিং: -{quiz.negative_marking}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            {quiz.title}
                        </h1>
                    </div>

                    {/* Live Countdown Timer */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition ${
                                timeLeft < 120
                                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                            }`}
                        >
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>বাকি সময়: <span className="font-mono font-bold text-white">{formatTime(timeLeft)}</span></span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>সাবমিট করুন</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`পরীক্ষা: ${quiz.title}`} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Question Area */}
                <div className="lg:col-span-3">
                    {currentQuestion ? (
                        <div className="p-6 sm:p-7 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm mb-6">
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-4 pb-2.5 border-b border-slate-800">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-slate-300">
                                        প্রশ্ন <strong className="text-white text-sm font-bold">#{currentIndex + 1}</strong> / {questions.length}
                                    </span>
                                    {currentQuestion.subject && (
                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                                            {currentQuestion.subject.name}
                                            {currentQuestion.topic ? ` › ${currentQuestion.topic.name}` : ''}
                                        </span>
                                    )}
                                    {(currentQuestion.exam_name || currentQuestion.year) && (
                                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-amber-300/90 text-[11px] font-medium">
                                            {currentQuestion.exam_name} {currentQuestion.year ? `(${currentQuestion.year})` : ''}
                                        </span>
                                    )}
                                </div>
                                {answers[currentQuestion.id] && (
                                    <button
                                        onClick={() => handleClearAnswer(currentQuestion.id)}
                                        className="text-xs text-slate-400 hover:text-rose-400 font-medium"
                                    >
                                        উত্তর ক্লিয়ার করুন
                                    </button>
                                )}
                            </div>

                            <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-5">
                                {currentQuestion.question_text}
                            </h3>

                            {/* Code Snippet */}
                            {currentQuestion.code_snippet && (
                                <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                                    <pre>{currentQuestion.code_snippet}</pre>
                                </div>
                            )}

                            {/* Options */}
                            <div className="space-y-2.5 mb-6">
                                {Object.entries(currentQuestion.options || {}).map(([key, val]) => {
                                    const isSelected = answers[currentQuestion.id] === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQuestion.id, key)}
                                            className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                                                isSelected
                                                    ? 'bg-blue-600/10 border-blue-500 text-white font-medium'
                                                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                                                    isSelected
                                                        ? 'bg-blue-600 border-blue-500 text-white'
                                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                                }`}
                                            >
                                                {key}
                                            </div>
                                            <div className="text-sm flex-1 leading-normal pt-0.5">{val}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Prev / Next controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 disabled:opacity-30 transition"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>পূর্ববর্তী</span>
                                </button>

                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentIndex === questions.length - 1}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium disabled:opacity-30 transition"
                                >
                                    <span>পরবর্তী প্রশ্ন</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-800 rounded-2xl">প্রশ্ন লোড হচ্ছে...</div>
                    )}
                </div>

                {/* Question Navigator Palette */}
                <div className="lg:col-span-1">
                    <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm sticky top-24">
                        <div className="flex justify-between items-center mb-3 text-xs font-semibold text-slate-300">
                            <span>প্রশ্ন প্যালেট</span>
                            <span className="text-slate-400">উত্তর সম্পন্ন: <strong className="text-white">{answeredCount}</strong>/{questions.length}</span>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 mb-4">
                            {questions.map((q, idx) => {
                                const isCurrent = idx === currentIndex;
                                const isAnswered = !!answers[q.id];

                                return (
                                    <button
                                        key={q.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-full aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center border ${
                                            isCurrent
                                                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                                                : isAnswered
                                                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 font-semibold'
                                                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                                <span>উত্তর প্রদান করা হয়েছে</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span>
                                <span>উত্তর বাকি আছে</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                                <span>বর্তমান প্রশ্ন</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="w-full mt-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
                        >
                            পরীক্ষা সমাপ্ত ও সাবমিট করুন
                        </button>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                        <h4 className="text-base font-bold text-white mb-2">আপনি কি নিশ্চিত সাবমিট করতে চান?</h4>
                        <p className="text-xs text-slate-400 mb-4">
                            আপনি মোট <span className="font-bold text-emerald-400">{answeredCount}</span> টি প্রশ্নের উত্তর দিয়েছেন। এখনও <span className="font-bold text-amber-400">{questions.length - answeredCount}</span> টি প্রশ্ন বাকি রয়েছে।
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold"
                            >
                                আরও সময় নিন
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            >
                                {isSubmitting ? 'প্রসেসিং...' : 'হ্যাঁ, সাবমিট করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
