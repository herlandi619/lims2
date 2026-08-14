<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasPraktikum extends Model
{
    protected $table = 'kelas_praktikum';

    protected $fillable = [
        'kode_kelas',
        'nama_praktikum',
        'semester',
        'nama_kelas',
        'tahun_ajaran',
        'dosen_id',
        'ruangan_id',
        'status_aktif'
    ];

    public function dosen()
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    public function pertemuan()
    {
        return $this->hasMany(PertemuanAbsensi::class, 'kelas_praktikum_id')->orderBy('pertemuan_ke');
    }
}