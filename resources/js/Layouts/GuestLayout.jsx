import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden antialiased selection:bg-indigo-500 selection:text-white">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Brand Logo Header */}
            <div className="mb-6 z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 group-hover:scale-105 transition duration-200">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                            <span>PoraChira IT</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                PRO
                            </span>
                        </span>
                        <span className="text-xs text-slate-400">পরীক্ষার প্রস্তুতি ও প্রশ্নব্যাংক প্ল্যাটফর্ম</span>
                    </div>
                </Link>
            </div>

            {/* Auth Card Box */}
            <div className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 z-10">
                {children}
            </div>

            {/* Simple Footer */}
            <div className="mt-8 text-center text-xs text-slate-500 z-10">
                © {new Date().getFullYear()} PoraChira IT • Engineering & Competitive Exam Platform
            </div>
        </div>
    );
}
