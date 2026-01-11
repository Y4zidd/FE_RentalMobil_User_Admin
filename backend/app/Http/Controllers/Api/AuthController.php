<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function registerWithVerification(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser && $existingUser->email_verified_at) {
            return response()->json([
                'message' => 'Email is already registered and verified.',
            ], 422);
        }

        $code = (string) random_int(100000, 999999);
        $hashedPassword = Hash::make($request->password);

        DB::table('user_verification_codes')->updateOrInsert(
            [
                'user_id' => $existingUser?->id,
                'email' => $request->email,
                'type' => 'register',
            ],
            [
                'new_email' => null,
                'code' => $code,
                'name' => $request->name,
                'password' => $hashedPassword,
                'expires_at' => Carbon::now()->addMinutes(30),
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
            ]
        );

        Mail::raw(
            "Hi {$request->name},\n\n" .
            "Here is your email verification code for your Rent-A-Car account:\n\n" .
            "{$code}\n\n" .
            "This code will expire in 30 minutes.\n\n" .
            "If you did not try to sign up, you can safely ignore this email.",
            function ($message) use ($request) {
                $message->to($request->email)->subject('Rent-A-Car Email Verification Code');
            }
        );

        return response()->json([
            'message' => 'Verification code sent to your email. Please verify to activate your account.',
            'needs_verification' => true,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah atau akun tidak ditemukan.',
            ], 422);
        }

        if (! $user->email_verified_at && $user->role === 'customer') {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
            ], 422);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function verifyEmailCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $record = DB::table('user_verification_codes')
            ->where('email', $request->email)
            ->where('type', 'register')
            ->where('code', $request->code)
            ->where('expires_at', '>=', Carbon::now())
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired verification code.'], 422);
        }

        $user = User::where('email', $record->email)->first();

        if (! $user) {
            $user = User::create([
                'name' => $record->name ?? '',
                'email' => $record->email,
                'password' => $record->password ?? Hash::make(Str::random(16)),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
            ]);
        } else {
            $user->email_verified_at = Carbon::now();
            $user->save();
        }

        DB::table('user_verification_codes')
            ->where('email', $user->email)
            ->where('type', 'register')
            ->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'partner') {
            $user->load('rentalPartner');
        }
        return response()->json($user);
    }

    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function requestEmailChangeCode(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'new_email' => 'required|email|unique:users,email',
        ]);

        $newEmail = $request->new_email;

        $code = (string) random_int(100000, 999999);

        DB::table('user_verification_codes')->updateOrInsert(
            [
                'user_id' => $user->id,
                'type' => 'email_change',
            ],
            [
                'email' => $user->email,
                'new_email' => $newEmail,
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(30),
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
            ]
        );

        Mail::raw(
            "Hi,\n\n" .
            "Here is your verification code to confirm the email change for your Rent-A-Car account:\n\n" .
            "{$code}\n\n" .
            "This code will expire in 30 minutes.\n\n" .
            "If you did not request to change your email, you can safely ignore this email.",
            function ($message) use ($newEmail) {
                $message->to($newEmail)->subject('Rent-A-Car Email Change Verification Code');
            }
        );

        return response()->json([
            'message' => 'Verification code sent to the new email address.',
        ]);
    }

    public function confirmEmailChange(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'new_email' => 'required|email',
            'code' => 'required|string',
        ]);

        $record = DB::table('user_verification_codes')
            ->where('user_id', $user->id)
            ->where('type', 'email_change')
            ->where('new_email', $request->new_email)
            ->where('code', $request->code)
            ->where('expires_at', '>=', Carbon::now())
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired verification code.'], 422);
        }

        $user->email = $request->new_email;
        $user->email_verified_at = Carbon::now();
        $user->save();

        DB::table('user_verification_codes')
            ->where('user_id', $user->id)
            ->where('type', 'email_change')
            ->delete();

        return response()->json([
            'message' => 'Email updated successfully.',
            'user' => $user,
        ]);
    }

    public function updateRentalDetails(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'license_number' => 'nullable|string|max:255',
            'default_city' => 'nullable|string|max:255',
            'rental_preferences' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function requestPasswordResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'If the email is registered, a reset code has been sent.',
            ]);
        }

        $code = (string) random_int(100000, 999999);

        DB::table('user_verification_codes')->updateOrInsert(
            [
                'user_id' => $user->id,
                'type' => 'password_reset',
            ],
            [
                'email' => $user->email,
                'new_email' => null,
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(30),
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
            ]
        );

        Mail::raw(
            "Hi {$user->name},\n\n" .
            "Here is your password reset code for your Rent-A-Car account:\n\n" .
            "{$code}\n\n" .
            "This code will expire in 30 minutes.\n\n" .
            "If you did not request a password reset, you can safely ignore this email.",
            function ($message) use ($user) {
                $message->to($user->email)->subject('Rent-A-Car Password Reset Code');
            }
        );

        return response()->json([
            'message' => 'If the email is registered, a reset code has been sent.',
        ]);
    }

    public function resetPasswordWithCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid email or code.'], 422);
        }

        $record = DB::table('user_verification_codes')
            ->where('user_id', $user->id)
            ->where('type', 'password_reset')
            ->where('code', $request->code)
            ->where('expires_at', '>=', Carbon::now())
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired reset code.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('user_verification_codes')
            ->where('user_id', $user->id)
            ->where('type', 'password_reset')
            ->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    public function updateAvatar(Request $request)
    {
        $user = $request->user();

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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
