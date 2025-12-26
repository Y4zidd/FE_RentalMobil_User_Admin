<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::with(['location', 'images'])->get();
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
            'images' => 'required|array',
            'images.*' => 'image|max:5120',
        ]);

        $carData = collect($validated)->except(['images'])->toArray();
        if (!array_key_exists('photo_url', $carData)) {
            $carData['photo_url'] = '';
        }
        $car = Car::create($carData);

        $files = $request->file('images', []);
        $primaryUrl = null;

        foreach ($files as $index => $file) {
            $path = $file->store('cars', 'public');
            $url = asset('storage/' . $path);

            $car->images()->create([
                'image_url' => $url,
                'is_primary' => $index === 0,
                'sort_order' => $index + 1,
            ]);

            if ($index === 0) {
                $primaryUrl = $url;
            }
        }

        if ($primaryUrl) {
            $car->photo_url = $primaryUrl;
            $car->save();
        }

        return response()->json($car->load(['location', 'images']), 201);
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
            'images' => 'sometimes|array',
            'images.*' => 'image|max:5120',
        ]);

        $carData = collect($validated)->except(['images'])->toArray();
        $car->update($carData);

        if ($request->hasFile('images')) {
            foreach ($car->images as $existingImage) {
                $path = parse_url($existingImage->image_url, PHP_URL_PATH);
                if (is_string($path)) {
                    $path = ltrim(str_replace('/storage/', '', $path), '/');
                    if ($path !== '') {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $car->images()->delete();

            $files = $request->file('images', []);
            $primaryUrl = null;

            foreach ($files as $index => $file) {
                $path = $file->store('cars', 'public');
                $url = asset('storage/' . $path);

                $car->images()->create([
                    'image_url' => $url,
                    'is_primary' => $index === 0,
                    'sort_order' => $index + 1,
                ]);

                if ($index === 0) {
                    $primaryUrl = $url;
                }
            }

            if ($primaryUrl) {
                $car->photo_url = $primaryUrl;
                $car->save();
            }
        }

        return response()->json($car->load(['location', 'images']));
    }

    public function destroy($id)
    {
        $car = Car::findOrFail($id);
        $car->delete();
        return response()->json(['message' => 'Car deleted successfully']);
    }
}
