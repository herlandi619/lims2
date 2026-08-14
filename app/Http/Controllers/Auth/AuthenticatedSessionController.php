<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\LoginNotification;




class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
//    public function store(LoginRequest $request): RedirectResponse
//     {
//         $request->authenticate();

//         $request->session()->regenerate();

//         $user = $request->user();

//         // Redirect berdasarkan role
//         if ($user->role === 'mahasiswa') {
//             return redirect()->intended(route('mahasiswa.dashboard', absolute: false));
//         }

//         if ($user->role === 'dosen') {
//             return redirect()->intended(route('dosen.dashboard', absolute: false));
//         }
//         if ($user->role === 'laboran') {
//             return redirect()->intended(route('laboran.dashboard', absolute: false));
//         }
//         if ($user->role === 'kepala_laboran') {
//             return redirect()->intended(route('kepala.dashboard', absolute: false));
//         }

//         // Redirect default jika pengguna bukan mahasiswa maupun dosen (misal: Admin)
//         return redirect()->intended(route('admin.dashboard', absolute: false));
//     }

    public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();

    $request->session()->regenerate();

    $user = $request->user();

    // Kirim notifikasi Email jika role Mahasiswa atau Dosen
    if (in_array($user->role, ['mahasiswa', 'dosen'])) {
        try {
            $user->notify(new LoginNotification());
        } catch (\Exception $e) {
            // Log error tanpa menghentikan alur redirect login
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email login: ' . $e->getMessage());
        }
    }

    // Redirect berdasarkan role
    if ($user->role === 'mahasiswa') {
        return redirect()->intended(route('mahasiswa.dashboard', absolute: false));
    }

    if ($user->role === 'dosen') {
        return redirect()->intended(route('dosen.dashboard', absolute: false));
    }

    if ($user->role === 'laboran') {
        return redirect()->intended(route('laboran.dashboard', absolute: false));
    }

    if ($user->role === 'kepala_laboran') {
        return redirect()->intended(route('kepala.dashboard', absolute: false));
    }

    return redirect()->intended(route('admin.dashboard', absolute: false));
}

    
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
