<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceAlat extends Model
{   
    protected $table = 'maintenance_alat';
    protected $guarded = [];

    public function alat()
    {
        return $this->belongsTo(Alat::class);
    }
}
