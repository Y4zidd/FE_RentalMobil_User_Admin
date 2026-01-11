<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->role, ['admin', 'staff', 'partner'])) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Admin or Staff access required.'], 403);
    }
}
