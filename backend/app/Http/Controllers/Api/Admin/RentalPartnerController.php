<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RentalPartner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RentalPartnerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $query = RentalPartner::with('user');

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

    public function getAvailablePartners(Request $request)
    {
        $query = RentalPartner::whereNull('user_id')->select('id', 'name');

        if ($request->has('include_id')) {
            $includeId = $request->include_id;
            $query->orWhere('id', $includeId);
        }

        $partners = $query->orderBy('name')->get();
        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

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
            'create_user' => 'nullable|boolean',
            'user_email' => 'required_if:create_user,true|email|unique:users,email',
            'user_password' => 'required_if:create_user,true|string|min:8',
        ]);

        return DB::transaction(function () use ($data) {
            $user = null;
            if (isset($data['create_user']) && $data['create_user']) {
                $user = User::create([
                    'name' => $data['contact_name'] ?? $data['name'],
                    'email' => $data['user_email'],
                    'password' => Hash::make($data['user_password']),
                    'role' => 'partner',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);
            }

            $partnerData = collect($data)->except(['create_user', 'user_email', 'user_password'])->toArray();

            if (!isset($partnerData['country']) || $partnerData['country'] === null || $partnerData['country'] === '') {
                $partnerData['country'] = 'Indonesia';
            }

            if (!isset($partnerData['status']) || $partnerData['status'] === null || $partnerData['status'] === '') {
                $partnerData['status'] = 'active';
            }

            if ($user) {
                $partnerData['user_id'] = $user->id;
            }

            $partner = RentalPartner::create($partnerData);

            return response()->json($partner->load('user'), 201);
        });
    }

    public function show($id)
    {
        $user = request()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $partner = RentalPartner::findOrFail($id);

        return response()->json($partner);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

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
        $user = request()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $partner = RentalPartner::findOrFail($id);

        $partner->status = 'inactive';
        $partner->save();

        return response()->json(['message' => 'Partner deactivated']);
    }
}
