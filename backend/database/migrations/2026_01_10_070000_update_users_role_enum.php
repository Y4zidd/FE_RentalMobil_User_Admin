<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we run a raw statement to change the ENUM definition.
        // We include all existing values plus 'partner'.
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'staff', 'partner') NOT NULL DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to the original ENUM values.
        // Warning: This might fail if there are rows with 'partner' role.
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer'");
    }
};
