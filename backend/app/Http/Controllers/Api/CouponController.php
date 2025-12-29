<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;
use App\Models\Car;
use Carbon\Carbon;

class CouponController extends Controller
{
    protected function computeDiscount(Coupon $coupon, int $total): int
    {
        if ($coupon->discount_type === 'percent') {
            $amount = (int) floor($total * ($coupon->discount_value / 100));
            return max(0, min($amount, $total));
        }
        return max(0, min((int) $coupon->discount_value, $total));
    }

    public function validateCoupon(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'car_id' => 'nullable|exists:cars,id',
            'pickup_date' => 'nullable|date',
            'return_date' => 'nullable|date|after:pickup_date',
            'options' => 'array',
        ]);

        $coupon = Coupon::where('code', $data['code'])->first();
        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'Coupon not found'], 404);
        }

        if (! $coupon->is_active) {
            return response()->json(['valid' => false, 'message' => 'Coupon inactive'], 400);
        }

        $now = Carbon::now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            return response()->json(['valid' => false, 'message' => 'Coupon not started'], 400);
        }
        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            return response()->json(['valid' => false, 'message' => 'Coupon expired'], 400);
        }
        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            return response()->json(['valid' => false, 'message' => 'Coupon usage limit reached'], 400);
        }

        $total = 0;
        if (! empty($data['car_id']) && ! empty($data['pickup_date']) && ! empty($data['return_date'])) {
            $car = Car::find($data['car_id']);
            if ($car) {
                $pickup = Carbon::parse($data['pickup_date']);
                $return = Carbon::parse($data['return_date']);
                $days = $pickup->diffInDays($return) ?: 1;
                $basePrice = $car->price_per_day * $days;
                $extrasTotal = 0;
                if (! empty($data['options'])) {
                    foreach ($data['options'] as $opt) {
                        $price = isset($opt['price']) ? (int) $opt['price'] : 0;
                        $extrasTotal += ($price * $days);
                    }
                }
                $total = $basePrice + $extrasTotal;
            }
        } else {
            $total = (int) $request->input('cart_total', 0);
        }

        if ($total < $coupon->min_order_total) {
            return response()->json(['valid' => false, 'message' => 'Order total below minimum']);
        }

        $discount = $this->computeDiscount($coupon, $total);

        return response()->json([
            'valid' => true,
            'discount_amount' => $discount,
            'discount_type' => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
            'code' => $coupon->code,
        ]);
    }
}
