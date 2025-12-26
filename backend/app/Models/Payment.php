<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'provider',
        'order_id',
        'transaction_id',
        'payment_type',
        'gross_amount',
        'currency',
        'transaction_status',
        'fraud_status',
        'approval_code',
        'payload_request',
        'payload_response',
        'payload_notification',
        'paid_at',
    ];

    protected $casts = [
        'payload_request' => 'array',
        'payload_response' => 'array',
        'payload_notification' => 'array',
        'paid_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
