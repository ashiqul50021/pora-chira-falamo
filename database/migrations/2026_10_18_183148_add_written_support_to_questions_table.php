<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->enum('type', ['mcq', 'written'])->default('mcq')->after('topic_id');
            $table->unsignedInteger('marks')->default(1)->after('type');
            $table->json('options')->nullable()->change();
            $table->string('correct_option', 10)->nullable()->change();
            $table->longText('written_answer')->nullable()->after('correct_option');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['type', 'marks', 'written_answer']);
        });
    }
};
