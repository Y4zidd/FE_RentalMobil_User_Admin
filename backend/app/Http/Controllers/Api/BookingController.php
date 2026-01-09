<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingOption;
use Dompdf\Dompdf;
use Dompdf\Options;
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
            'dropoff_full_address' => 'nullable|string',
            'dropoff_latitude' => 'nullable|numeric',
            'dropoff_longitude' => 'nullable|numeric',
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
                'dropoff_full_address' => $request->dropoff_full_address,
                'dropoff_latitude' => $request->dropoff_latitude,
                'dropoff_longitude' => $request->dropoff_longitude,
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

    public function receipt(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $booking->load(['car.location', 'user', 'options', 'payments']);

        $user = $booking->user;
        $car = $booking->car;
        $payment = $booking->payments->sortByDesc('created_at')->first();

        $pickupDate = optional($booking->pickup_date)->format('Y-m-d H:i');
        $returnDate = optional($booking->return_date)->format('Y-m-d H:i');

        $basePrice = (int) round($booking->base_price ?? 0);
        $extrasTotal = (int) round($booking->extras_total ?? 0);
        $discountAmount = (int) round($booking->discount_amount ?? 0);
        $totalPrice = (int) round($booking->total_price ?? 0);

        $formatCurrency = function (int $amount): string {
            return 'Rp ' . number_format($amount, 0, ',', '.');
        };

        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Booking Receipt</title>';
        $html .= '<style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7fafc;color:#1a202c;padding:24px;}';
        $html .= '.card{max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;}';
        $html .= 'h1{font-size:20px;margin-bottom:4px;}h2{font-size:16px;margin-top:24px;margin-bottom:8px;}';
        $html .= '.muted{color:#718096;font-size:12px;}';
        $html .= '.row{display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px;}';
        $html .= '.label{color:#718096;} .value{font-weight:500;}';
        $html .= '.divider{border-top:1px solid #e2e8f0;margin:16px 0;}';
        $html .= '.total{font-weight:700;font-size:16px;}';
        $html .= '</style></head><body>';
        $html .= '<div class="card">';
        $html .= '<h1>Booking Receipt</h1>';
        $html .= '<p class="muted">Booking #' . htmlspecialchars((string) $booking->id) . '</p>';

        $html .= '<h2>Customer</h2>';
        $html .= '<div class="row"><span class="label">Name</span><span class="value">' . htmlspecialchars($user->name ?? '') . '</span></div>';
        $html .= '<div class="row"><span class="label">Email</span><span class="value">' . htmlspecialchars($user->email ?? '') . '</span></div>';
        if ($user && $user->phone) {
            $html .= '<div class="row"><span class="label">Phone</span><span class="value">' . htmlspecialchars($user->phone) . '</span></div>';
        }

        $html .= '<h2>Car & Trip</h2>';
        if ($car) {
            $html .= '<div class="row"><span class="label">Car</span><span class="value">' . htmlspecialchars(($car->brand ?? '') . ' ' . ($car->model ?? '')) . '</span></div>';
        }
        $html .= '<div class="row"><span class="label">Pickup</span><span class="value">' . htmlspecialchars($pickupDate ?? '') . '</span></div>';
        $html .= '<div class="row"><span class="label">Return</span><span class="value">' . htmlspecialchars($returnDate ?? '') . '</span></div>';
        $html .= '<div class="row"><span class="label">Status</span><span class="value">' . htmlspecialchars($booking->status ?? '') . '</span></div>';
        $html .= '<div class="row"><span class="label">Payment Method</span><span class="value">' . htmlspecialchars($booking->payment_method ?? '') . '</span></div>';

        if ($booking->dropoff_full_address) {
            $html .= '<div class="row"><span class="label">Drop-off address</span><span class="value">' . htmlspecialchars($booking->dropoff_full_address) . '</span></div>';
        }

        if ($booking->coupon_code) {
            $html .= '<div class="row"><span class="label">Coupon</span><span class="value">' . htmlspecialchars($booking->coupon_code) . '</span></div>';
        }

        if ($payment) {
            $html .= '<h2>Payment</h2>';
            $html .= '<div class="row"><span class="label">Order ID</span><span class="value">' . htmlspecialchars($payment->order_id ?? '') . '</span></div>';
            $html .= '<div class="row"><span class="label">Transaction ID</span><span class="value">' . htmlspecialchars($payment->transaction_id ?? '') . '</span></div>';
            $html .= '<div class="row"><span class="label">Status</span><span class="value">' . htmlspecialchars($payment->transaction_status ?? '') . '</span></div>';
            if ($payment->paid_at) {
                $html .= '<div class="row"><span class="label">Paid at</span><span class="value">' . htmlspecialchars($payment->paid_at->format('Y-m-d H:i')) . '</span></div>';
            }
        }

        $html .= '<h2>Price Breakdown</h2>';
        $html .= '<div class="row"><span class="label">Base price</span><span class="value">' . $formatCurrency($basePrice) . '</span></div>';
        $html .= '<div class="row"><span class="label">Extras</span><span class="value">' . $formatCurrency($extrasTotal) . '</span></div>';
        if ($discountAmount > 0) {
            $html .= '<div class="row"><span class="label">Discount</span><span class="value">-' . $formatCurrency($discountAmount) . '</span></div>';
        }
        $html .= '<div class="divider"></div>';
        $html .= '<div class="row"><span class="total">Total</span><span class="total">' . $formatCurrency($totalPrice) . '</span></div>';

        $html .= '<p class="muted" style="margin-top:24px;">Thank you for choosing Rent-A-Car.</p>';
        $html .= '</div></body></html>';

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $pdfOutput = $dompdf->output();
        $fileName = 'booking-' . $booking->id . '-receipt.pdf';

        return response($pdfOutput, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="'.$fileName.'"');
    }
}
