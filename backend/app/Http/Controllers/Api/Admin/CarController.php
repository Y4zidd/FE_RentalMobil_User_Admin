<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::with(['location', 'images', 'partner'])->get();
        return response()->json($cars);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'brand' => 'required|string',
            'model' => 'required|string',
            'license_plate' => 'required|string|unique:cars,license_plate',
            'year' => 'nullable|integer',
            'category' => 'required|string',
            'status' => 'required|in:available,rented,maintenance',
            'transmission' => 'required|in:manual,automatic,semi_automatic,cvt,ivt',
            'fuel_type' => 'required|string',
            'seating_capacity' => 'required|integer',
            'price_per_day' => 'required|numeric',
            'location_id' => 'nullable|exists:locations,id',
            'partner_id' => 'nullable|exists:rental_partners,id',
            'location_name' => 'required_without:location_id|string',
            'location_city' => 'nullable|string',
            'location_address' => 'nullable|string',
            'location_latitude' => 'nullable|numeric',
            'location_longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'images' => 'required|array',
            'images.*' => 'image|max:5120',
        ]);

        $locationId = $validated['location_id'] ?? null;

        if (!$locationId) {
            $location = Location::firstOrCreate(
                ['name' => $validated['location_name']],
                [
                    'city' => $validated['location_city'] ?? null,
                    'address' => $validated['location_address'] ?? null,
                    'latitude' => $validated['location_latitude'] ?? null,
                    'longitude' => $validated['location_longitude'] ?? null,
                ]
            );

            $locationId = $location->id;
        }

        $carData = collect($validated)
            ->except([
                'images',
                'location_name',
                'location_city',
                'location_address',
                'location_latitude',
                'location_longitude',
            ])
            ->toArray();

        $carData['location_id'] = $locationId;
        if (!array_key_exists('photo_url', $carData)) {
            $carData['photo_url'] = '';
        }
        $car = Car::create($carData);

        $files = $request->file('images', []);
        $primaryUrl = null;

        foreach ($files as $index => $file) {
            $uploadDir = 'uploads/cars';
            $destinationPath = public_path($uploadDir);

            if (!is_dir($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $extension = $file->getClientOriginalExtension();
            $filename = uniqid('car_', true) . ($extension ? '.' . $extension : '');

            $file->move($destinationPath, $filename);

            $relativePath = $uploadDir . '/' . $filename;
            $url = asset($relativePath);

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

        return response()->json($car->load(['location', 'images', 'partner']), 201);
    }

    public function show($id)
    {
        $car = Car::with(['location', 'images'])->findOrFail($id);
        return response()->json($car);
    }

    public function update(Request $request, $id)
    {
        $car = Car::findOrFail($id);

        $request->validate([
            'license_plate' => 'sometimes|string|unique:cars,license_plate,' . $car->id,
            'images.*' => 'image|max:5120',
        ]);

        $validated = $request->all();

        $locationId = $validated['location_id'] ?? $car->location_id;

        if (!$locationId && !empty($validated['location_name'])) {
            $location = Location::firstOrCreate(
                ['name' => $validated['location_name']],
                [
                    'city' => $validated['location_city'] ?? null,
                    'address' => $validated['location_address'] ?? null,
                    'latitude' => $validated['location_latitude'] ?? null,
                    'longitude' => $validated['location_longitude'] ?? null,
                ]
            );

            $locationId = $location->id;
        } elseif ($locationId && $car->location && !empty($validated['location_name'])) {
            $car->location->update([
                'name' => $validated['location_name'],
                'city' => $validated['location_city'] ?? $car->location->city,
                'address' => $validated['location_address'] ?? $car->location->address,
                'latitude' => $validated['location_latitude'] ?? $car->location->latitude,
                'longitude' => $validated['location_longitude'] ?? $car->location->longitude,
            ]);
        }

        $carData = collect($validated)
            ->except([
                'images',
                'location_name',
                'location_city',
                'location_address',
                'location_latitude',
                'location_longitude',
            ])
            ->toArray();

        if ($locationId) {
            $carData['location_id'] = $locationId;
        }
        $car->update($carData);

        if ($request->filled('deleted_image_ids')) {
            $ids = $request->input('deleted_image_ids', []);
            $ids = is_array($ids) ? $ids : [$ids];

            foreach ($car->images()->whereIn('id', $ids)->get() as $existingImage) {
                $path = parse_url($existingImage->image_url, PHP_URL_PATH);

                if (is_string($path) && $path !== '') {
                    $relativePath = ltrim($path, '/');
                    $fullPublicPath = public_path($relativePath);

                    if (file_exists($fullPublicPath)) {
                        @unlink($fullPublicPath);
                    } else {
                        $storagePath = ltrim(str_replace('storage/', '', $relativePath), '/');
                        if ($storagePath !== '') {
                            Storage::disk('public')->delete($storagePath);
                        }
                    }
                }

                $existingImage->delete();
            }
        }

        if ($request->hasFile('images')) {
            $files = $request->file('images', []);
            $primaryUrl = null;

            foreach ($files as $index => $file) {
                $uploadDir = 'uploads/cars';
                $destinationPath = public_path($uploadDir);

                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                $extension = $file->getClientOriginalExtension();
                $filename = uniqid('car_', true) . ($extension ? '.' . $extension : '');

                $file->move($destinationPath, $filename);

                $relativePath = $uploadDir . '/' . $filename;
                $url = asset($relativePath);

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

        return response()->json($car->load(['location', 'images', 'partner']));
    }

    public function destroy($id)
    {
        $car = Car::findOrFail($id);
        $car->delete();
        return response()->json(['message' => 'Car deleted successfully']);
    }
}
