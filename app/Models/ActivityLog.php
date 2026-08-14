<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $guarded = [];

    protected $table = 'activity_logs';

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
