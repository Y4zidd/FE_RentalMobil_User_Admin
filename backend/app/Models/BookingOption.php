<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'option_code',
        'label',
        'price_per_day',
        'days',
        'total_price',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
