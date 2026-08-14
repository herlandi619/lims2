<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'kode_tiket',
        'user_id',
        'peminjaman_id',
        'alat_id',
        'ruangan_id',
        'kategori',
        'subjek',
        'deskripsi',
        'lampiran_foto',
        'prioritas',
        'status',
        'assigned_to',
        'catatan_penyelesaian',
    ];

    public function pelapor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function alat()
    {
        return $this->belongsTo(Alat::class, 'alat_id');
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    public function balasan()
    {
        return $this->hasMany(TicketReply::class, 'ticket_id');
    }
}