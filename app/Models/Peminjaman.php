<?php

namespace App\Models;

use App\Models\Alat;
use App\Models\DetailPeminjaman;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Peminjaman extends Model
{   
    protected $table = 'peminjaman';
    protected $guarded = [];

    // RELASI
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function details()
    {
        return $this->hasMany(DetailPeminjaman::class, 'peminjaman_id');
    }

    public function alat(): BelongsTo
    {
        // Sesuaikan 'App\Models\Alat' dengan nama Class Model Alat Anda
        return $this->belongsTo(Alat::class, 'alat_id');
    }
}
