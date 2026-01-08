<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sqlite:copy-to-mysql', function () {
    config([
        'database.connections.sqlite.database' => database_path('database.sqlite'),
    ]);

    $sqlite = DB::connection('sqlite');
    $mysql = DB::connection('mysql');

    $mysql->statement('SET FOREIGN_KEY_CHECKS=0');

    $tables = [
        'users',
        'password_reset_tokens',
        'sessions',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'locations',
        'rental_partners',
        'cars',
        'car_images',
        'coupons',
        'bookings',
        'booking_options',
        'payments',
        'personal_access_tokens',
        'user_verification_codes',
        'indonesia_provinces',
        'indonesia_cities',
        'indonesia_districts',
        'indonesia_villages',
    ];

    foreach ($tables as $table) {
        if (! $sqlite->getSchemaBuilder()->hasTable($table)) {
            continue;
        }

        if ($mysql->getSchemaBuilder()->hasTable($table)) {
            $mysql->table($table)->truncate();
        }

        $rows = $sqlite->table($table)->get();

        foreach ($rows as $row) {
            $mysql->table($table)->insert((array) $row);
        }
    }

    $mysql->statement('SET FOREIGN_KEY_CHECKS=1');

    $this->info('Data copied from SQLite to MySQL successfully.');
})->purpose('Copy all application data from SQLite to MySQL');
