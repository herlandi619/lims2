<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arsip extends Model
{
    protected $table = 'arsip';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'upload_by');
    }
    
}
