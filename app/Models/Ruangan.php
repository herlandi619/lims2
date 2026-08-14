<?php

namespace App\Models;

use App\Models\BookingRuangan;
use App\Models\JadwalLaboratorium;
use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{   
    protected $table = 'ruangan';
    protected $guarded = [];

    public function bookingRuangan()
    {
        return $this->hasMany(BookingRuangan::class);
    }

    public function jadwalLaboratorium()
    {
        return $this->hasMany(JadwalLaboratorium::class);
    }
}
