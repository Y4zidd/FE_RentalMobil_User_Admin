<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalPartner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'province',
        'regency',
        'city',
        'address',
        'contact_name',
        'contact_phone',
        'contact_email',
        'status',
    ];

    public function cars()
    {
        return $this->hasMany(Car::class, 'partner_id');
    }
}

