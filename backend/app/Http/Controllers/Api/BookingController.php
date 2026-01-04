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

        $car = \App\Models\Car::findOrFail($request->car_id);
        $pickup = \Carbon\Carbon::parse($request->pickup_date);
        $return = \Carbon\Carbon::parse($request->return_date);
        $days = $pickup->diffInDays($return) ?: 1;

        $basePrice = $car->price_per_day * $days;
        $extrasTotal = 0;
        $discountAmount = 0;

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
                'coupon_id' => null,
                'coupon_code' => null,
                'base_price' => $basePrice,
                'extras_total' => 0,
                'discount_amount' => 0,
                'total_price' => 0,
                'notes' => $request->notes ?? null,
            ]);

            if ($request->has('options')) {
                foreach ($request->options as $opt) {
                    $optPrice = $opt['price'] ?? 0;
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

            if ($request->filled('coupon_code')) {
                $coupon = \App\Models\Coupon::where('code', $request->coupon_code)->first();
                if ($coupon && $coupon->is_active) {
                    $now = \Carbon\Carbon::now();
                    $isWithinDates = (!$coupon->starts_at || $now->gte($coupon->starts_at))
                        && (!$coupon->expires_at || $now->lte($coupon->expires_at));
                    $notExceeded = (!$coupon->max_uses || $coupon->used_count < $coupon->max_uses);
                    $orderTotal = $basePrice + $extrasTotal;
                    if ($isWithinDates && $notExceeded && $orderTotal >= ($coupon->min_order_total ?? 0)) {
                        if ($coupon->discount_type === 'percent') {
                            $discountAmount = (int) floor($orderTotal * ($coupon->discount_value / 100));
                        } else {
                            $discountAmount = (int) $coupon->discount_value;
                        }
                        $discountAmount = max(0, min($discountAmount, $orderTotal));
                        $booking->coupon_id = $coupon->id;
                        $booking->coupon_code = $coupon->code;
                        $coupon->used_count = ($coupon->used_count ?? 0) + 1;
                        $coupon->save();
                    }
                }
            }

            $booking->extras_total = $extrasTotal;
            $booking->discount_amount = $discountAmount;
            $booking->total_price = ($basePrice + $extrasTotal) - $discountAmount;
            $booking->save();

            DB::commit();

            return response()->json($booking->load('options'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Booking failed', 'error' => $e->getMessage()], 500);
        }
    }
}
