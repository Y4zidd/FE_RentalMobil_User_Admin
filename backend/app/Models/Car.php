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
        'features',
    ];

    protected $casts = [
        'features' => 'array',
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

    public function getPhotoUrlAttribute($value)
    {
        if (
            is_string($value) &&
            str_starts_with($value, 'http://localhost/storage/')
        ) {
            $appUrl = config('app.url');
            return str_replace('http://localhost', $appUrl, $value);
        }

        return $value;
    }
}
