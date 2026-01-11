<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        $this->cleanupOverdueBookings();
        $this->cleanupCoupons();

        $user = $request->user();
        $isPartner = $user->role === 'partner';
        $partnerId = $isPartner && $user->rentalPartner ? $user->rentalPartner->id : null;

        $bookingsQuery = Booking::query();

        if ($isPartner) {
            $bookingsQuery->whereHas('car', function ($q) use ($partnerId) {
                $q->where('partner_id', $partnerId);
            });
        }

        $totalBookings = (clone $bookingsQuery)->count();
        $pendingBookings = (clone $bookingsQuery)->where('status', 'pending')->count();
        $confirmedBookings = (clone $bookingsQuery)->where('status', 'confirmed')->count();
        $cancelledBookings = (clone $bookingsQuery)->where('status', 'cancelled')->count();
        $completedBookings = (clone $bookingsQuery)->where('status', 'completed')->count();

        $paymentQuery = Payment::where('transaction_status', 'settlement');

        if ($isPartner) {
            $paymentQuery->whereHas('booking.car', function ($q) use ($partnerId) {
                $q->where('partner_id', $partnerId);
            });
        }

        $totalRevenue = (clone $paymentQuery)->sum('gross_amount');

        $basePaymentsQuery = Payment::where('provider', 'midtrans')
            ->where('transaction_status', 'settlement');

        if ($isPartner) {
            $basePaymentsQuery->whereHas('booking.car', function ($q) use ($partnerId) {
                $q->where('partner_id', $partnerId);
            });
        }

        $paymentsForDay = (clone $basePaymentsQuery)
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        $revenueByDay = $paymentsForDay
            ->groupBy(fn ($payment) => $payment->created_at->toDateString())
            ->map(function ($group) {
                return [
                    'date' => $group->first()->created_at->toDateString(),
                    'revenue' => $group->sum('gross_amount'),
                ];
            })
            ->values();

        $paymentsForMonth = (clone $basePaymentsQuery)
            ->where('created_at', '>=', now()->subMonths(6))
            ->with('booking')
            ->get();

        $revenueByMonth = $paymentsForMonth
            ->groupBy(fn ($payment) => $payment->created_at->format('Y-m'))
            ->map(function ($group) {
                $month = $group->first()->created_at->format('Y-m');
                $online = 0;
                $payAtLocation = 0;

                foreach ($group as $payment) {
                    $method = optional($payment->booking)->payment_method;
                    if ($method === 'online_full') {
                        $online += $payment->gross_amount;
                    } elseif ($method === 'pay_at_location') {
                        $payAtLocation += $payment->gross_amount;
                    }
                }

                return [
                    'month' => $month,
                    'online' => $online,
                    'pay_at_location' => $payAtLocation,
                ];
            })
            ->values();

        return response()->json([
            'metrics' => [
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'confirmed_bookings' => $confirmedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'completed_bookings' => $completedBookings,
                'total_revenue' => $totalRevenue,
            ],
            'revenue_by_day' => $revenueByDay,
            'revenue_by_month' => $revenueByMonth,
        ]);
    }

    protected function cleanupOverdueBookings()
    {
        $overdue = Booking::with('car')
            ->where('status', 'confirmed')
            ->where('return_date', '<', now())
            ->get();
        foreach ($overdue as $booking) {
            $booking->status = 'completed';
            $booking->save();
            $car = $booking->car;
            if ($car && $car->status !== 'maintenance') {
                $hasActiveBookings = $car->bookings()
                    ->where('status', 'confirmed')
                    ->exists();
                $car->status = $hasActiveBookings ? 'rented' : 'available';
                $car->save();
            }
        }
    }

    protected function cleanupCoupons()
    {
        $now = now();
        $coupons = \App\Models\Coupon::all();
        foreach ($coupons as $coupon) {
            $shouldDeactivate = false;
            if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
                $shouldDeactivate = true;
            }
            if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
                $shouldDeactivate = true;
            }
            if ($shouldDeactivate && $coupon->is_active) {
                $coupon->is_active = false;
                $coupon->save();
            }
        }
    }
}
