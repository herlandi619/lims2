<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class MahasiswaProfilController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // --- REKAM ACTIVITY LOG (Membuka Halaman Profil) ---
        ActivityLog::create([
            'user_id'   => $user->id,
            'aktivitas' => 'Membuka halaman profil mahasiswa',
            'ip_address' => $request->ip(),
            'browser'   => $request->userAgent(),
        ]);

        return Inertia::render('Mahasiswa/Profil/Index', [
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'nim'        => $user->nim ?? '-',
                'no_hp'      => $user->no_hp ?? '-',
                'foto'       => $user->foto ? asset('storage/' . $user->foto) : null,
                'created_at' => $user->created_at->format('d M Y'),
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'nim'   => 'nullable|string|max:50|unique:users,nim,' . $user->id,
            'no_hp' => 'nullable|string|max:20',
            'foto'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        try {
            DB::transaction(function () use ($request, $user) {
                $fotoPath = $user->foto;

                if ($request->hasFile('foto')) {
                    if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                        Storage::disk('public')->delete($user->foto);
                    }
                    $fotoPath = $request->file('foto')->store('avatars', 'public');
                }

                // 1. Update Profile User
                $user->update([
                    'name'  => $request->name,
                    'email' => $request->email,
                    'nim'   => $request->nim,
                    'no_hp' => $request->no_hp,
                    'foto'  => $fotoPath,
                ]);

                // 2. Catat Activity Log
                ActivityLog::create([
                    'user_id'   => $user->id,
                    'aktivitas' => 'Perbarui data profil pribadi',
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => $user->id,
                    'judul'        => 'Pembaruan Profil',
                    'isi'          => 'Data profil Anda telah berhasil diperbarui.',
                    'sudah_dibaca' => false,
                ]);
            });

            return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui profil: ' . $e->getMessage());
        }
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        try {
            DB::transaction(function () use ($request, $user) {
                // 1. Update Password
                $user->update([
                    'password' => Hash::make($request->password),
                ]);

                // 2. Catat Activity Log
                ActivityLog::create([
                    'user_id'   => $user->id,
                    'aktivitas' => 'Mengubah password akun',
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => $user->id,
                    'judul'        => 'Keamanan Akun',
                    'isi'          => 'Password akun Anda telah berhasil diubah. Jika bukan Anda yang melakukan perubahan ini, segera hubungi admin.',
                    'sudah_dibaca' => false,
                ]);
            });

            return redirect()->back()->with('success', 'Password berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengubah password: ' . $e->getMessage());
        }
    }
}