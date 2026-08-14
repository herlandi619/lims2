<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Tandai 1 notifikasi spesifik sebagai sudah dibaca
     */
    public function markAsRead($id)
    {
        $notif = Notifikasi::where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if ($notif) {
            $notif->update(['sudah_dibaca' => true]);
        }

        return back();
    }

    /**
     * Tandai SEMUA notifikasi milik user sebagai sudah dibaca
     */
    public function markAllRead()
    {
        Notifikasi::where('user_id', auth()->id())
            ->where('sudah_dibaca', false)
            ->update(['sudah_dibaca' => true]);

        return back();
    }
}