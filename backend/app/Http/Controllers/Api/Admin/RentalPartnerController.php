<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RentalPartner;
use Illuminate\Http\Request;

class RentalPartnerController extends Controller
{
    public function index(Request $request)
    {
        $query = RentalPartner::query();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', 'active');
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('province', 'like', '%' . $search . '%')
                    ->orWhere('regency', 'like', '%' . $search . '%')
                    ->orWhere('city', 'like', '%' . $search . '%');
            });
        }

        $partners = $query->orderBy('name')->get();

        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'regency' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        if (!isset($data['country']) || $data['country'] === null || $data['country'] === '') {
            $data['country'] = 'Indonesia';
        }

        if (!isset($data['status']) || $data['status'] === null || $data['status'] === '') {
            $data['status'] = 'active';
        }

        $partner = RentalPartner::create($data);

        return response()->json($partner, 201);
    }

    public function show($id)
    {
        $partner = RentalPartner::findOrFail($id);

        return response()->json($partner);
    }

    public function update(Request $request, $id)
    {
        $partner = RentalPartner::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|nullable|string|max:255',
            'province' => 'sometimes|nullable|string|max:255',
            'regency' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:255',
            'address' => 'sometimes|nullable|string',
            'contact_name' => 'sometimes|nullable|string|max:255',
            'contact_phone' => 'sometimes|nullable|string|max:255',
            'contact_email' => 'sometimes|nullable|email|max:255',
            'status' => 'sometimes|nullable|in:active,inactive',
        ]);

        $partner->update($data);

        return response()->json($partner);
    }

    public function destroy($id)
    {
        $partner = RentalPartner::findOrFail($id);

        $partner->status = 'inactive';
        $partner->save();

        return response()->json(['message' => 'Partner deactivated']);
    }
}
