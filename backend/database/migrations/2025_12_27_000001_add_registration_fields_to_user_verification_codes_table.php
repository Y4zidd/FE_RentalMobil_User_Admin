<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_verification_codes', function (Blueprint $table) {
            $table->string('name')->nullable()->after('type');
            $table->string('password')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('user_verification_codes', function (Blueprint $table) {
            $table->dropColumn(['name', 'password']);
        });
    }
};

