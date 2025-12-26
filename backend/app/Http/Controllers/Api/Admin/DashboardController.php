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
        
        // Total revenue from confirmed payments
        $totalRevenue = Payment::where('transaction_status', 'settlement')->sum('gross_amount');

        // Revenue by day (last 7 days)
        $revenueByDay = Payment::where('transaction_status', 'settlement')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(gross_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

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
        ]);
    }
}
