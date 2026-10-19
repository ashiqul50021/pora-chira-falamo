import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    UploadCloud,
    FileText,
    Sparkles,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Save,
    RefreshCw,
    Code,
    HelpCircle,
    ArrowRight,
    Sliders,
    Layers,
    Plus,
    X,
    Images,
    AlertTriangle,
} from 'lucide-react';

export default function Upload({ subjects }) {
    const [activeTab, setActiveTab] = useState('image'); // 'image', 'text', 'generate'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [skipDuplicatesOnSave, setSkipDuplicatesOnSave] = useState(true);
    const [checkingDuplicates, setCheckingDuplicates] = useState(false);

    // Form states
    const [rawText, setRawText] = useState('');
    const [uploadExamName, setUploadExamName] = useState('');
    const [uploadYear, setUploadYear] = useState('');
    const [generateTopic, setGenerateTopic] = useState('Database Indexing & B-Trees');
    const [generateCount, setGenerateCount] = useState(3);
    const [generateDifficulty, setGenerateDifficulty] = useState('medium');
    const [generateType, setGenerateType] = useState('mcq');

    // Automatically compress high-res mobile camera photos before upload
    const compressImage = (file) => {
        return new Promise((resolve) => {
            // If already below 1.5MB, use directly
            if (file.size <= 1.5 * 1024 * 1024) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const maxDim = 2048; // Optimal clarity for Gemini OCR
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file);
                                return;
                            }
                            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                            const compressed = new File([blob], cleanName, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressed);
                        },
                        'image/jpeg',
                        0.88
                    );
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    const addFiles = async (files) => {
        if (!files || files.length === 0) return;
        const rawFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));

        const newItems = [];
        for (const raw of rawFiles) {
            const fileToUse = await compressImage(raw);
            newItems.push({
                id: Math.random().toString(36).substring(2, 9),
                file: fileToUse,
                preview: URL.createObjectURL(fileToUse),
                name: fileToUse.name,
                size: (fileToUse.size / (1024 * 1024)).toFixed(2) + ' MB',
            });
        }

        setSelectedImages((prev) => [...prev, ...newItems]);
        setError(null);
    };

    const handleFilesSelect = (e) => {
        addFiles(e.target.files);
        // Reset input value so same files can be chosen again if needed
        e.target.value = '';
    };

    const removeImage = (id) => {
        setSelectedImages((prev) => {
            const item = prev.find((img) => img.id === id);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((img) => img.id !== id);
        });
    };

    const clearAllImages = () => {
        selectedImages.forEach((img) => {
            if (img.preview) URL.revokeObjectURL(img.preview);
        });
        setSelectedImages([]);
    };

    const handleImageSubmit = async () => {
        if (selectedImages.length === 0) {
            setError('অনুগ্রহ করে অন্তত একটি ছবি সিলেক্ট করুন।');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        selectedImages.forEach((img) => {
            formData.append('images[]', img.file);
        });
        if (uploadExamName.trim()) formData.append('exam_name', uploadExamName.trim());
        if (uploadYear.trim()) formData.append('year', uploadYear.trim());

        try {
            const res = await axios.post(route('questions.extract-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
                setUploadedImageUrl(res.data.image_url);
                setUploadedImageUrls(res.data.image_urls || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'ছবি থেকে প্রশ্ন বিশ্লেষণ করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!rawText.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(route('questions.extract-text'), {
                text: rawText,
                exam_name: uploadExamName.trim() || undefined,
                year: uploadYear.trim() || undefined,
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'টেক্সট থেকে প্রশ্ন বিশ্লেষণ করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        if (!generateTopic.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(route('questions.generate-ai'), {
                topic: generateTopic,
                count: generateCount,
                difficulty: generateDifficulty,
                type: generateType,
            });

            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...extractedQuestions];
        updated[index][field] = value;
        setExtractedQuestions(updated);
    };

    const handleOptionChange = (qIndex, optKey, value) => {
        const updated = [...extractedQuestions];
        if (!updated[qIndex].options) {
            updated[qIndex].options = {};
        }
        updated[qIndex].options[optKey] = value;
        setExtractedQuestions(updated);
    };

    const handleRemoveQuestion = (index) => {
        setExtractedQuestions(extractedQuestions.filter((_, i) => i !== index));
    };

    const handleRemoveDuplicates = () => {
        setExtractedQuestions(extractedQuestions.filter((q) => !q.is_duplicate));
    };

    const handleCheckDuplicates = async (customQuestions = null) => {
        const toCheck = customQuestions || extractedQuestions;
        if (toCheck.length === 0) return;
        setCheckingDuplicates(true);
        try {
            const res = await axios.post(route('questions.check-duplicates'), {
                questions: toCheck,
            });
            if (res.data.success) {
                setExtractedQuestions(res.data.questions);
            }
        } catch (err) {
            console.error('Failed to check duplicates', err);
        } finally {
            setCheckingDuplicates(false);
        }
    };

    const handleSaveAll = () => {
        if (extractedQuestions.length === 0) return;

        router.post(route('questions.store'), {
            questions: extractedQuestions,
            source: activeTab === 'image' ? 'gemini_image' : activeTab === 'text' ? 'gemini_text' : 'gemini_generated',
            skip_duplicates: skipDuplicatesOnSave,
        });
    };

    const duplicateCount = extractedQuestions.filter((q) => q.is_duplicate).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>প্রশ্ন আপলোড ও এআই স্টুডিও</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            ছবি বা বইয়ের টেক্সট থেকে স্বয়ংক্রিয়ভাবে প্রশ্ন বের করুন অথবা সিলেবাস টপিক থেকে নতুন প্রশ্ন তৈরি করুন।
                        </p>
                    </div>

                    {extractedQuestions.length > 0 && (
                        <div className="flex items-center gap-2">
                            {duplicateCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleRemoveDuplicates}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>ডুপ্লিকেট বাদ দিন ({duplicateCount})</span>
                                </button>
                            )}
                            <button
                                onClick={handleSaveAll}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                            >
                                <Save className="w-4 h-4" />
                                <span>সবগুলো ডাটাবেসে সেভ করুন ({extractedQuestions.length})</span>
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="AI স্টুডিও - IT Exam Prep" />

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Options Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm mb-8">
                {/* Clean Segmented Tab Control */}
                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-lg mb-6">
                    <button
                        onClick={() => { setActiveTab('image'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'image'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>১. ছবি আপলোড (OCR)</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('text'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'text'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>২. টেক্সট পেস্ট</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('generate'); setError(null); }}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activeTab === 'generate'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>৩. নতুন প্রশ্ন জেনারেট</span>
                    </button>
                </div>

                {/* Tab 1: Image Upload */}
                {activeTab === 'image' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    পরীক্ষার নাম (ঐচ্ছিক - Gemini ছবি থেকেও বুঝে নিবে):
                                </label>
                                <input
                                    type="text"
                                    value={uploadExamName}
                                    onChange={(e) => setUploadExamName(e.target.value)}
                                    placeholder="যেমন: 43rd BCS, Sonali Bank IT Officer, BPSC AP"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    পরীক্ষার সাল (ঐচ্ছিক):
                                </label>
                                <input
                                    type="text"
                                    value={uploadYear}
                                    onChange={(e) => setUploadYear(e.target.value)}
                                    placeholder="যেমন: 2023, 2022"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Dropzone & Multi-Image Gallery */}
                        {selectedImages.length === 0 ? (
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files?.length) {
                                        addFiles(e.dataTransfer.files);
                                    }
                                }}
                                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition ${
                                    isDragging
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                                }`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                                    <Images className="w-7 h-7" />
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                                    এক বা একাধিক প্রশ্নপত্র বা বইয়ের পাতার ছবি আপলোড করুন
                                </h4>
                                <p className="text-xs text-slate-400 max-w-lg mx-auto mb-4 leading-relaxed">
                                    PNG, JPG, JPEG ফরম্যাট সমর্থিত (সর্বোচ্চ ১০টি ছবি)। ড্রপ করুন অথবা ব্রাউজ করে একসাথে বহু ছবি সিলেক্ট করুন। Gemini Vision সব পাতা একসাথে পড়ে প্রশ্ন ও সমাধান ডিটেক্ট করবে।
                                </p>
                                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer transition">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>কম্পিউটার থেকে ছবিগুলো সিলেক্ট করুন (Multiple)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFilesSelect}
                                        disabled={loading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                            {selectedImages.length}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-white">
                                                নির্বাচিত ছবিসমূহ ({selectedImages.length}টি পাতা)
                                            </span>
                                            <div className="text-[11px] text-slate-400">
                                                প্রয়োজনে আরও ছবি যোগ করতে পারেন অথবা অপ্রয়োজনীয় ছবি মুছে ফেলতে পারেন
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 cursor-pointer transition">
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>আরও ছবি যোগ করুন</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFilesSelect}
                                                disabled={loading}
                                                className="hidden"
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={clearAllImages}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition"
                                        >
                                            সব মুছুন
                                        </button>
                                    </div>
                                </div>

                                {/* Thumbnail Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                                    {selectedImages.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className="group relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm hover:border-slate-700 transition"
                                        >
                                            <div className="aspect-[3/4] w-full bg-slate-950 overflow-hidden relative">
                                                <img
                                                    src={img.preview}
                                                    alt={`Page ${idx + 1}`}
                                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                                                />
                                                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                                                    পাতা #{idx + 1}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(img.id)}
                                                    disabled={loading}
                                                    className="absolute top-2 right-2 p-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm transition"
                                                    title="এই ছবিটি রিমুভ করুন"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="p-2 bg-slate-900 border-t border-slate-800/80">
                                                <div className="text-[11px] text-white font-medium truncate" title={img.name}>
                                                    {img.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {img.size}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Process Button */}
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-400">
                                        Gemini Vision সবকটি পাতা ক্রমানুসারে পড়ে লিখিত ও নৈর্ব্যক্তিক প্রশ্ন এবং সমাধান স্ট্রাকচার্ড করবে।
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleImageSubmit}
                                        disabled={loading || selectedImages.length === 0}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 shrink-0"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>
                                            {loading
                                                ? `Gemini দিয়ে বিশ্লেষণ চলছে (${selectedImages.length}টি ছবি)...`
                                                : `Gemini Vision দিয়ে ${selectedImages.length}টি ছবি একসাথে বিশ্লেষণ করুন`}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Text Paste */}
                {activeTab === 'text' && (
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    পরীক্ষার নাম (ঐচ্ছিক - Gemini টেক্সট থেকেও বুঝে নিবে):
                                </label>
                                <input
                                    type="text"
                                    value={uploadExamName}
                                    onChange={(e) => setUploadExamName(e.target.value)}
                                    placeholder="যেমন: 44th BCS IT, Combined 8 Banks IT"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    পরীক্ষার সাল (ঐচ্ছিক):
                                </label>
                                <input
                                    type="text"
                                    value={uploadYear}
                                    onChange={(e) => setUploadYear(e.target.value)}
                                    placeholder="যেমন: 2023, 2021"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                যেকোনো অগোছালো প্রশ্ন টেক্সট এখানে পেস্ট করুন:
                            </label>
                            <textarea
                                rows={5}
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="1. What is an index in SQL? (43rd BCS 2021) A) A pointer B) A table C) A key D) None. Correct: A. Explanation..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !rawText.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Gemini দিয়ে প্রসেস করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab 3: AI Question Generator */}
                {activeTab === 'generate' && (
                    <form onSubmit={handleGenerateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    আইটি টপিক বা বিষয়ের নাম:
                                </label>
                                <input
                                    type="text"
                                    value={generateTopic}
                                    onChange={(e) => setGenerateTopic(e.target.value)}
                                    placeholder="e.g. B-Trees and Indexing, Linux Semaphore, TCP 3-Way Handshake"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    প্রশ্নের ফরম্যাট:
                                </label>
                                <select
                                    value={generateType}
                                    onChange={(e) => setGenerateType(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                                >
                                    <option value="mcq">MCQ প্রশ্ন (৪ অপশন)</option>
                                    <option value="written">লিখিত প্রশ্ন (Written)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    প্রশ্নের সংখ্যা:
                                </label>
                                <select
                                    value={generateCount}
                                    onChange={(e) => setGenerateCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                >
                                    <option value={1}>১টি প্রশ্ন</option>
                                    <option value={3}>৩টি প্রশ্ন</option>
                                    <option value={5}>৫টি প্রশ্ন</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">কঠিনতার মাত্রা:</span>
                                {['easy', 'medium', 'hard'].map((diff) => (
                                    <label key={diff} className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="difficulty"
                                            value={diff}
                                            checked={generateDifficulty === diff}
                                            onChange={() => setGenerateDifficulty(diff)}
                                            className="text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                                        />
                                        <span>{diff === 'easy' ? 'সহজ' : diff === 'medium' ? 'মাঝারি' : 'কঠিন'}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !generateTopic.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>নতুন প্রশ্ন তৈরি করুন</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="mt-5 p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <RefreshCw className="w-6 h-6 text-indigo-400 mx-auto animate-spin mb-2" />
                        <h5 className="font-semibold text-slate-200 text-xs">Gemini AI প্রশ্ন বিশ্লেষণ করছে...</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            প্রশ্ন, অপশন এবং টেকনিক্যাল ব্যাখ্যা স্ট্রাকচার্ড করা হচ্ছে।
                        </p>
                    </div>
                )}
            </div>

            {/* Extracted Questions Review Cards */}
            {extractedQuestions.length > 0 && (
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>এক্সট্র্যাক্ট করা প্রশ্নসমূহ ({extractedQuestions.length})</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                নিচের ফর্মগুলো চেক বা এডিট করে "ডাটাবেসে সেভ করুন" বাটনে ক্লিক করুন।
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {duplicateCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleRemoveDuplicates}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>ডুপ্লিকেট বাদ দিন ({duplicateCount})</span>
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={checkingDuplicates}
                                onClick={() => handleCheckDuplicates()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
                                title="ডাটাবেসের সাথে ডুপ্লিকেট আবার যাচাই করুন"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${checkingDuplicates ? 'animate-spin' : ''}`} />
                                <span>যাচাই</span>
                            </button>
                            <button
                                onClick={handleSaveAll}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>সবগুলো সেভ করুন</span>
                            </button>
                        </div>
                    </div>

                    {/* Duplicate Warning Banner */}
                    {duplicateCount > 0 && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs sm:text-sm font-bold text-amber-300">
                                        {duplicateCount}টি সম্ভাব্য ডুপ্লিকেট প্রশ্ন চিহ্নিত হয়েছে!
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5">
                                        এই প্রশ্নগুলো ইতিমধ্যে ডাটাবেসে অথবা বর্তমান এক্সট্র্যাক্ট করা তালিকায় বিদ্যমান।
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleRemoveDuplicates}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>সব ডুপ্লিকেট বাদ দিন ({duplicateCount})</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={skipDuplicatesOnSave}
                                onChange={(e) => setSkipDuplicatesOnSave(e.target.checked)}
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                            />
                            <span className="text-slate-300">সেভ করার সময় ডুপ্লিকেট প্রশ্ন স্বয়ংক্রিয়ভাবে স্কিপ করুন (প্রস্তাবিত)</span>
                        </label>
                        <span>মোট: {extractedQuestions.length}টি প্রশ্ন</span>
                    </div>

                    <div className="space-y-4">
                        {extractedQuestions.map((q, idx) => (
                            <div
                                key={idx}
                                className={`p-5 rounded-xl border shadow-sm transition ${
                                    q.is_duplicate
                                        ? 'bg-[#181309] border-amber-500/40 ring-1 ring-amber-500/20'
                                        : 'bg-[#0f172a] border-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-3 mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                            #{idx + 1}
                                        </span>

                                        <select
                                            value={q.type || 'mcq'}
                                            onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="written">লিখিত (Written)</option>
                                        </select>

                                        {q.type === 'written' && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                                                <span className="text-[11px] text-slate-400">মান:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={q.marks || 5}
                                                    onChange={(e) => handleQuestionChange(idx, 'marks', e.target.value)}
                                                    className="w-12 bg-transparent text-xs text-emerald-400 font-semibold focus:outline-none p-0 border-0"
                                                    title="প্রশ্নের পূর্ণমান"
                                                />
                                            </div>
                                        )}

                                        <input
                                            type="text"
                                            value={q.subject_name || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'subject_name', e.target.value)}
                                            placeholder="বিষয় (Subject)"
                                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            value={q.topic_name || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'topic_name', e.target.value)}
                                            placeholder="টপিক (Topic)"
                                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
                                        />
                                        <input
                                            type="text"
                                            value={q.exam_name || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'exam_name', e.target.value)}
                                            placeholder="পরীক্ষার নাম (e.g. 43rd BCS, Bank IT)"
                                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
                                            title="যে পরীক্ষায় প্রশ্নটি এসেছিল"
                                        />
                                        <input
                                            type="text"
                                            value={q.year || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'year', e.target.value)}
                                            placeholder="সাল (2023)"
                                            className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
                                            title="পরীক্ষার সাল"
                                        />

                                        {q.is_duplicate && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                <span>
                                                    {q.duplicate_reason === 'batch'
                                                        ? 'তালিকায় ডুপ্লিকেট'
                                                        : `ডাটাবেসে বিদ্যমান${q.existing_question?.id ? ` (#${q.existing_question.id})` : ''}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(idx)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                        title="বাদ দিন"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Duplicate Details Banner */}
                                {q.is_duplicate && (
                                    <div className="mb-3 p-3 rounded-lg bg-amber-950/40 border border-amber-500/25 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="text-amber-200/90 text-[11px] leading-relaxed">
                                            <span className="font-bold text-amber-300">
                                                {q.duplicate_reason === 'batch' ? 'সতর্কতা:' : 'ডাটাবেসে অনুরূপ প্রশ্ন রয়েছে:'}
                                            </span>{' '}
                                            {q.existing_question ? (
                                                <>
                                                    <span className="text-slate-200 font-medium">"{q.existing_question.question_text}"</span>
                                                    {q.existing_question.subject_name && (
                                                        <span className="ml-1 text-indigo-300 font-mono text-[10px]">
                                                            [{q.existing_question.subject_name}]
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-slate-300">এই প্রশ্নটি বর্তমান আপলোড তালিকায় একাধিকবার এসেছে।</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(idx)}
                                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold transition"
                                        >
                                            <Trash2 className="w-3 h-3 text-amber-400" />
                                            <span>বাদ দিন</span>
                                        </button>
                                    </div>
                                )}

                                {/* Question Text */}
                                <div className="mb-3">
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                        প্রশ্ন:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.question_text || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Code Snippet */}
                                {q.code_snippet !== undefined && (
                                    <div className="mb-3">
                                        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <Code className="w-3 h-3 text-cyan-400" />
                                            <span>কোড স্নিপেট:</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={q.code_snippet || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'code_snippet', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                )}

                                {/* If Written Question: Show Written Answer / Model Solution */}
                                {q.type === 'written' ? (
                                    <div className="mb-3">
                                        <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>মডেল উত্তর ও লিখিত সমাধান (কোড / SQL / থিওরি):</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={q.written_answer || q.explanation || ''}
                                            onChange={(e) => handleQuestionChange(idx, 'written_answer', e.target.value)}
                                            placeholder="মডেল সমাধান বা লিখিত উত্তর লিখুন..."
                                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                ) : (
                                    /* If MCQ Question: Show 4 Options */
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                        {['A', 'B', 'C', 'D'].map((opt) => (
                                            <div
                                                key={opt}
                                                className={`p-2 rounded-lg border flex items-center gap-2 ${
                                                    q.correct_option?.toUpperCase() === opt
                                                        ? 'bg-emerald-500/10 border-emerald-500/40'
                                                        : 'bg-slate-900 border-slate-800'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionChange(idx, 'correct_option', opt)}
                                                    className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                                        q.correct_option?.toUpperCase() === opt
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={q.options?.[opt] || ''}
                                                    onChange={(e) => handleOptionChange(idx, opt, e.target.value)}
                                                    placeholder={`অপশন ${opt}`}
                                                    className="w-full bg-transparent border-0 p-0 text-xs text-slate-200 focus:outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Explanation */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                        অতিরিক্ত টেকনিক্যাল ব্যাখ্যা বা নোট:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={q.explanation || ''}
                                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
