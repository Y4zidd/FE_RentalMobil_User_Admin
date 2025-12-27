<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

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
        // Admin create user (staff/admin)
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,staff,customer',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['email_verified_at'] = now();

        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $rules = [
            'name' => 'string',
            'role' => 'in:admin,staff,customer',
            'status' => 'in:active,inactive',
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ];

        // Prevent email update if locked (Google users)
        if (!$user->is_email_locked) {
            $rules['email'] = 'email|unique:users,email,' . $id;
        }

        $validated = $request->validate($rules);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);
        return response()->json($user);
    }

    public function updateAvatar(Request $request, $id)
    {
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
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
