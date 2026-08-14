<?php

namespace App\Models;

use App\Models\Alat;
use Illuminate\Database\Eloquent\Model;

class LokasiAlat extends Model
{
    protected $table = 'lokasi_alat';
    protected $guarded = [];
    
    public function alat()
    {
        return $this->hasMany(Alat::class);
    }
}
