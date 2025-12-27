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

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();
        return response()->json($bookings);
    }

    public function show($id)
    {
        $booking = Booking::with(['user', 'car', 'options', 'payments'])->findOrFail($id);
        return response()->json($booking);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::with('car')->findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $booking->status = $request->status;
        $booking->save();

        $car = $booking->car;
        if ($car && $car->status !== 'maintenance') {
            $hasActiveBookings = $car->bookings()
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            $car->status = $hasActiveBookings ? 'rented' : 'available';
            $car->save();
        }

        return response()->json($booking->load(['user', 'car', 'options']));
    }
}
