<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::with(['location'])->get();
        return response()->json($cars);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'brand' => 'required|string',
            'model' => 'required|string',
            'license_plate' => 'required|string|unique:cars',
            'year' => 'nullable|integer',
            'category' => 'required|string',
            'status' => 'required|in:available,rented,maintenance',
            'transmission' => 'required|in:manual,automatic,semi_automatic,cvt,ivt',
            'fuel_type' => 'required|string',
            'seating_capacity' => 'required|integer',
            'price_per_day' => 'required|numeric',
            'location_id' => 'required|exists:locations,id',
            'description' => 'nullable|string',
            'photo_url' => 'required|string',
        ]);

        $car = Car::create($validated);
        return response()->json($car, 201);
    }

    public function show($id)
    {
        $car = Car::with(['location', 'images'])->findOrFail($id);
        return response()->json($car);
    }

    public function update(Request $request, $id)
    {
        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'brand' => 'string',
            'model' => 'string',
            'license_plate' => 'string|unique:cars,license_plate,' . $id,
            'year' => 'nullable|integer',
            'category' => 'string',
            'status' => 'in:available,rented,maintenance',
            'transmission' => 'in:manual,automatic,semi_automatic,cvt,ivt',
            'fuel_type' => 'string',
            'seating_capacity' => 'integer',
            'price_per_day' => 'numeric',
            'location_id' => 'exists:locations,id',
            'description' => 'nullable|string',
            'photo_url' => 'string',
        ]);

        $car->update($validated);
        return response()->json($car);
    }

    public function destroy($id)
    {
        $car = Car::findOrFail($id);
        $car->delete();
        return response()->json(['message' => 'Car deleted successfully']);
    }
}
