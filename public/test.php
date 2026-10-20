<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

/**
 * PoraChira IT - CPanel Diagnostic Tester
 * Open https://your-subdomain/test.php to instantly see what is causing HTTP 500.
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo '<!DOCTYPE html><html><head><title>Diagnostic Test</title>';
echo '<style>body{background:#0b0f17;color:#f8fafc;font-family:sans-serif;padding:30px;} pre{background:#1e293b;padding:15px;border-radius:8px;color:#38bdf8;overflow-x:auto;} .ok{color:#4ade80;font-weight:bold;} .fail{color:#f87171;font-weight:bold;} .card{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:20px;}</style></head><body>';
echo '<h1>🩺 PoraChira IT - Diagnostics Check</h1>';

// 1. PHP Version
echo '<div class="card"><h3>1. PHP Version</h3>';
$phpVersion = phpversion();
echo "Current PHP Version: <b>{$phpVersion}</b> ";
if (version_compare($phpVersion, '8.2.0', '>=')) {
    echo '<span class="ok">✅ OK (Required >= 8.2)</span>';
} else {
    echo '<span class="fail">❌ FAIL: Laravel 11/12 requires PHP 8.2 or higher! Please change PHP version in cPanel MultiPHP Manager.</span>';
}
echo '</div>';

// 2. Vendor check
echo '<div class="card"><h3>2. Vendor & Autoload Check</h3>';
$autoloadPath = __DIR__.'/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo '<span class="ok">✅ vendor/autoload.php found!</span>';
    try {
        require_once $autoloadPath;
        echo '<br><span class="ok">✅ Autoload loaded successfully!</span>';
    } catch (Throwable $e) {
        echo '<br><span class="fail">❌ Autoload load error: '.htmlspecialchars($e->getMessage()).'</span>';
    }
} else {
    echo '<span class="fail">❌ vendor/autoload.php NOT found! Path checked: '.htmlspecialchars($autoloadPath).'</span>';
    echo '<br>Make sure the "vendor" folder is inside the root project directory (not inside a subfolder).';
}
echo '</div>';

// 3. .env check
echo '<div class="card"><h3>3. .env File Check</h3>';
$envPath = __DIR__.'/../.env';
if (file_exists($envPath)) {
    echo '<span class="ok">✅ .env file found!</span>';
    $envContent = file_get_contents($envPath);
    if (strpos($envContent, 'APP_KEY=') !== false && strlen(trim($envContent)) > 20) {
        echo '<br><span class="ok">✅ .env file is not empty and has APP_KEY.</span>';
    } else {
        echo '<br><span class="fail">⚠️ .env file exists but might be missing APP_KEY!</span>';
    }
} else {
    echo '<span class="fail">❌ .env file NOT found at: '.htmlspecialchars($envPath).'</span>';
}
echo '</div>';

// 4. Storage permissions
echo '<div class="card"><h3>4. Storage & Bootstrap Permissions</h3>';
$storagePath = __DIR__.'/../storage';
$bootstrapCache = __DIR__.'/../bootstrap/cache';

$storageOk = is_writable($storagePath);
$cacheOk = is_writable($bootstrapCache);

echo 'Storage Writable: '.($storageOk ? '<span class="ok">✅ Yes</span>' : '<span class="fail">❌ No (Change permission to 775/755 in cPanel)</span>').'<br>';
echo 'Bootstrap/Cache Writable: '.($cacheOk ? '<span class="ok">✅ Yes</span>' : '<span class="fail">❌ No (Change permission to 775/755 in cPanel)</span>');
echo '</div>';

// 5. Try booting Laravel
echo '<div class="card"><h3>5. Laravel Boot Test</h3>';
try {
    if (file_exists(__DIR__.'/../bootstrap/app.php')) {
        $app = require_once __DIR__.'/../bootstrap/app.php';
        $kernel = $app->make(Kernel::class);
        $request = Request::capture();
        echo '<span class="ok">🎉 SUCCESS! Laravel Kernel booted without errors!</span>';
    } else {
        echo '<span class="fail">❌ bootstrap/app.php not found.</span>';
    }
} catch (Throwable $e) {
    echo '<span class="fail">❌ Laravel Boot Failed With Error:</span>';
    echo '<pre>'.htmlspecialchars($e->getMessage())."\n\nFile: ".$e->getFile().':'.$e->getLine()."\n\nStack Trace:\n".$e->getTraceAsString().'</pre>';
}
echo '</div>';

// 6. Recent Error Log
echo '<div class="card"><h3>6. Recent Error Logs</h3>';
$errorLogPath = __DIR__.'/error_log';
$rootErrorLog = __DIR__.'/../error_log';
$laravelLog = __DIR__.'/../storage/logs/laravel.log';

echo '<pre>';
if (file_exists($errorLogPath)) {
    echo "=== public/error_log ===\n".htmlspecialchars(substr(file_get_contents($errorLogPath), -1500))."\n\n";
}
if (file_exists($rootErrorLog)) {
    echo "=== root/error_log ===\n".htmlspecialchars(substr(file_get_contents($rootErrorLog), -1500))."\n\n";
}
if (file_exists($laravelLog)) {
    echo "=== storage/logs/laravel.log ===\n".htmlspecialchars(substr(file_get_contents($laravelLog), -1500))."\n\n";
}
if (! file_exists($errorLogPath) && ! file_exists($rootErrorLog) && ! file_exists($laravelLog)) {
    echo 'No error log files found yet.';
}
echo '</pre></div>';

echo '</body></html>';
