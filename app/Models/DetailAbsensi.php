<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailAbsensi extends Model
{
    use HasFactory;

    protected $table = 'detail_absensi';

    protected $fillable = [
        'pertemuan_absensi_id', // <-- WAJIB ada di $fillable
        'mahasiswa_id',
        'status_kehadiran',
        'waktu_presensi',
        'keterangan',
    ];
    public function absensi()
    {
        return $this->belongsTo(AbsensiPraktikum::class, 'absensi_id');
    }

    public function pertemuan()
    {
        return $this->belongsTo(PertemuanAbsensi::class, 'pertemuan_absensi_id');
    }

    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }
}