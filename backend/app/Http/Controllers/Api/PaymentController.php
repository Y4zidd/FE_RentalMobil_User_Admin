<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with(['car', 'user'])
            ->where('id', $request->booking_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $serverKey = env('MIDTRANS_SERVER_KEY');
        if (! $serverKey) {
            return response()->json(['message' => 'Midtrans server key is not configured'], 500);
        }

        $isProduction = (bool) env('MIDTRANS_IS_PRODUCTION', false);
        $baseUrl = $isProduction
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';

        $orderId = 'BOOK-' . $booking->id . '-' . now()->timestamp;

        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) round($booking->total_price),
            ],
            'credit_card' => [
                'secure' => true,
            ],
            'customer_details' => [
                'first_name' => $booking->user->name ?? null,
                'email' => $booking->user->email ?? null,
                'phone' => $booking->user->phone ?? null,
            ],
            'item_details' => [
                [
                    'id' => (string) $booking->car_id,
                    'price' => (int) round($booking->base_price + $booking->extras_total),
                    'quantity' => 1,
                    'name' => $booking->car ? ($booking->car->brand . ' ' . $booking->car->model) : 'Car rental',
                ],
            ],
        ];

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'provider' => 'midtrans',
            'order_id' => $orderId,
            'transaction_id' => null,
            'payment_type' => null,
            'gross_amount' => $booking->total_price,
            'currency' => 'IDR',
            'transaction_status' => 'pending',
            'fraud_status' => null,
            'approval_code' => null,
            'payload_request' => $payload,
        ]);

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($baseUrl . '/snap/v1/transactions', $payload);

            if (! $response->successful()) {
                $payment->transaction_status = 'failed';
                $payment->payload_response = [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ];
                $payment->save();

                return response()->json([
                    'message' => 'Failed to create Midtrans transaction',
                ], 502);
            }

            $body = $response->json();

            $payment->transaction_id = $body['transaction_id'] ?? null;
            $payment->payment_type = $body['payment_type'] ?? null;
            $payment->payload_response = $body;
            $payment->save();

            return response()->json([
                'token' => $body['token'] ?? null,
                'redirect_url' => $body['redirect_url'] ?? null,
                'order_id' => $orderId,
            ]);
        } catch (\Throwable $e) {
            Log::error('Midtrans checkout failed', [
                'error' => $e->getMessage(),
            ]);

            $payment->transaction_status = 'failed';
            $payment->save();

            return response()->json([
                'message' => 'Midtrans checkout failed',
            ], 500);
        }
    }

    public function notification(Request $request)
    {
        $orderId = $request->input('order_id');
        $transactionStatus = $request->input('transaction_status');
        $fraudStatus = $request->input('fraud_status');
        $transactionId = $request->input('transaction_id');
        $paymentType = $request->input('payment_type');

        if (! $orderId) {
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        $payment = Payment::where('order_id', $orderId)->with('booking')->first();
        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->transaction_status = $transactionStatus ?? $payment->transaction_status;
        $payment->fraud_status = $fraudStatus ?? $payment->fraud_status;
        $payment->transaction_id = $transactionId ?? $payment->transaction_id;
        $payment->payment_type = $paymentType ?? $payment->payment_type;
        $payment->payload_notification = $request->all();

        if ($transactionStatus === 'settlement') {
            $payment->paid_at = now();
            if ($payment->booking && $payment->booking->status === 'pending') {
                $payment->booking->status = 'confirmed';
                $payment->booking->save();
            }
        }

        $payment->save();

        return response()->json(['message' => 'Notification received']);
    }
}
