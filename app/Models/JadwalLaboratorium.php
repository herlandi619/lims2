<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalLaboratorium extends Model
{   
    protected $table = 'jadwal_laboratorium';
    protected $guarded = [];

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }

    public function dosen()
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function absensi()
    {
        return $this->hasMany(AbsensiPraktikum::class, 'jadwal_id');
    }

    public function anggotaKelas()
    {
        return $this->hasMany(KelasMahasiswa::class, 'jadwal_id');
    }

    public function peserta() {
        return $this->belongsToMany(User::class, 'krs_mahasiswa', 'jadwal_laboratorium_id', 'user_id');
    }


}
