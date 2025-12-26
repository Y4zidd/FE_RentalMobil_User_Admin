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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('provider'); // midtrans
            $table->string('order_id');
            $table->string('transaction_id')->nullable();
            $table->string('payment_type')->nullable();
            $table->decimal('gross_amount', 12, 2);
            $table->string('currency')->default('IDR');
            $table->string('transaction_status'); // pending, settlement, expire, cancel, deny
            $table->string('fraud_status')->nullable();
            $table->string('approval_code')->nullable();
            $table->json('payload_request')->nullable();
            $table->json('payload_response')->nullable();
            $table->json('payload_notification')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
