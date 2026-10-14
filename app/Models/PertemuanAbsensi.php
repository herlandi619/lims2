<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PertemuanAbsensi extends Model
{
    protected $table = 'pertemuan_absensi';

    // protected $fillable = [
    //     'kelas_praktikum_id',
    //     'pertemuan_ke',
    //     'tanggal_praktik',
    //     'jam_mulai',
    //     'jam_selesai',
    //     'topik_materi',
    //     'catatan_dosen',
    //     'status_pertemuan',
    //     'qr_token'
    // ];

    protected $guarded = [];

    public function kelasPraktikum()
    {
        return $this->belongsTo(KelasPraktikum::class, 'kelas_praktikum_id');
    }

    public function detailAbsensi()
    {
        return $this->hasMany(DetailAbsensi::class, 'pertemuan_absensi_id');
    }
}