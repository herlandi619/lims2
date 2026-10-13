<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuratPenelitian extends Model
{
    protected $table = 'surat_penelitian';
    protected $guarded = [];

    public function mahasiswa() { return $this->belongsTo(User::class, 'mahasiswa_id'); }
    public function penyewaan() { return $this->hasOne(PenyewaanPenelitian::class, 'surat_penelitian_id'); }
}
