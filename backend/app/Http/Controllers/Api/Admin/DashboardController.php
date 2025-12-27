<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview()
    {
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();
        $completedBookings = Booking::where('status', 'completed')->count();

        $totalRevenue = Payment::where('transaction_status', 'settlement')->sum('gross_amount');

        $basePaymentsQuery = Payment::where('provider', 'midtrans')
            ->where('transaction_status', 'settlement');

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
}
