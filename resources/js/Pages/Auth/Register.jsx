import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    AlertCircle
} from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="রেজিস্ট্রেশন করুন - PoraChira IT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    নতুন অ্যাকাউন্ট তৈরি করুন
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    আজই যোগ দিন এবং আপনার পরীক্ষার প্রস্তুতি শুরু করুন
                </p>
            </div>

            {/* Error Banner */}
            {(errors.name || errors.email || errors.password || errors.password_confirmation) && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                        {errors.name || errors.email || errors.password || errors.password_confirmation}
                    </span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Name Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        পুরো নাম (Full Name)
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            autoFocus
                            placeholder="যেমন: মোঃ সাকিব হাসান"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

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
                            placeholder="user@example.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        পাসওয়ার্ড (Password)
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            placeholder="কমপক্ষে ৮ ক্যারেক্টার..."
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
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            required
                            placeholder="পাসওয়ার্ড পুনরায় লিখুন..."
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>{processing ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}</span>
                </button>
            </form>

            {/* Login Link */}
            <div className="mt-5 text-center text-xs text-slate-400">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link
                    href={route('login')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition"
                >
                    লগইন করুন
                </Link>
            </div>
        </GuestLayout>
    );
}
