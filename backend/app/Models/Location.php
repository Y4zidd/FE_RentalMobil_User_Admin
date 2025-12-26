<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'latitude',
        'longitude',
    ];

    public function cars()
    {
        return $this->hasMany(Car::class);
    }

    public function bookingsPickup()
    {
        return $this->hasMany(Booking::class, 'pickup_location_id');
    }

    public function bookingsDropoff()
    {
        return $this->hasMany(Booking::class, 'dropoff_location_id');
    }
}
