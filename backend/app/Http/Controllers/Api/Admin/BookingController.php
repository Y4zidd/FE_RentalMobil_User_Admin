<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'car', 'options']);

        $user = $request->user();
        if ($user->role === 'partner') {
            if ($user->rentalPartner) {
                $query->whereHas('car', function($q) use ($user) {
                    $q->where('partner_id', $user->rentalPartner->id);
                });
            } else {
                return response()->json([]);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();
        return response()->json($bookings);
    }

    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'car', 'options', 'payments'])->findOrFail($id);

        $user = $request->user();
        if ($user->role === 'partner') {
            if (!$user->rentalPartner || $booking->car->partner_id !== $user->rentalPartner->id) {
                return response()->json(['message' => 'Unauthorized access to booking.'], 403);
            }
        }

        return response()->json($booking);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::with('car')->findOrFail($id);

        $user = $request->user();
        if ($user->role === 'partner') {
            if (!$user->rentalPartner || $booking->car->partner_id !== $user->rentalPartner->id) {
                return response()->json(['message' => 'Unauthorized access to booking.'], 403);
            }
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $booking->status = $request->status;
        $booking->save();

        $car = $booking->car;
        if ($car && $car->status !== 'maintenance') {
            $hasActiveBookings = $car->bookings()
                ->whereIn('status', ['confirmed'])
                ->exists();

            $car->status = $hasActiveBookings ? 'rented' : 'available';
            $car->save();
        }

        return response()->json($booking->load(['user', 'car', 'options']));
    }

    public function cleanupOverdue()
    {
        $overdue = Booking::with('car')
            ->where('status', 'confirmed')
            ->where('return_date', '<', now())
            ->get();

        $updated = 0;
        foreach ($overdue as $booking) {
            $booking->status = 'completed';
            $booking->save();
            $updated++;

            $car = $booking->car;
            if ($car && $car->status !== 'maintenance') {
                $hasActiveBookings = $car->bookings()
                    ->where('status', 'confirmed')
                    ->exists();

                $car->status = $hasActiveBookings ? 'rented' : 'available';
                $car->save();
            }
        }

        return response()->json(['updated' => $updated]);
    }
}
