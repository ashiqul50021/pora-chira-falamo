<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DailyGoalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Questions & Gemini AI Studio
    Route::prefix('questions')->name('questions.')->group(function () {
        Route::get('/', [QuestionController::class, 'index'])->name('index');
        Route::get('/upload', [QuestionController::class, 'create'])->name('upload');
        Route::post('/extract-text', [QuestionController::class, 'extractText'])->name('extract-text');
        Route::post('/extract-image', [QuestionController::class, 'extractImage'])->name('extract-image');
        Route::post('/generate-ai', [QuestionController::class, 'generateWithAi'])->name('generate-ai');
        Route::post('/check-duplicates', [QuestionController::class, 'checkDuplicates'])->name('check-duplicates');
        Route::post('/', [QuestionController::class, 'store'])->name('store');
        Route::get('/practice', [QuestionController::class, 'practice'])->name('practice');
        Route::post('/practice/record', [QuestionController::class, 'recordPractice'])->name('practice.record');
        Route::delete('/{question}', [QuestionController::class, 'destroy'])->name('destroy');
    });

    // Quizzes & Mock Tests
    Route::prefix('quizzes')->name('quizzes.')->group(function () {
        Route::get('/', [QuizController::class, 'index'])->name('index');
        Route::get('/create', [QuizController::class, 'create'])->name('create');
        Route::post('/', [QuizController::class, 'store'])->name('store');
        Route::get('/{quiz}', [QuizController::class, 'show'])->name('show');
        Route::post('/{quiz}/submit', [QuizController::class, 'submit'])->name('submit');
        Route::get('/attempts/{attempt}', [QuizController::class, 'result'])->name('result');
    });

    // Weekly Analytics & AI Study Coach
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AnalyticsController::class, 'index'])->name('index');
        Route::post('/ai-advice', [AnalyticsController::class, 'getAiAdvice'])->name('ai-advice');
    });

    // Daily Goals
    Route::post('/daily-goal', [DailyGoalController::class, 'update'])->name('daily-goal.update');

    // User Management
    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Automated GitHub Deployment Webhook
Route::match(['get', 'post'], '/git-deploy-webhook', function (Request $request) {
    if ($request->input('token') !== 'pora2026auto' && $request->query('token') !== 'pora2026auto') {
        abort(403, 'Unauthorized deploy token');
    }

    $basePath = base_path();
    $commands = [
        "cd {$basePath} && git pull origin master 2>&1",
        "cd {$basePath} && php artisan optimize:clear 2>&1",
        "cd {$basePath} && php artisan optimize 2>&1",
    ];

    $log = [];
    foreach ($commands as $cmd) {
        $output = @shell_exec($cmd);
        $log[] = "COMMAND: {$cmd}\nOUTPUT:\n".($output ?: '(executed / no direct shell output)');
    }

    return response('<pre style="background:#0b0f17;color:#38bdf8;padding:20px;font-family:monospace;border-radius:10px;">'.implode("\n\n------------------\n\n", $log).'</pre>');
});

require __DIR__.'/auth.php';
