import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    PlayCircle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Sparkles,
    Code,
    Filter,
    Flame
} from 'lucide-react';

export default function Practice({ questions, subjects, selectedSubject, selectedTopic }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [sessionScore, setSessionScore] = useState({ correct: 0, wrong: 0 });

    const currentQuestion = questions[currentIndex];

    const handleSelectOption = async (optionKey) => {
        if (isAnswered) return;

        setSelectedOption(optionKey);
        setIsAnswered(true);
        setShowExplanation(true);

        const isCorrect = (optionKey.toUpperCase() === currentQuestion.correct_option.toUpperCase());

        if (isCorrect) {
            setSessionScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setSessionScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
        }

        // Record practice activity towards daily streak & goal
        try {
            await axios.post(route('questions.practice.record'));
        } catch (e) {
            console.error('Failed to update streak record', e);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowExplanation(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowExplanation(false);
        }
    };

    const handleFilterChange = (subId) => {
        router.get(route('questions.practice'), { subject_id: subId }, { preserveState: false });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <PlayCircle className="w-6 h-6 text-emerald-400" />
                            <span>কুইক প্র্যাকটিস সেশন</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            তাত্ক্ষণিক উত্তর যাচাই, ব্যাখ্যাসহ বিষয়ভিত্তিক প্রশ্ন অনুশীলন করুন।
                        </p>
                    </div>

                    {/* Live Session Counter */}
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-2">
                            <span className="text-emerald-400">সঠিক: {sessionScore.correct}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-rose-400">ভুল: {sessionScore.wrong}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="কুইক প্র্যাকটিস - IT Exam Prep" />

            {/* Subject Filters */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => handleFilterChange('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                        !selectedSubject
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    সকল বিষয় ({questions.length})
                </button>
                {subjects.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => handleFilterChange(sub.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                            String(selectedSubject) === String(sub.id)
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {sub.name}
                    </button>
                ))}
            </div>

            {questions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-800/80 border border-slate-700">
                    <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                        এই বিষয়ের অধীনে এখনও কোনো প্রশ্ন সেভ করা হয়নি। আপনি Gemini AI দিয়ে যেকোনো প্রশ্ন আপলোড বা জেনারেট করে নিতে পারেন।
                    </p>
                    <a
                        href={route('questions.upload')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI দিয়ে প্রশ্ন তৈরি করুন</span>
                    </a>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {/* Progress Bar & Header */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                        <span>
                            প্রশ্ন <span className="text-white font-bold">{currentIndex + 1}</span> / {questions.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                                {currentQuestion.subject?.name}
                            </span>
                            {currentQuestion.topic && (
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                                    {currentQuestion.topic.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/95 border border-slate-700 shadow-2xl mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-4">
                            {currentQuestion.question_text}
                        </h2>

                        {/* Code Snippet (if available) */}
                        {currentQuestion.code_snippet && (
                            <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-700/80 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
                                <pre>{currentQuestion.code_snippet}</pre>
                            </div>
                        )}

                        {/* Options List */}
                        <div className="space-y-3 mb-6">
                            {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                                const isSelected = selectedOption === key;
                                const isCorrect = key.toUpperCase() === currentQuestion.correct_option.toUpperCase();

                                let optionStyle = 'bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600';
                                if (isAnswered) {
                                    if (isCorrect) {
                                        optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium';
                                    } else if (isSelected && !isCorrect) {
                                        optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                                    } else {
                                        optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60';
                                    }
                                }

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleSelectOption(key)}
                                        disabled={isAnswered}
                                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${optionStyle}`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                                isAnswered && isCorrect
                                                    ? 'bg-emerald-600 text-white'
                                                    : isAnswered && isSelected && !isCorrect
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            {key}
                                        </div>
                                        <div className="text-sm flex-1 leading-snug">{value}</div>
                                        {isAnswered && isCorrect && (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        )}
                                        {isAnswered && isSelected && !isCorrect && (
                                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Box */}
                        {showExplanation && (
                            <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 animate-fadeIn">
                                <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                                    <HelpCircle className="w-4 h-4" />
                                    <span>সঠিক উত্তর: অপশন ({currentQuestion.correct_option})</span>
                                </div>
                                <p className="text-slate-300">{currentQuestion.explanation}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>পূর্ববর্তী</span>
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === questions.length - 1}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 transition shadow-md shadow-indigo-500/20"
                        >
                            <span>পরবর্তী প্রশ্ন</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
