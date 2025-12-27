<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::with(['car.location', 'options', 'payments'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function markPaid(Request $request, $id)
    {
        $booking = Booking::with('payments')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->payment_method !== 'online_full') {
            return response()->json(['message' => 'This booking is not using online payment'], 400);
        }

        if ($booking->status === 'confirmed') {
            return response()->json($booking);
        }

        $booking->status = 'confirmed';
        $booking->save();

        $payment = $booking->payments()->latest()->first();
        if ($payment) {
            $payment->transaction_status = 'settlement';
            $payment->paid_at = now();
            $payment->save();
        }
        if ($booking->car && $booking->car->status !== 'maintenance') {
            $booking->car->status = 'rented';
            $booking->car->save();
        }

        return response()->json($booking->load(['car.location', 'options', 'payments']));
    }

    public function store(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'pickup_date' => 'required|date',
            'return_date' => 'required|date|after:pickup_date',
            'pickup_location_id' => 'required|exists:locations,id',
            'dropoff_location_id' => 'nullable|exists:locations,id',
            'payment_method' => 'required|in:pay_at_location,online_full',
            'options' => 'array',
        ]);

        // Calculate prices (simplified for now)
        // Ideally fetch car price and calculate based on days
        // Here we assume frontend sends some data or we recalculate.
        // Best practice: Recalculate everything backend side.

        $car = \App\Models\Car::findOrFail($request->car_id);
        $pickup = \Carbon\Carbon::parse($request->pickup_date);
        $return = \Carbon\Carbon::parse($request->return_date);
        $days = $pickup->diffInDays($return) ?: 1; // Minimum 1 day

        $basePrice = $car->price_per_day * $days;
        $extrasTotal = 0;

        DB::beginTransaction();
        try {
            if ($car->status !== 'available') {
                return response()->json(['message' => 'Car is not available for booking'], 400);
            }

            $booking = Booking::create([
                'user_id' => Auth::id(),
                'car_id' => $request->car_id,
                'pickup_date' => $request->pickup_date,
                'return_date' => $request->return_date,
                'pickup_location_id' => $request->pickup_location_id,
                'dropoff_location_id' => $request->dropoff_location_id ?? $request->pickup_location_id,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'base_price' => $basePrice,
                'extras_total' => 0, // updated below
                'total_price' => 0, // updated below
                'notes' => $request->notes ?? null,
            ]);

            if ($request->has('options')) {
                foreach ($request->options as $opt) {
                    // Assume opt has code, label, price_per_day
                    // In real app, validate option prices from a master config or DB
                    $optPrice = $opt['price'] ?? 0; // simplified
                    $optTotal = $optPrice * $days;
                    $extrasTotal += $optTotal;

                    BookingOption::create([
                        'booking_id' => $booking->id,
                        'option_code' => $opt['code'],
                        'label' => $opt['label'] ?? $opt['code'],
                        'price_per_day' => $optPrice,
                        'days' => $days,
                        'total_price' => $optTotal,
                    ]);
                }
            }

            $booking->extras_total = $extrasTotal;
            $booking->total_price = $basePrice + $extrasTotal;
            $booking->save();

            // Keep car available while booking is pending.

            DB::commit();

            return response()->json($booking->load('options'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Booking failed', 'error' => $e->getMessage()], 500);
        }
    }
}
