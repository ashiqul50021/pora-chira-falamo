import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Library,
    Clock,
    Eye,
    ArrowLeft,
    CheckCircle2,
    PlayCircle,
    Share2,
    BookOpen,
    Sparkles,
    ChevronRight,
    Tag,
    Copy,
    Check
} from 'lucide-react';

export default function Show({ note, relatedNotes, availableQuestionsCount }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Render formatted markdown content
    const renderMarkdownContent = (content) => {
        if (!content) return null;

        // Split by lines or paragraphs
        const lines = content.split('\n');
        const elements = [];
        let inCodeBlock = false;
        let codeContent = [];
        let codeLang = '';
        let tableRows = [];
        let inTable = false;

        const flushTable = (key) => {
            if (tableRows.length === 0) return null;
            const rows = [...tableRows];
            tableRows = [];
            inTable = false;

            const headerRow = rows[0];
            const dataRows = rows.slice(1).filter((r) => !r.every((cell) => cell.match(/^:?-+:?$/)));

            return (
                <div key={key} className="my-6 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/80 shadow-md">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800 text-slate-100 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                            <tr>
                                {headerRow.map((cell, cIdx) => (
                                    <th key={cIdx} className="px-4 py-3">
                                        {formatInlineStyles(cell.trim())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {dataRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-4 py-2.5">
                                            {formatInlineStyles(cell.trim())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        };

        const formatInlineStyles = (text) => {
            if (!text) return text;

            // Handle bold **text** and inline `code`
            const parts = [];
            const regex = /(\*\*.*?\*\*|`.*?`)/g;
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                }
                const token = match[0];
                if (token.startsWith('**') && token.endsWith('**')) {
                    parts.push(
                        <strong key={match.index} className="text-white font-bold">
                            {token.slice(2, -2)}
                        </strong>
                    );
                } else if (token.startsWith('`') && token.endsWith('`')) {
                    parts.push(
                        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                            {token.slice(1, -1)}
                        </code>
                    );
                }
                lastIndex = regex.lastIndex;
            }

            if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }

            return parts.length > 0 ? parts : text;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Code block toggle
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    elements.push(
                        <div key={`code-${i}`} className="my-5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                            {codeLang && (
                                <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                                    {codeLang}
                                </div>
                            )}
                            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                                {codeContent.join('\n')}
                            </pre>
                        </div>
                    );
                    codeContent = [];
                    inCodeBlock = false;
                    codeLang = '';
                } else {
                    if (inTable) elements.push(flushTable(`table-${i}`));
                    inCodeBlock = true;
                    codeLang = line.trim().slice(3).trim();
                }
                continue;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                continue;
            }

            // Table check
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                inTable = true;
                const cells = line
                    .trim()
                    .slice(1, -1)
                    .split('|')
                    .map((c) => c.trim());
                tableRows.push(cells);
                continue;
            } else if (inTable) {
                elements.push(flushTable(`table-${i}`));
            }

            // Headings
            if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={i} className="text-xl font-extrabold text-white mt-8 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>{formatInlineStyles(line.replace('## ', ''))}</span>
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={i} className="text-base font-bold text-cyan-300 mt-6 mb-2">
                        {formatInlineStyles(line.replace('### ', ''))}
                    </h3>
                );
            } else if (line.startsWith('#### ')) {
                elements.push(
                    <h4 key={i} className="text-sm font-semibold text-slate-200 mt-4 mb-1.5">
                        {formatInlineStyles(line.replace('#### ', ''))}
                    </h4>
                );
            } else if (line.trim() === '---') {
                elements.push(<hr key={i} className="my-6 border-slate-800" />);
            } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                elements.push(
                    <div key={i} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2"></span>
                        <div>{formatInlineStyles(line.trim().replace(/^[\*\-]\s+/, ''))}</div>
                    </div>
                );
            } else if (line.trim().match(/^\d+\.\s+/)) {
                const matchNum = line.trim().match(/^(\d+)\.\s+(.*)/);
                elements.push(
                    <div key={i} className="flex items-start gap-2.5 my-2 text-xs sm:text-sm text-slate-300 leading-relaxed pl-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-700">
                            {matchNum ? matchNum[1] : '•'}
                        </span>
                        <div>{formatInlineStyles(matchNum ? matchNum[2] : line)}</div>
                    </div>
                );
            } else if (line.trim().length > 0) {
                elements.push(
                    <p key={i} className="my-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {formatInlineStyles(line)}
                    </p>
                );
            }
        }

        if (inTable) {
            elements.push(flushTable('final-table'));
        }

        return elements;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${note.title} - স্টাডি নোট`} />

            {/* Top Navigation & Breadcrumbs */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Link
                        href={route('notes.index')}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>লেকচার শিট তালিকা</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-300 font-medium">{note.subject?.name}</span>
                    {note.topic && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-400 truncate max-w-[150px]">{note.topic.name}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">কপি হয়েছে</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>শেয়ার লিংক</span>
                            </>
                        )}
                    </button>

                    {note.topic_id && availableQuestionsCount > 0 && (
                        <Link
                            href={route('questions.practice', {
                                subject_id: note.subject_id,
                                topic_id: note.topic_id,
                            })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>প্র্যাকটিস শুরু করুন ({availableQuestionsCount})</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 2-Column Reader Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <article className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e1628] border border-slate-800 shadow-xl">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                                {note.subject?.name}
                            </span>
                            {note.topic && (
                                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                                    {note.topic.name}
                                </span>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-400 ml-auto">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    {note.read_time_minutes} মিনিট পাঠ
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    {note.views_count} ভিউ
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-4">
                            {note.title}
                        </h1>

                        {/* Summary Lead */}
                        {note.summary && (
                            <div className="p-4 rounded-xl bg-slate-950/60 border-l-4 border-cyan-500 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                                {note.summary}
                            </div>
                        )}

                        {/* Key Points / Takeaways Card */}
                        {Array.isArray(note.key_points) && note.key_points.length > 0 && (
                            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/30 border border-cyan-500/30 shadow-lg">
                                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
                                    <Sparkles className="w-4 h-4 text-cyan-400" />
                                    <span>পরীক্ষার জন্য গুরুত্বপূর্ণ সারসংক্ষেপ (Key Takeaways):</span>
                                </div>
                                <div className="space-y-2">
                                    {note.key_points.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Body Markdown Content */}
                        <div className="article-body">
                            {renderMarkdownContent(note.content)}
                        </div>

                        {/* Bottom Action Banner: Practice this topic */}
                        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                                    <span>পড়া শেষ? এবার প্রস্তুতি যাচাই করুন!</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    এই টপিকের বিগত বছরের প্রশ্ন ও MCQ উত্তর দিয়ে এখনই প্র্যাকটিস শুরু করুন।
                                </p>
                            </div>

                            <Link
                                href={
                                    note.topic_id
                                        ? route('questions.practice', {
                                              subject_id: note.subject_id,
                                              topic_id: note.topic_id,
                                          })
                                        : route('questions.practice', {
                                              subject_id: note.subject_id,
                                          })
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition whitespace-nowrap"
                            >
                                <PlayCircle className="w-4 h-4" />
                                <span>টপিক প্র্যাকটিস শুরু করুন</span>
                            </Link>
                        </div>
                    </article>
                </div>

                {/* Sidebar Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Topic Practice Box */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                        <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                            <PlayCircle className="w-4 h-4 text-cyan-400" />
                            <span>টপিক কুইজ ও অনুশীলন</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                            এই বিষয়ের অধীনে মোট <span className="text-white font-bold">{availableQuestionsCount}</span> টি প্রশ্ন প্রশ্নব্যাংকে রয়েছে।
                        </p>
                        <Link
                            href={
                                note.topic_id
                                    ? route('questions.practice', {
                                          subject_id: note.subject_id,
                                          topic_id: note.topic_id,
                                      })
                                    : route('questions.practice', {
                                          subject_id: note.subject_id,
                                      })
                            }
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                        >
                            <span>কুইক প্র্যাকটিস খেলুন</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Related Notes */}
                    {relatedNotes?.length > 0 && (
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                <span>একই বিষয়ের অন্যান্য নোটস</span>
                            </h3>

                            <div className="space-y-3">
                                {relatedNotes.map((rel) => (
                                    <Link
                                        key={rel.id}
                                        href={route('notes.show', rel.slug)}
                                        className="group block p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-800 transition"
                                    >
                                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-2 transition mb-1">
                                            {rel.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {rel.read_time_minutes} মি.
                                            </span>
                                            <span>•</span>
                                            <span>{rel.views_count} ভিউ</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Coach Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 shadow-lg">
                        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>Gemini AI স্টাডি টিপ</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            থিওরি পড়ার সাথে সাথে নিয়মিত MCQ ও রিটেন প্র্যাকটিস করলে মেমোরি রিটেনশন ৮০% পর্যন্ত বৃদ্ধি পায়। প্রতিদিন অন্তত ১৫টি প্রশ্ন সমাধান করার অভ্যাস গড়ে তুলুন!
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
