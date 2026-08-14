<?php

namespace App\Models;

use App\Models\Alat;
use App\Models\Peminjaman;
use Illuminate\Database\Eloquent\Model;

class DetailPeminjaman extends Model
{   
    protected $table = 'detail_peminjaman';
    protected $guarded = [];

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function alat()
    {
        return $this->belongsTo(Alat::class, 'alat_id');
    }
}
