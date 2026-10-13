<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPenyewaanPenelitian extends Model
{
    use HasFactory;

    // Tambahkan baris ini agar Laravel membaca tabel yang benar
    protected $table = 'detail_penyewaan_penelitian';

    protected $guarded = []; // atau $fillable

    // ... relasi ke Alat, Penyewaan, dll ...
    public function alat()
    {
        return $this->belongsTo(Alat::class);
    }
}