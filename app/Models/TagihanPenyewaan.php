<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TagihanPenyewaan extends Model
{
    protected $table = 'tagihan_penyewaan';
    protected $guarded = [];

    public function penyewaan() { return $this->belongsTo(PenyewaanPenelitian::class, 'penyewaan_penelitian_id'); }
    public function mahasiswa() { return $this->belongsTo(User::class, 'mahasiswa_id'); }
}