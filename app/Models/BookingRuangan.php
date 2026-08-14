<?php

namespace App\Models;

use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class BookingRuangan extends Model
{
    protected $table = 'booking_ruangan';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }
}
