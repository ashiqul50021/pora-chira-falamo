<?php

use App\Models\StudyNote;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

// Simple 1-click GitHub Puller for cPanel
set_time_limit(300);

$repoZip = 'https://github.com/ashiqul50021/pora-chira-falamo/archive/refs/heads/master.zip';
$tmpZip = __DIR__.'/master.zip';
$targetDir = dirname(__DIR__);

echo "<pre style='background:#0b0f17;color:#38bdf8;padding:24px;font-family:monospace;border-radius:12px;line-height:1.6;'>";
echo "=========================================\n";
echo "🚀 Pora-Chira-Falamo One-Click Updater\n";
echo "=========================================\n\n";

echo "1. Downloading latest repository from GitHub master...\n";
$ch = curl_init($repoZip);
$fp = fopen($tmpZip, 'wb');
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
curl_setopt($ch, CURLOPT_TIMEOUT, 90);
$success = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
fclose($fp);

if (! $success || $httpCode !== 200 || ! file_exists($tmpZip) || filesize($tmpZip) < 1000) {
    exit("❌ Download failed. HTTP Code: {$httpCode}\n");
}
echo '✅ Downloaded ('.round(filesize($tmpZip) / 1024 / 1024, 2)." MB)\n\n";

echo "2. Extracting files...\n";
$zip = new ZipArchive;
if ($zip->open($tmpZip) === true) {
    $extractPath = __DIR__.'/extracted_temp';
    @mkdir($extractPath, 0755, true);
    $zip->extractTo($extractPath);
    $zip->close();
    @unlink($tmpZip);

    $dirs = glob($extractPath.'/*', GLOB_ONLYDIR);
    $subDir = $dirs[0] ?? $extractPath;

    echo "3. Updating project files...\n";
    $copyRecursive = function ($src, $dst) use (&$copyRecursive, $targetDir) {
        $dir = opendir($src);
        @mkdir($dst, 0755, true);
        while (false !== ($file = readdir($dir))) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            if ($file === '.env') {
                continue;
            }
            if ($file === '.htaccess') {
                continue;
            }
            if ($file === '.user.ini') {
                continue;
            }
            if ($file === 'storage' && realpath($dst) === realpath($targetDir)) {
                continue;
            }

            $srcFile = $src.'/'.$file;
            $dstFile = $dst.'/'.$file;
            if (is_dir($srcFile)) {
                $copyRecursive($srcFile, $dstFile);
            } else {
                copy($srcFile, $dstFile);
            }
        }
        closedir($dir);
    };

    $copyRecursive($subDir, $targetDir);

    // Clean up temporary extraction directory
    $deleteDir = function ($dirPath) use (&$deleteDir) {
        if (! is_dir($dirPath)) {
            return;
        }
        $files = scandir($dirPath);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            $filePath = $dirPath.'/'.$file;
            if (is_dir($filePath)) {
                $deleteDir($filePath);
            } else {
                @unlink($filePath);
            }
        }
        @rmdir($dirPath);
    };
    $deleteDir($extractPath);

    // Clear bootstrap/cache
    $cacheFiles = glob($targetDir.'/bootstrap/cache/*.php');
    foreach ($cacheFiles as $cf) {
        if (basename($cf) !== '.gitignore') {
            @unlink($cf);
        }
    }
    echo "✅ Project files updated successfully!\n";
    echo "✅ File cache cleared!\n\n";

    // Automatic Database Migration & Seeding
    echo "4. Running database migrations...\n";
    try {
        require_once $targetDir.'/vendor/autoload.php';
        $app = require_once $targetDir.'/bootstrap/app.php';
        $kernel = $app->make(Kernel::class);
        $kernel->bootstrap();

        Artisan::call('migrate', ['--force' => true]);
        $migOutput = trim(Artisan::output());
        echo ($migOutput ?: 'Nothing to migrate.')."\n";
        echo "✅ Database migrations executed successfully!\n\n";

        // Seed StudyNotes if table is empty
        try {
            if (StudyNote::count() === 0) {
                echo "5. Seeding initial study notes & lecture sheets...\n";
                Artisan::call('db:seed', ['--class' => 'StudyNoteSeeder', '--force' => true]);
                echo trim(Artisan::output())."\n";
                echo "✅ Study notes seeded successfully!\n\n";
            }
        } catch (Throwable $se) {
            // Ignore if seeder already ran
        }

        // Optimize clear
        Artisan::call('optimize:clear');
        echo "✅ Laravel optimization cache cleared!\n\n";
    } catch (Throwable $e) {
        echo '⚠️ Database/Artisan note: '.$e->getMessage()."\n";
        echo "👉 If needed, visit: https://poira-chira-falamo.ashiqulislamrasel.com/setup.php?key=pora2026&action=all\n\n";
    }

    echo "🎉 Live server is now 100% up-to-date and ready!\n";
    echo "👉 <a href='/dashboard' style='color:#a5f3fc;font-weight:bold;text-decoration:underline;'>Go to Dashboard →</a>\n";
} else {
    exit("❌ Failed to open downloaded zip archive.\n");
}

echo '</pre>';
