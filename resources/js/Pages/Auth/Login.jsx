import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Zap
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Quick fill for testing
    const handleQuickFill = () => {
        setData({
            email: 'admin@admin.com',
            password: 'password',
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="লগইন করুন - PoraChira IT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    স্বাগতম! লগইন করুন
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    আপনার একাউন্টে প্রবেশ করে পরীক্ষার প্রস্তুতি শুরু করুন
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {/* Error Banner */}
            {(errors.email || errors.password) && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errors.email || errors.password}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ইমেইল এড্রেস (Email)
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            placeholder="user@example.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                            পাসওয়ার্ড (Password)
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                            >
                                ভুলে গেছেন?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            placeholder="আপনার পাসওয়ার্ড লিখুন..."
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-xs text-slate-400">আমাকে মনে রাখুন (Remember me)</span>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                    <LogIn className="w-4 h-4" />
                    <span>{processing ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
                </button>
            </form>

            {/* Quick Demo Login Auto-fill Box */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
                <button
                    type="button"
                    onClick={handleQuickFill}
                    className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 text-slate-300 text-xs font-medium transition flex items-center justify-center gap-2 group"
                >
                    <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
                    <span>⚡ টেস্ট করতে ক্লিক করুন: <b>admin@admin.com</b></span>
                </button>
            </div>

            {/* Register Link */}
            <div className="mt-5 text-center text-xs text-slate-400">
                একাউন্ট নেই?{' '}
                <Link
                    href={route('register')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition"
                >
                    নতুন একাউন্ট তৈরি করুন
                </Link>
            </div>
        </GuestLayout>
    );
}
