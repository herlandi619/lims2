<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatAlat extends Model
{   
    protected $table = 'riwayat_alat';
    protected $guarded = [];

    public function alat()
    {
        return $this->belongsTo(Alat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
