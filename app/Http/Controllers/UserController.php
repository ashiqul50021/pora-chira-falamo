<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with search and filtering.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $role = $request->input('role');

        $query = User::query()
            ->withCount(['questions', 'quizAttempts'])
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role && in_array($role, ['admin', 'candidate'])) {
            $query->where('role', $role);
        }

        $users = $query->paginate(15)->withQueryString();

        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_candidates' => User::where('role', 'candidate')->count(),
            'new_this_week' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role ?? '',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store newly created user(s) in storage.
     * Supports both single-user and multiple-user creation.
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if multiple users are submitted
        if ($request->has('users') && is_array($request->input('users'))) {
            $validated = $request->validate([
                'users' => ['required', 'array', 'min:1', 'max:50'],
                'users.*.name' => ['required', 'string', 'max:255'],
                'users.*.email' => ['required', 'string', 'email', 'max:255', 'distinct', 'unique:users,email'],
                'users.*.password' => ['required', 'string', Password::min(6)],
                'users.*.role' => ['required', 'string', Rule::in(['admin', 'candidate'])],
            ]);

            DB::transaction(function () use ($validated) {
                foreach ($validated['users'] as $userData) {
                    User::create([
                        'name' => trim($userData['name']),
                        'email' => strtolower(trim($userData['email'])),
                        'password' => Hash::make($userData['password']),
                        'role' => $userData['role'],
                    ]);
                }
            });

            $count = count($validated['users']);

            return redirect()->route('users.index')
                ->with('success', "{$count} জন ইউজার সফলভাবে যুক্ত করা হয়েছে।");
        }

        // Single user creation
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(6)],
            'role' => ['required', 'string', Rule::in(['admin', 'candidate'])],
        ]);

        User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('users.index')
            ->with('success', "নতুন ইউজার '{$validated['name']}' সফলভাবে যুক্ত করা হয়েছে।");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['admin', 'candidate'])],
            'password' => ['nullable', 'string', Password::min(6)],
        ]);

        $userData = [
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return redirect()->route('users.index')
            ->with('success', "ইউজার '{$user->name}' সফলভাবে আপডেট করা হয়েছে।");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return redirect()->route('users.index')
                ->with('error', 'আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না।');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', "ইউজার '{$userName}' মুছে ফেলা হয়েছে।");
    }
}
