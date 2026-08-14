<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notifikasi; // <-- Pastikan Model Notifikasi di-import di sini

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // 1. Ambil data user yang sedang diidentifikasi oleh sistem/session
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    // Ambil NIM langsung dari kolom `nim` di tabel users, 
                    // atau dari relasi `mahasiswa` jika NIM disimpan di tabel terpisah.
                    'nim'   => $user->nim ?? $user->mahasiswa?->nim ?? '-', 
                    'nip'   => $user->nip ?? $user->dosen?->nip ?? '-', 
                ] : null,
            ],

            'flash' => [
                'success'       => fn () => $request->session()->get('success'),
                'error'         => fn () => $request->session()->get('error'),
                'download_file' => fn () => $request->session()->get('download_file'),
            ],

            // 2. Tambahkan Data Notifikasi Global
            // ...
            'notifications' => fn () => $user 
                ? Notifikasi::where('user_id', $user->id)->latest()->take(10)->get() 
                : [],

            'unreadNotificationCount' => fn () => $user 
                ? Notifikasi::where('user_id', $user->id)->where('sudah_dibaca', false)->count() 
                : 0,
            // ...
        ];
    }
}