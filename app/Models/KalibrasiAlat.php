<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KalibrasiAlat extends Model
{   
    protected $table = 'kalibrasi_alat';
    protected $guarded = [];

    public function alat()
    {
        return $this->belongsTo(Alat::class);
    }
}
