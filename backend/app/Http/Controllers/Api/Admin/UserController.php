<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RentalPartner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $query = User::with('rentalPartner'); // Load rental partner info

        if ($request->filled('role')) {
            $roles = explode(',', $request->role);
            $roles = array_map('strtolower', $roles);
            $query->whereIn('role', $roles);
        }

        if ($request->filled('status')) {
            $statuses = explode(',', $request->status);
            $statuses = array_map('strtolower', $statuses);
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        // Admin create user (staff/admin/partner)
        $validated = $request->validate([
            'name' => 'required|string',
            'role' => 'required|in:admin,staff,customer,partner',
            'status' => 'required|in:active,inactive',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'partner_id' => [
                'nullable',
                'required_if:role,partner',
                'exists:rental_partners,id',
                function ($attribute, $value, $fail) {
                    if ($value && RentalPartner::where('id', $value)->whereNotNull('user_id')->exists()) {
                        $fail('The selected partner is already defined for another user.');
                    }
                },
            ],
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['email_verified_at'] = now();

        return DB::transaction(function () use ($validated, $request) {
            $userData = collect($validated)->except(['partner_id'])->toArray();
            $user = User::create($userData);

            if ($request->role === 'partner' && $request->filled('partner_id')) {
                $partner = RentalPartner::find($request->partner_id);
                $partner->user_id = $user->id;
                $partner->save();
            }

            return response()->json($user, 201);
        });
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $user = User::findOrFail($id);

        $rules = [
            'name' => 'string',
            'role' => 'in:admin,staff,customer,partner',
            'status' => 'in:active,inactive',
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ];

        // Prevent email update if locked (Google users)
        if (!$user->is_email_locked) {
            $rules['email'] = 'email|unique:users,email,' . $id;
        }

        if ($request->role === 'partner') {
            $rules['partner_id'] = [
                'nullable',
                'exists:rental_partners,id',
                function ($attribute, $value, $fail) use ($user) {
                    if ($value) {
                         // Check if this partner is already owned by SOMEONE ELSE
                         $existingOwner = RentalPartner::where('id', $value)->whereNotNull('user_id')->where('user_id', '!=', $user->id)->first();
                         if ($existingOwner) {
                             $fail('The selected partner is already defined for another user.');
                         }
                    }
                },
            ];
        }

        $validated = $request->validate($rules);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        return DB::transaction(function () use ($user, $validated, $request) {
             $userData = collect($validated)->except(['partner_id'])->toArray();
             $user->update($userData);

             // If linked to partner
             if ($request->role === 'partner' && $request->filled('partner_id')) {
                 // 1. Unlink any previous partner this user might have had
                 RentalPartner::where('user_id', $user->id)->update(['user_id' => null]);

                 // 2. Link new partner
                 $partner = RentalPartner::find($request->partner_id);
                 $partner->user_id = $user->id;
                 $partner->save();
             } elseif ($request->role !== 'partner') {
                 // If role changed FROM partner TO something else, unlink partner
                 RentalPartner::where('user_id', $user->id)->update(['user_id' => null]);
             }

             return response()->json($user);
        });
    }

    public function updateAvatar(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        if ($user->avatar_url) {
            $path = parse_url($user->avatar_url, PHP_URL_PATH);
            if (is_string($path)) {
                $path = ltrim(str_replace('/storage/', '', $path), '/');
                if ($path !== '') {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $url = asset('storage/' . $path);

        $user->avatar_url = $url;
        $user->save();

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = request()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access only.'], 403);
        }

        $user = User::findOrFail($id);

        // Unlink partner before deleting to prevent cascade delete (if configured incorrectly in DB)
        // or just ensure data integrity.
        if ($user->rentalPartner) {
            $user->rentalPartner->user_id = null;
            $user->rentalPartner->save();
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
