<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('dropoff_full_address')->nullable()->after('dropoff_location_id');
            $table->decimal('dropoff_latitude', 10, 7)->nullable()->after('dropoff_full_address');
            $table->decimal('dropoff_longitude', 10, 7)->nullable()->after('dropoff_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['dropoff_full_address', 'dropoff_latitude', 'dropoff_longitude']);
        });
    }
};

