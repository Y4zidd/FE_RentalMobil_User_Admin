<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'pickup_date',
        'return_date',
        'pickup_location_id',
        'dropoff_location_id',
        'status',
        'payment_method',
        'coupon_id',
        'coupon_code',
        'base_price',
        'extras_total',
        'discount_amount',
        'total_price',
        'notes',
    ];

    protected $casts = [
        'pickup_date' => 'datetime',
        'return_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function pickupLocation()
    {
        return $this->belongsTo(Location::class, 'pickup_location_id');
    }

    public function dropoffLocation()
    {
        return $this->belongsTo(Location::class, 'dropoff_location_id');
    }

    public function options()
    {
        return $this->hasMany(BookingOption::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
