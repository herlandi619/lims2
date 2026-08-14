<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sop extends Model
{
    protected $table = 'sops';
    protected $guarded = [];

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
