<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['location', 'images']);

        $pickupDate = $request->input('pickup_date');
        $returnDate = $request->input('return_date');

        if ($pickupDate && $returnDate) {
            $pickup = \Carbon\Carbon::parse($pickupDate);
            $return = \Carbon\Carbon::parse($returnDate);

            $query->whereDoesntHave('bookings', function ($q) use ($pickup, $return) {
                $q->whereIn('status', ['pending', 'confirmed'])
                  ->where(function ($overlap) use ($pickup, $return) {
                      $overlap->where('pickup_date', '<', $return)
                              ->where('return_date', '>', $pickup);
                  });
            });
        } else {
            $query->where('status', 'available');
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%");
            });
        }

        // Additional filters for dates could be added here to check booking availability

        $cars = $query->get();

        return response()->json($cars);
    }

    public function show($id)
    {
        $car = Car::with(['location', 'images'])->findOrFail($id);
        return response()->json($car);
    }
}
