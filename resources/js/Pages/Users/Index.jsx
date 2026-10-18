import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    UserPlus,
    UserCheck,
    ShieldCheck,
    Search,
    Trash2,
    Edit3,
    Plus,
    X,
    Key,
    Mail,
    FileSpreadsheet,
    AlertCircle,
    Check,
    Calendar,
    Award,
    BookOpen,
    Filter,
    HelpCircle,
    Shield
} from 'lucide-react';

export default function UsersIndex({ users, filters, stats }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    // Modals state
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    // Single User Form
    const singleForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'candidate',
    });

    // Edit User Form
    const editForm = useForm({
        name: '',
        email: '',
        role: 'candidate',
        password: '',
    });

    // Bulk Users State (array of user objects)
    const [bulkRows, setBulkRows] = useState([
        { name: '', email: '', password: 'password123', role: 'candidate' },
        { name: '', email: '', password: 'password123', role: 'candidate' },
    ]);
    const [csvInput, setCsvInput] = useState('');
    const [bulkMode, setBulkMode] = useState('rows'); // 'rows' or 'csv'
    const [bulkError, setBulkError] = useState('');
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

    // Search submit
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('users.index'),
            { search: searchTerm, role: roleFilter },
            { preserveState: true }
        );
    };

    const handleRoleChange = (role) => {
        setRoleFilter(role);
        router.get(
            route('users.index'),
            { search: searchTerm, role },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setRoleFilter('');
        router.get(route('users.index'));
    };

    // Single user submit
    const handleSingleSubmit = (e) => {
        e.preventDefault();
        singleForm.post(route('users.store'), {
            onSuccess: () => {
                setShowSingleModal(false);
                singleForm.reset();
            },
        });
    };

    // Open edit modal
    const openEditModal = (user) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role || 'candidate',
            password: '',
        });
    };

    // Edit user submit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(route('users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    // Delete user
    const confirmDelete = () => {
        if (!deletingUser) return;
        router.delete(route('users.destroy', deletingUser.id), {
            onSuccess: () => {
                setDeletingUser(null);
            },
        });
    };

    // Add empty row in bulk mode
    const addBulkRow = () => {
        setBulkRows([
            ...bulkRows,
            { name: '', email: '', password: 'password123', role: 'candidate' },
        ]);
    };

    // Remove row in bulk mode
    const removeBulkRow = (index) => {
        if (bulkRows.length <= 1) return;
        setBulkRows(bulkRows.filter((_, i) => i !== index));
    };

    // Update row value
    const updateBulkRow = (index, field, value) => {
        const updated = [...bulkRows];
        updated[index][field] = value;
        setBulkRows(updated);
    };

    // Parse CSV / Text lines
    const handleParseCsv = () => {
        setBulkError('');
        if (!csvInput.trim()) {
            setBulkError('অনুগ্রহ করে ডাটা পেস্ট করুন।');
            return;
        }

        const lines = csvInput.trim().split('\n');
        const parsed = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // format: name, email, password, role OR name, email
            const parts = line.split(',').map((p) => p.trim());
            if (parts.length < 2) {
                setBulkError(`লাইন ${i + 1}-এ তথ্য অসম্পূর্ণ: নাম ও ইমেইল অবশ্যই থাকতে হবে।`);
                return;
            }

            const [name, email, password, role] = parts;
            parsed.push({
                name: name || '',
                email: email || '',
                password: password || 'password123',
                role: (role && ['admin', 'candidate'].includes(role.toLowerCase()))
                    ? role.toLowerCase()
                    : 'candidate',
            });
        }

        if (parsed.length === 0) {
            setBulkError('কোনো সঠিক তথ্য পাওয়া যায়নি।');
            return;
        }

        setBulkRows(parsed);
        setBulkMode('rows');
        setCsvInput('');
    };

    // Submit bulk users
    const handleBulkSubmit = (e) => {
        e.preventDefault();
        setBulkError('');

        // Filter out empty rows
        const validRows = bulkRows.filter(
            (r) => r.name.trim() !== '' && r.email.trim() !== ''
        );

        if (validRows.length === 0) {
            setBulkError('অন্তত একজন ইউজারের নাম এবং ইমেইল পূরণ করুন।');
            return;
        }

        // Validate basic email format and duplicate emails in input
        const emails = new Set();
        for (const r of validRows) {
            if (!r.email.includes('@') || !r.email.includes('.')) {
                setBulkError(`'${r.email}' একটি সঠিক ইমেইল নয়।`);
                return;
            }
            if (emails.has(r.email.toLowerCase())) {
                setBulkError(`ইমেইল '${r.email}' তালিকায় একাধিকবার রয়েছে।`);
                return;
            }
            emails.add(r.email.toLowerCase());
        }

        setIsSubmittingBulk(true);
        router.post(
            route('users.store'),
            { users: validRows },
            {
                onSuccess: () => {
                    setIsSubmittingBulk(false);
                    setShowBulkModal(false);
                    setBulkRows([
                        { name: '', email: '', password: 'password123', role: 'candidate' },
                        { name: '', email: '', password: 'password123', role: 'candidate' },
                    ]);
                },
                onError: (errors) => {
                    setIsSubmittingBulk(false);
                    const firstError = Object.values(errors)[0];
                    setBulkError(firstError || 'ইউজার যুক্ত করতে সমস্যা হয়েছে।');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="ইউজার ম্যানেজমেন্ট" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    ইউজার ম্যানেজমেন্ট ও টিম একাউন্ট
                                </h1>
                                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                                    {stats?.total_users || 0} মেম্বার
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                একাধিক ক্যান্ডিডেট ও অ্যাডমিন যুক্ত করুন, রোল পরিবর্তন ও পরিচালনা করুন
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Single User Add Button */}
                        <button
                            onClick={() => setShowSingleModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
                        >
                            <UserPlus className="w-4 h-4 text-indigo-400" />
                            <span>একক ইউজার যোগ</span>
                        </button>

                        {/* Bulk Multi-User Add Button */}
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>একসাথে একাধিক ইউজার (Bulk Add)</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">সর্বমোট ইউজার</div>
                            <div className="text-xl font-bold text-white">{stats?.total_users || 0}</div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">অ্যাডমিন একাউন্ট</div>
                            <div className="text-xl font-bold text-purple-400">{stats?.total_admins || 0}</div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">পরীক্ষার্থী / ক্যান্ডিডেট</div>
                            <div className="text-xl font-bold text-cyan-400">{stats?.total_candidates || 0}</div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">এই সপ্তাহে যুক্ত হয়েছে</div>
                            <div className="text-xl font-bold text-emerald-400">+{stats?.new_this_week || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="নাম অথবা ইমেইল দিয়ে সার্চ করুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
                        >
                            সার্চ
                        </button>
                    </form>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                            <button
                                onClick={() => handleRoleChange('')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                    roleFilter === ''
                                        ? 'bg-slate-800 text-white shadow-sm font-semibold'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                সকল ({stats?.total_users || 0})
                            </button>
                            <button
                                onClick={() => handleRoleChange('admin')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                    roleFilter === 'admin'
                                        ? 'bg-purple-600 text-white shadow-sm font-semibold'
                                        : 'text-slate-400 hover:text-purple-300'
                                }`}
                            >
                                অ্যাডমিন ({stats?.total_admins || 0})
                            </button>
                            <button
                                onClick={() => handleRoleChange('candidate')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                    roleFilter === 'candidate'
                                        ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                                        : 'text-slate-400 hover:text-cyan-300'
                                }`}
                            >
                                ক্যান্ডিডেট ({stats?.total_candidates || 0})
                            </button>
                        </div>

                        {(searchTerm || roleFilter) && (
                            <button
                                onClick={handleReset}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition shrink-0"
                            >
                                রিসেট
                            </button>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                <tr>
                                    <th className="py-3.5 px-4 sm:px-6">ইউজার / নাম ও ইমেইল</th>
                                    <th className="py-3.5 px-4">রোল</th>
                                    <th className="py-3.5 px-4 text-center">আপলোডকৃত প্রশ্ন</th>
                                    <th className="py-3.5 px-4 text-center">কুইজ পরীক্ষা</th>
                                    <th className="py-3.5 px-4">যোগদানের তারিখ</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="w-10 h-10 text-slate-600" />
                                                <span className="text-sm font-medium">কোনো ইউজার পাওয়া যায়নি</span>
                                                <button
                                                    onClick={() => setShowSingleModal(true)}
                                                    className="text-xs text-indigo-400 hover:underline mt-1"
                                                >
                                                    নতুন ইউজার তৈরি করুন
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => {
                                        const isCurrentUser = u.id === currentUserId;
                                        const isAdmin = u.role === 'admin';

                                        return (
                                            <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                                <td className="py-4 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                                                            isAdmin
                                                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
                                                                : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                                                        }`}>
                                                            {u.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white flex items-center gap-1.5">
                                                                <span>{u.name}</span>
                                                                {isCurrentUser && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                                        আপনি (Current)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                                <Mail className="w-3 h-3 text-slate-500" />
                                                                <span>{u.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {isAdmin ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            <span>অ্যাডমিন (Admin)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                                            <UserCheck className="w-3 h-3" />
                                                            <span>ক্যান্ডিডেট (Student)</span>
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <span className="font-semibold text-slate-200">
                                                        {u.questions_count || 0}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 ml-1">টি</span>
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <span className="font-semibold text-slate-200">
                                                        {u.quiz_attempts_count || 0}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 ml-1">বার</span>
                                                </td>

                                                <td className="py-4 px-4 text-slate-400 text-xs">
                                                    {new Date(u.created_at).toLocaleDateString('bn-BD', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>

                                                <td className="py-4 px-4 sm:px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditModal(u)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
                                                            title="ইউজার এডিট ও রোল পরিবর্তন"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeletingUser(u)}
                                                            disabled={isCurrentUser}
                                                            className={`p-1.5 rounded-lg transition ${
                                                                isCurrentUser
                                                                    ? 'text-slate-600 cursor-not-allowed'
                                                                    : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                                            }`}
                                                            title={isCurrentUser ? 'নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না' : 'ইউজার মুছুন'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="py-4 px-6 border-t border-slate-800 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                মোট {users.total} জন ইউজারের মধ্যে {users.from}-{users.to} দেখাচ্ছে
                            </div>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : link.url
                                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                : 'text-slate-600 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal 1: Single User Add */}
            {showSingleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-white text-base">নতুন একক ইউজার যোগ করুন</h3>
                            </div>
                            <button
                                onClick={() => setShowSingleModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    পুরো নাম (Full Name) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="যেমন: মোঃ সাকিব রহমান"
                                    value={singleForm.data.name}
                                    onChange={(e) => singleForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {singleForm.errors.name && (
                                    <div className="text-rose-400 text-xs mt-1">{singleForm.errors.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    ইমেইল এড্রেস (Email) *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@example.com"
                                    value={singleForm.data.email}
                                    onChange={(e) => singleForm.setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {singleForm.errors.email && (
                                    <div className="text-rose-400 text-xs mt-1">{singleForm.errors.email}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    পাসওয়ার্ড (Password) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        placeholder="কমপক্ষে ৬ ক্যারেক্টার..."
                                        value={singleForm.data.password}
                                        onChange={(e) => singleForm.setData('password', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                {singleForm.errors.password && (
                                    <div className="text-rose-400 text-xs mt-1">{singleForm.errors.password}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    ইউজার রোল (Role)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                            singleForm.data.role === 'candidate'
                                                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="candidate"
                                            checked={singleForm.data.role === 'candidate'}
                                            onChange={() => singleForm.setData('role', 'candidate')}
                                            className="hidden"
                                        />
                                        <UserCheck className="w-4 h-4 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-white">ক্যান্ডিডেট</div>
                                            <div className="text-[10px] text-slate-400">পরীক্ষা ও প্র্যাকটিস করবে</div>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                            singleForm.data.role === 'admin'
                                                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={singleForm.data.role === 'admin'}
                                            onChange={() => singleForm.setData('role', 'admin')}
                                            className="hidden"
                                        />
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-white">অ্যাডমিন</div>
                                            <div className="text-[10px] text-slate-400">সম্পূর্ণ নিয়ন্ত্রণ ও ম্যানেজমেন্ট</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowSingleModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={singleForm.processing}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                                >
                                    {singleForm.processing ? 'তৈরি হচ্ছে...' : 'ইউজার তৈরি করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Bulk Multi-User Add */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">একসাথে একাধিক ইউজার যুক্ত করুন (Bulk Add)</h3>
                                    <p className="text-xs text-slate-400">
                                        সারি আকারে টাইপ করুন অথবা তালিকা পেস্ট করুন
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBulkMode('rows')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        bulkMode === 'rows'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    টেবিল সারি আকারে ইনপুট ({bulkRows.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBulkMode('csv')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        bulkMode === 'csv'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    টেক্সট / CSV পেস্ট করুন
                                </button>
                            </div>

                            {bulkMode === 'rows' && (
                                <button
                                    type="button"
                                    onClick={addBulkRow}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-semibold transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>আরও একটি সারি যোগ</span>
                                </button>
                            )}
                        </div>

                        {/* Error Notice */}
                        {bulkError && (
                            <div className="mx-6 mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                <span>{bulkError}</span>
                            </div>
                        )}

                        {/* Body Container */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {bulkMode === 'csv' ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                                        <div className="font-semibold text-white">ফরম্যাট নির্দেশিকা:</div>
                                        <div className="font-mono text-slate-400">নাম, ইমেইল, পাসওয়ার্ড, রোল</div>
                                        <div className="font-mono text-indigo-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                                            Tanvir Ahmed, tanvir@gmail.com, pass1234, candidate<br />
                                            Nusrat Jahan, nusrat@gmail.com, pass1234, candidate<br />
                                            Admin Hasan, admin2@gmail.com, pass1234, admin
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            * পাসওয়ার্ড ও রোল না দিলে স্বয়ংক্রিয়ভাবে 'password123' ও 'candidate' হিসেবে যুক্ত হবে।
                                        </div>
                                    </div>

                                    <textarea
                                        rows="8"
                                        placeholder="এখানে উপরে দেখানো ফরম্যাটে ডাটা পেস্ট করুন..."
                                        value={csvInput}
                                        onChange={(e) => setCsvInput(e.target.value)}
                                        className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleParseCsv}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
                                    >
                                        টেবিলে ডাটা লোড করুন
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-2">
                                                <tr>
                                                    <th className="pb-2 w-10 text-center">#</th>
                                                    <th className="pb-2 w-1/4">নাম *</th>
                                                    <th className="pb-2 w-1/3">ইমেইল *</th>
                                                    <th className="pb-2 w-1/5">পাসওয়ার্ড *</th>
                                                    <th className="pb-2 w-28">রোল</th>
                                                    <th className="pb-2 w-10 text-center">রিমুভ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/40">
                                                {bulkRows.map((row, idx) => (
                                                    <tr key={idx} className="group">
                                                        <td className="py-2 text-center text-slate-500 font-mono text-xs">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <input
                                                                type="text"
                                                                placeholder="ইউজারের নাম"
                                                                value={row.name}
                                                                onChange={(e) => updateBulkRow(idx, 'name', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <input
                                                                type="email"
                                                                placeholder="user@example.com"
                                                                value={row.email}
                                                                onChange={(e) => updateBulkRow(idx, 'email', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <input
                                                                type="text"
                                                                placeholder="পাসওয়ার্ড"
                                                                value={row.password}
                                                                onChange={(e) => updateBulkRow(idx, 'password', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <select
                                                                value={row.role}
                                                                onChange={(e) => updateBulkRow(idx, 'role', e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                                            >
                                                                <option value="candidate">ক্যান্ডিডেট</option>
                                                                <option value="admin">অ্যাডমিন</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBulkRow(idx)}
                                                                disabled={bulkRows.length <= 1}
                                                                className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                                        <div>
                                            বৈধ পূরণকৃত ইউজার:{' '}
                                            <span className="font-bold text-indigo-400">
                                                {bulkRows.filter((r) => r.name.trim() && r.email.trim()).length}
                                            </span>{' '}
                                            জন
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addBulkRow}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>আরও যোগ করুন</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
                            <div className="text-xs text-slate-400">
                                সমস্ত ইউজার তাৎক্ষণিকভাবে লগইন করতে পারবেন
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkSubmit}
                                    disabled={isSubmittingBulk}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                                >
                                    {isSubmittingBulk ? (
                                        'যুক্ত হচ্ছে...'
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>একসাথে সেভ করুন</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <Edit3 className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-white text-base">ইউজার তথ্য এডিট করুন</h3>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    নাম (Name) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {editForm.errors.name && (
                                    <div className="text-rose-400 text-xs mt-1">{editForm.errors.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    ইমেইল এড্রেস (Email) *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {editForm.errors.email && (
                                    <div className="text-rose-400 text-xs mt-1">{editForm.errors.email}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    ইউজার রোল (Role)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                            editForm.data.role === 'candidate'
                                                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="edit_role"
                                            value="candidate"
                                            checked={editForm.data.role === 'candidate'}
                                            onChange={() => editForm.setData('role', 'candidate')}
                                            className="hidden"
                                        />
                                        <UserCheck className="w-4 h-4 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-white">ক্যান্ডিডেট</div>
                                            <div className="text-[10px] text-slate-400">পরীক্ষার্থী</div>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                            editForm.data.role === 'admin'
                                                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="edit_role"
                                            value="admin"
                                            checked={editForm.data.role === 'admin'}
                                            onChange={() => editForm.setData('role', 'admin')}
                                            className="hidden"
                                        />
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-white">অ্যাডমিন</div>
                                            <div className="text-[10px] text-slate-400">ম্যানেজার</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে)
                                </label>
                                <input
                                    type="password"
                                    placeholder="পরিবর্তন না করতে চাইলে ফাঁকা রাখুন..."
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {editForm.errors.password && (
                                    <div className="text-rose-400 text-xs mt-1">{editForm.errors.password}</div>
                                )}
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                                >
                                    {editForm.processing ? 'আপডেট হচ্ছে...' : 'আপডেট সংরক্ষণ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 4: Delete Confirmation */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div className="text-center">
                            <h3 className="font-bold text-white text-base">ইউজার অ্যাকাউন্ট ডিলিট</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                আপনি কি নিশ্চিতভাবে <span className="font-bold text-white font-mono">'{deletingUser.name}'</span> ({deletingUser.email}) মুছে ফেলতে চান?
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
                            >
                                ফিরে যান
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition"
                            >
                                হ্যাঁ, মুছে ফেলুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
