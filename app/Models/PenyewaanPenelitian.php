<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenyewaanPenelitian extends Model
{
    protected $table = 'penyewaan_penelitian';
    protected $guarded = [];

    public function surat() { return $this->belongsTo(SuratPenelitian::class, 'surat_penelitian_id'); }
    public function mahasiswa() { return $this->belongsTo(User::class, 'mahasiswa_id'); }
    public function details() { return $this->hasMany(DetailPenyewaanPenelitian::class, 'penyewaan_penelitian_id'); }
    public function tagihan() { return $this->hasOne(TagihanPenyewaan::class, 'penyewaan_penelitian_id'); }
}