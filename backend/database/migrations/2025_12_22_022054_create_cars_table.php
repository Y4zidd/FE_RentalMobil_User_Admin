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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->string('model');
            $table->string('license_plate')->unique();
            $table->integer('year')->nullable();
            $table->string('category'); // MPV, SUV, Sedan, etc.
            $table->enum('status', ['available', 'rented', 'maintenance'])->default('available');
            $table->enum('transmission', ['manual', 'automatic', 'semi_automatic', 'cvt', 'ivt']);
            $table->string('fuel_type');
            $table->integer('seating_capacity');
            $table->decimal('price_per_day', 12, 2);
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->string('photo_url');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
