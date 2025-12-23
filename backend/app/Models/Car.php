<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'model',
        'license_plate',
        'year',
        'category',
        'status',
        'transmission',
        'fuel_type',
        'seating_capacity',
        'price_per_day',
        'location_id',
        'description',
        'photo_url',
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function images()
    {
        return $this->hasMany(CarImage::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
