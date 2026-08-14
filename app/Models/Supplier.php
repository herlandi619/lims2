<?php

namespace App\Models;

use App\Models\Alat;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    
    protected $table = 'supplier';

    protected $guarded = [];


    public function alat()
    {
        return $this->hasMany(Alat::class);
    }
}
