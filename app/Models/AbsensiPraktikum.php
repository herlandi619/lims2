<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsensiPraktikum extends Model
{
    use HasFactory;

    protected $table = 'absensi_praktikum';

    protected $fillable = [
        'jadwal_id',
        'pertemuan_ke',
        'tanggal',
        'materi_praktikum',
        'dosen_id',
        'status_pertemuan',
    ];

    public function jadwal()
    {
        return $this->belongsTo(JadwalLaboratorium::class, 'jadwal_id');
    }

    public function dosen()
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function details()
    {
        return $this->hasMany(DetailAbsensi::class, 'absensi_id');
    }
}