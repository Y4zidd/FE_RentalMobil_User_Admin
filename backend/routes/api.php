<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CarController as AdminCarController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public User Routes
Route::prefix('user')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::get('cars', [CarController::class, 'index']);
    Route::get('cars/{id}', [CarController::class, 'show']);

    // Protected User Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('data', [AuthController::class, 'me']); // /api/user/data
        Route::put('profile', [AuthController::class, 'updateAccount']);
        Route::put('rental-details', [AuthController::class, 'updateRentalDetails']);
        Route::put('password', [AuthController::class, 'changePassword']);
        Route::post('avatar', [AuthController::class, 'updateAvatar']);
        Route::post('logout', [AuthController::class, 'logout']);

        // Legacy user bookings path if needed: /api/user/bookings
        Route::get('bookings', [BookingController::class, 'index']);
    });
});

Route::middleware('auth:sanctum')->prefix('bookings')->group(function () {
    Route::get('user', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::post('{booking}/mark-paid', [BookingController::class, 'markPaid']);
});

Route::middleware('auth:sanctum')->post('payments/checkout', [PaymentController::class, 'checkout']);
Route::post('payments/notification', [PaymentController::class, 'notification']);

// Admin Routes
Route::prefix('admin')->group(function () {
    Route::post('login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout']);

        // Dashboard
        Route::get('overview', [AdminDashboardController::class, 'overview']);

        // Manage Cars
        Route::apiResource('cars', AdminCarController::class);

        // Manage Users
        Route::apiResource('users', AdminUserController::class);

        // Manage Bookings
        Route::apiResource('bookings', AdminBookingController::class)->except(['store', 'destroy']); // Admin usually edits status
    });
});
