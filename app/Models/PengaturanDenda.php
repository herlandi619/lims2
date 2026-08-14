<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanDenda extends Model
{
    protected $table = "pengaturan_denda";

    protected $guarded = [];

    protected $casts = [
        'denda_per_hari'     => 'float',
        'denda_rusak_ringan' => 'float',
        'denda_rusak_berat'  => 'float',
    ];
}
