import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    PlayCircle,
    FileText,
    UploadCloud,
    BookOpen,
    BarChart3,
    Flame,
    AlertTriangle,
    CheckCircle2,
    X,
    User as UserIcon,
    LogOut,
    Menu,
    ChevronRight,
    GraduationCap,
    ShieldAlert,
    Target,
    Users,
    Library
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [dismissAlert, setDismissAlert] = useState(false);

    const navItems = [
        {
            group: 'মূল মেনু',
            items: [
                {
                    name: 'ড্যাশবোর্ড',
                    href: route('dashboard'),
                    active: route().current('dashboard'),
                    icon: LayoutDashboard,
                },
                {
                    name: 'লেকচার শিট ও নোটস',
                    href: route('notes.index'),
                    active: route().current('notes.*'),
                    icon: Library,
                },
                {
                    name: 'কুইক প্র্যাকটিস',
                    href: route('questions.practice'),
                    active: route().current('questions.practice'),
                    icon: PlayCircle,
                },
                {
                    name: 'মক টেস্ট ও পরীক্ষা',
                    href: route('quizzes.index'),
                    active: route().current('quizzes.*'),
                    icon: FileText,
                },
            ],
        },
        {
            group: 'প্রশ্নব্যাংক ও কালেকশন',
            items: [
                {
                    name: 'প্রশ্ন আপলোড ও প্রসেসিং',
                    href: route('questions.upload'),
                    active: route().current('questions.upload'),
                    icon: UploadCloud,
                },
                {
                    name: 'আইটি প্রশ্নব্যাংক',
                    href: route('questions.index'),
                    active: route().current('questions.index'),
                    icon: BookOpen,
                },
            ],
        },
        {
            group: 'অ্যানালাইটিক্স ও রিপোর্ট',
            items: [
                {
                    name: 'ডেইলি ও উইকলি রিপোর্ট',
                    href: route('analytics.index'),
                    active: route().current('analytics.index'),
                    icon: BarChart3,
                },
            ],
        },
        {
            group: 'অ্যাডমিন',
            items: [
                {
                    name: 'ইউজার ম্যানেজমেন্ট',
                    href: route('users.index'),
                    active: route().current('users.*'),
                    icon: Users,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex antialiased">
            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
                />
            )}

            {/* Left Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
                        <Link href={route('dashboard')} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-base shadow-sm group-hover:border-slate-600 transition">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm tracking-tight text-white">
                                    PoraChira IT
                                </span>
                                <span className="text-[11px] text-slate-400">পরীক্ষার প্রস্তুতি প্ল্যাটফর্ম</span>
                            </div>
                        </Link>

                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Streak & Profile Card */}
                    <div className="p-3.5 m-3 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                                        {user?.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            {/* Flame Streak Count */}
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
                                title="বর্তমান একটানা পড়ার স্ট্রিক"
                            >
                                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{user?.streak || 0}d</span>
                            </div>
                        </div>

                        {/* Penalty indicator if missed days */}
                        {user?.penalties > 0 && (
                            <div className="text-[10px] text-rose-400 bg-rose-500/10 py-1 px-2 rounded-md border border-rose-500/20 flex items-center gap-1 font-medium mt-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{user.penalties} দিন প্র্যাকটিস মিসড</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Menu Links */}
                    <div className="px-3 py-2 space-y-5 overflow-y-auto max-h-[calc(100vh-250px)]">
                        {navItems.map((section, sIdx) => (
                            <div key={sIdx}>
                                <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                    {section.group}
                                </div>
                                <div className="space-y-0.5">
                                    {section.items.map((item, iIdx) => {
                                        const Icon = item.icon;
                                        const isActive = item.active;

                                        return (
                                            <Link
                                                key={iIdx}
                                                href={item.href}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                                                    isActive
                                                        ? 'bg-slate-800 text-white border border-slate-700/80 font-semibold'
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Icon
                                                        className={`w-4 h-4 ${
                                                            isActive ? 'text-indigo-400' : 'text-slate-500'
                                                        }`}
                                                    />
                                                    <span>{item.name}</span>
                                                </div>

                                                {item.badge && (
                                                    <span
                                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                                                            isActive
                                                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                                                : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-1">
                    <Link
                        href={route('profile.edit')}
                        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                    >
                        <UserIcon className="w-4 h-4" />
                        <span>প্রোফাইল</span>
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="লগআউট"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </aside>

            {/* Main Content Area (offset by sidebar width 256px on lg) */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                            <span>হোম</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-200 font-medium capitalize">
                                {route().current()?.replace('.', ' / ') || 'ড্যাশবোর্ড'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live Practice Quick Button */}
                        <Link
                            href={route('questions.practice')}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>অনুশীলন করুন</span>
                        </Link>

                        {/* Top Profile Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="hidden md:inline font-semibold text-slate-200">{user?.name}</span>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="bg-slate-800 border border-slate-700 shadow-xl rounded-xl py-1 text-slate-200 w-48">
                                    <Dropdown.Link href={route('profile.edit')} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                                        প্রোফাইল সেটিংস
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-rose-400 hover:text-rose-300 hover:bg-slate-700/50">
                                        লগআউট
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && !dismissAlert && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm shadow-md">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                            <button onClick={() => setDismissAlert(true)} className="text-emerald-400 hover:text-emerald-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {flash?.error && !dismissAlert && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm shadow-md">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{flash.error}</span>
                            </div>
                            <button onClick={() => setDismissAlert(true)} className="text-rose-400 hover:text-rose-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Header (if passed) */}
                {header && (
                    <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-800/60 bg-[#0d131f]/60">
                        {header}
                    </div>
                )}

                {/* Page Content Body */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p>© 2026 PoraChira IT Preparation • Built for Engineering & Competitive Exam Candidates</p>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Gemini 3.8 Flash Online
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
