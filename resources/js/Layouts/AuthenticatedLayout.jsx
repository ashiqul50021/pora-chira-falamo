import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Flame, 
    AlertTriangle, 
    Sparkles, 
    BookOpen, 
    FileText, 
    BarChart3, 
    LayoutDashboard,
    PlayCircle,
    UploadCloud,
    CheckCircle2,
    X
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [dismissAlert, setDismissAlert] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Brand & Main Links */}
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition duration-200">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                                        PoraChira IT
                                    </span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-400">
                                        AI Exam Prep
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden md:flex space-x-1 lg:space-x-2">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('dashboard')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    ড্যাশবোর্ড
                                </Link>

                                <Link
                                    href={route('questions.practice')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('questions.practice')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                                    প্র্যাকটিস
                                </Link>

                                <Link
                                    href={route('quizzes.index')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('quizzes.*')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                    মক টেস্ট
                                </Link>

                                <Link
                                    href={route('questions.upload')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('questions.upload')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <UploadCloud className="w-4 h-4 text-purple-400" />
                                    AI স্টুডিও
                                </Link>

                                <Link
                                    href={route('questions.index')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('questions.index')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4 text-amber-400" />
                                    প্রশ্নব্যাংক
                                </Link>

                                <Link
                                    href={route('analytics.index')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                        route().current('analytics.index')
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4 text-rose-400" />
                                    উইকলি রিপোর্ট
                                </Link>
                            </div>
                        </div>

                        {/* Right Area: Streak, Penalty, User profile */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-3">
                            {/* Streak Counter Badge */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-sm">
                                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                                <span>{user?.streak || 0} দিন স্ট্রিক</span>
                            </div>

                            {/* Penalty Badge (if any) */}
                            {user?.penalties > 0 && (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium" title={`${user.penalties} দিন মিস হয়েছিল!`}>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>-{user.penalties} মিসড</span>
                                </div>
                            )}

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium transition focus:outline-none"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span>{user?.name}</span>
                                            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="bg-slate-800 border border-slate-700 shadow-xl rounded-xl py-1 text-slate-200">
                                        <Dropdown.Link href={route('profile.edit')} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                                            প্রোফাইল
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-rose-400 hover:text-rose-300 hover:bg-slate-700/50">
                                            লগআউট
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu toggle button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Responsive Navigation Dropdown */}
                {showingNavigationDropdown && (
                    <div className="sm:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-1">
                        <Link href={route('dashboard')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            ড্যাশবোর্ড
                        </Link>
                        <Link href={route('questions.practice')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            প্র্যাকটিস
                        </Link>
                        <Link href={route('quizzes.index')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            মক টেস্ট
                        </Link>
                        <Link href={route('questions.upload')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            AI স্টুডিও
                        </Link>
                        <Link href={route('questions.index')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            প্রশ্নব্যাংক
                        </Link>
                        <Link href={route('analytics.index')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800">
                            উইকলি রিপোর্ট
                        </Link>
                        <div className="pt-3 border-t border-slate-800">
                            <div className="text-xs text-amber-400 font-medium mb-1">
                                🔥 {user?.streak || 0} দিন স্ট্রিক
                            </div>
                            <Link href={route('profile.edit')} className="block px-3 py-1.5 text-sm text-slate-300">
                                প্রোফাইল
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-3 py-1.5 text-sm text-rose-400">
                                লগআউট
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Flash Alerts */}
            {flash?.success && !dismissAlert && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm shadow-md">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                        <button onClick={() => setDismissAlert(true)} className="text-emerald-400 hover:text-emerald-200">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {flash?.error && !dismissAlert && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm shadow-md">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                        <button onClick={() => setDismissAlert(true)} className="text-rose-400 hover:text-rose-200">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Page Header */}
            {header && (
                <header className="bg-slate-900/50 border-b border-slate-800/80">
                    <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                <p>PoraChira IT Exam Preparation Platform • Powered by Laravel, Inertia React & Gemini 3.8 Flash</p>
            </footer>
        </div>
    );
}
