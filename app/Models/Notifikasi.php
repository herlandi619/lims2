<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';

    protected $guarded = [];

    protected $casts = [
        'sudah_dibaca' => 'boolean',
    ];

    public function user()
    {
        return $table->belongsTo(User::class);
    }
}