<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasMahasiswa extends Model
{
    protected $table = 'kelas_mahasiswa';

    protected $fillable = [
        'kelas_praktikum_id',
        'mahasiswa_id',
        'status_krs',
    ];

    public function kelasPraktikum()
    {
        return $this->belongsTo(KelasPraktikum::class, 'kelas_praktikum_id');
    }

    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }
}