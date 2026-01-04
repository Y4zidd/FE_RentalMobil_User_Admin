<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravolt\Indonesia\Facade as Indonesia;

class RegionsController extends Controller
{
    public function provinces(Request $request)
    {
        $provinces = Indonesia::allProvinces()->map(function ($p) {
            return [
                'id' => (int) $p->id,
                'name' => $p->name,
            ];
        })->values();

        return response()->json($provinces);
    }

    public function regenciesByProvince($provinceId)
    {
        $province = Indonesia::findProvince($provinceId, ['cities']);

        if (!$province) {
            return response()->json(['message' => 'Province not found'], 404);
        }

        $cities = collect($province->cities)->map(function ($c) {
            return [
                'id' => (int) $c->id,
                'name' => $c->name,
            ];
        })->values();

        return response()->json($cities);
    }
}

