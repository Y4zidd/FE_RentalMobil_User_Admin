<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use App\Models\Car;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'status' => 'active',
        ]);

        // Locations
        $loc1 = Location::create([
            'name' => 'Jakarta Pusat',
            'address' => 'Jl. Thamrin No. 1',
            'city' => 'Jakarta',
            'latitude' => -6.175110,
            'longitude' => 106.865036,
        ]);

        $loc2 = Location::create([
            'name' => 'Bandung Kota',
            'address' => 'Jl. Asia Afrika',
            'city' => 'Jawa Barat',
            'latitude' => -6.917464,
            'longitude' => 107.619123,
        ]);

        // Cars
        $avanza = Car::create([
            'name' => 'Toyota Avanza',
            'brand' => 'Toyota',
            'model' => 'Avanza G',
            'license_plate' => 'B 1234 CD',
            'year' => 2023,
            'category' => 'MPV',
            'status' => 'available',
            'transmission' => 'automatic',
            'fuel_type' => 'Petrol',
            'seating_capacity' => 7,
            'price_per_day' => 450000,
            'location_id' => $loc1->id,
            'description' => 'Reliable family car.',
            'photo_url' => 'https://apollo.olx.co.id/v1/files/69440ad4498dc-ID/image;s=780x0;q=60',
        ]);

        $civic = Car::create([
            'name' => 'Honda Civic',
            'brand' => 'Honda',
            'model' => 'Civic Turbo',
            'license_plate' => 'D 5678 EF',
            'year' => 2024,
            'category' => 'Sedan',
            'status' => 'available',
            'transmission' => 'automatic',
            'fuel_type' => 'Petrol',
            'seating_capacity' => 5,
            'price_per_day' => 800000,
            'location_id' => $loc2->id,
            'description' => 'Sporty and comfortable.',
            'photo_url' => 'https://apollo.olx.co.id/v1/files/694677ee69e06-ID/image;f=avif;s=1700x0',
        ]);

        $avanza->images()->createMany([
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/69440ad4498dc-ID/image;s=780x0;q=60',
                'is_primary' => true,
                'sort_order' => 1,
            ],
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/69440ad5e203c-ID/image;s=780x0;q=60',
                'is_primary' => false,
                'sort_order' => 2,
            ],
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/69440ad62c2d1-ID/image;s=780x0;q=60',
                'is_primary' => false,
                'sort_order' => 3,
            ],
        ]);

        $civic->images()->createMany([
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/694677ee69e06-ID/image;f=avif;s=1700x0',
                'is_primary' => true,
                'sort_order' => 1,
            ],
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/694677f1c62b5-ID/image;f=avif;s=1700x0',
                'is_primary' => false,
                'sort_order' => 2,
            ],
            [
                'image_url' => 'https://apollo.olx.co.id/v1/files/694677f69feff-ID/image;f=avif;s=1700x0',
                'is_primary' => false,
                'sort_order' => 3,
            ],
        ]);
    }
}
