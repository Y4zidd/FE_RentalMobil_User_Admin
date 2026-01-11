<?php

use App\Models\RentalPartner;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking for orphans...\n";

// Find partners with a user_id that doesn't exist in users table
$orphans = RentalPartner::whereNotNull('user_id')
    ->whereNotIn('user_id', User::select('id'))
    ->get();

if ($orphans->count() > 0) {
    echo "Found " . $orphans->count() . " orphaned partners:\n";
    foreach ($orphans as $p) {
        echo "- " . $p->name . " (User ID: " . $p->user_id . ")\n";
        $p->user_id = null;
        $p->save();
        echo "  Fixed: set user_id to null.\n";
    }
} else {
    echo "No orphaned partners found. The partner was likely deleted via Cascade.\n";
}
