<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\AbsensiPraktikum;
use App\Models\ActivityLog;
use App\Models\Arsip;
use App\Models\BookingRuangan;
use App\Models\DetailAbsensi;
use App\Models\JadwalLaboratorium;
use App\Models\KelasMahasiswa;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\RiwayatAlat;
use App\Models\Sop;
use App\Models\Ticket;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // RELASI
     public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class);
    }

    public function bookingRuangan()
    {
        return $this->hasMany(BookingRuangan::class);
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function arsip()
    {
        return $this->hasMany(Arsip::class, 'upload_by');
    }

    public function jadwalLaboratorium()
    {
        return $this->hasMany(JadwalLaboratorium::class, 'dosen_id');
    }

    public function riwayatAlat()
    {
        return $this->hasMany(RiwayatAlat::class);
    }

    public function sop()
    {
        return $this->hasMany(Sop::class, 'created_by');
    }

    public function absensiDiampu()
    {
        return $this->hasMany(AbsensiPraktikum::class, 'dosen_id');
    }

    public function detailAbsensi()
    {
        return $this->hasMany(DetailAbsensi::class, 'mahasiswa_id');
    }

    public function kelasPraktikum()
    {
        return $this->hasMany(KelasMahasiswa::class, 'mahasiswa_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    // Jika user adalah Dosen
    public function jadwalMengajar() {
        return $this->hasMany(JadwalLaboratorium::class, 'dosen_id');
    }

    // Jika user adalah Mahasiswa
    public function jadwalKuliah() {
        return $this->belongsToMany(JadwalLaboratorium::class, 'krs_mahasiswa', 'user_id', 'jadwal_laboratorium_id');
    }

}
