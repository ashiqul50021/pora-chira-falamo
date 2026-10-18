<?php

/**
 * PoraChira IT - CPanel Setup Runner
 * Run artisan commands directly from browser when cPanel has no terminal access.
 */

// Simple security key to prevent unauthorized access
$securityKey = 'pora2026';

if (! isset($_GET['key']) || $_GET['key'] !== $securityKey) {
    http_response_code(403);
    echo '<h3 style="font-family:sans-serif;color:red;padding:20px;">403 Forbidden: Invalid Security Key. Use ?key='.$securityKey.'</h3>';
    exit;
}

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$actions = $_GET['action'] ?? 'all';
$output = [];

echo '<!DOCTYPE html><html><head><title>PoraChira IT - CPanel Setup</title>';
echo '<style>body{background:#0b0f17;color:#38bdf8;font-family:monospace;padding:20px;} pre{background:#0f172a;border:1px solid #1e293b;padding:15px;border-radius:10px;color:#a5f3fc;overflow-x:auto;} .btn{display:inline-block;padding:8px 16px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-right:10px;margin-bottom:15px;}</style></head><body>';
echo '<h2>🚀 PoraChira IT - CPanel Setup & Migration Runner</h2>';
echo '<p style="color:#94a3b8;">cPanel-এ টার্মিনাল না থাকলে এই পেজ থেকে ১-ক্লিকে ডাটাবেস মাইগ্রেশন ও ক্যাশ অপটিমাইজেশন চালানো যায়।</p>';

echo '<div>';
echo '<a href="?key='.$securityKey.'&action=all" class="btn">⚡ Run All (Migrate + Seed + Storage Link + Optimize)</a>';
echo '<a href="?key='.$securityKey.'&action=migrate" class="btn" style="background:#0ea5e9;">Migrate Only</a>';
echo '<a href="?key='.$securityKey.'&action=seed" class="btn" style="background:#8b5cf6;">Seed Only</a>';
echo '<a href="?key='.$securityKey.'&action=storage" class="btn" style="background:#10b981;">Storage Link</a>';
echo '<a href="?key='.$securityKey.'&action=optimize" class="btn" style="background:#f59e0b;">Optimize Cache</a>';
echo '<a href="/" class="btn" style="background:#334155;">Go to Website →</a>';
echo '</div>';

echo '<pre>';

try {
    if ($actions === 'all' || $actions === 'migrate') {
        echo "=== [1/4] RUNNING DATABASE MIGRATIONS ===\n";
        Artisan::call('migrate', ['--force' => true]);
        echo Artisan::output()."\n";
    }

    if ($actions === 'all' || $actions === 'seed') {
        echo "=== [2/4] SEEDING DATABASE (Default Admin & System Setup) ===\n";
        Artisan::call('db:seed', ['--force' => true]);
        echo Artisan::output()."\n";
    }

    if ($actions === 'all' || $actions === 'storage') {
        echo "=== [3/4] CREATING STORAGE SYMLINK ===\n";
        try {
            Artisan::call('storage:link');
            echo Artisan::output()."\n";
        } catch (\Throwable $e) {
            echo 'Storage link note: '.$e->getMessage()."\n\n";
        }
    }

    if ($actions === 'all' || $actions === 'optimize') {
        echo "=== [4/4] CLEARING & OPTIMIZING ROUTE/CONFIG CACHE ===\n";
        Artisan::call('optimize:clear');
        echo Artisan::output();
        Artisan::call('optimize');
        echo Artisan::output()."\n";
    }

    echo "🎉 SUCCESS: Everything completed successfully!\n";
} catch (\Throwable $e) {
    echo "❌ ERROR ENCOUNTERED:\n".$e->getMessage()."\n\nTrace:\n".$e->getTraceAsString();
}

echo '</pre>';
echo '<p style="color:#64748b;font-size:12px;">নিরাপত্তার স্বার্থে কাজ শেষ হলে এই ফাইলটি মুছে ফেলতে পারেন অথবা সিকিউরিটি কি পরিবর্তন করতে পারেন।</p>';
echo '</body></html>';
