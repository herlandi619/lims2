<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\DetailPeminjaman;
use App\Models\RiwayatAlat;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MahasiswaPengembalianController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Menampilkan daftar transaksi yang aktif dipinjam atau sedang diproses pengembaliannya
        $peminjamanAktif = Peminjaman::with(['details.alat'])
            ->where('user_id', auth()->id())
            ->whereIn('status', ['dipinjam', 'menunggu_verifikasi_kembali', 'dikembalikan'])
            ->when($search, function ($query, $search) {
                $query->where('kode_peminjaman', 'like', "%{$search}%")
                      ->orWhereHas('details.alat', function ($q) use ($search) {
                          $q->where('nama_alat', 'like', "%{$search}%")
                            ->orWhere('kode_alat', 'like', "%{$search}%")
                            ->orWhere('qr_code', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Mahasiswa/Pengembalian/Index', [
            'peminjamanAktif' => $peminjamanAktif,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'foto_pengembalian' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'kondisi_sesudah' => 'required|in:baik,cukup,rusak',
            'catatan' => 'nullable|string|max:500',
        ]);

        $peminjaman = Peminjaman::where('user_id', auth()->id())
            ->where('status', 'dipinjam')
            ->findOrFail($id);

        try {
            DB::transaction(function () use ($peminjaman, $request) {
                // Upload foto pengembalian ke storage public
                $fotoPath = $request->file('foto_pengembalian')->store('pengembalian', 'public');

                // Update status transaksi ke 'menunggu_verifikasi_kembali' (Menunggu Laboran Verifikasi)
                $peminjaman->update([
                    'status' => 'menunggu_verifikasi_kembali',
                    'tanggal_kembali' => now(),
                ]);

                // Update detail peminjaman & catat ke riwayat_alat
                foreach ($peminjaman->details as $detail) {
                    $detail->update([
                        'kondisi_sesudah' => $request->kondisi_sesudah,
                        'foto_pengembalian' => $fotoPath,
                    ]);

                    // Catat audit trail penggunaan pada riwayat_alat
                    RiwayatAlat::create([
                        'alat_id' => $detail->alat_id,
                        'user_id' => auth()->id(),
                        'aktivitas' => 'Pengajuan Pengembalian',
                        'keterangan' => "Mahasiswa mengembalikan alat ({$peminjaman->kode_peminjaman}). Kondisi dicatat: {$request->kondisi_sesudah}. Catatan: " . ($request->catatan ?? '-'),
                    ]);
                }

                // Log Aktivitas Sistem
                ActivityLog::create([
                    'user_id' => auth()->id(),
                    'aktivitas' => "Mengajukan pengembalian alat untuk kode peminjaman {$peminjaman->kode_peminjaman}",
                    'ip_address' => $request->ip(),
                    'browser' => $request->userAgent(),
                ]);
            });

            return back()->with('success', 'Pengembalian berhasil diajukan! Silakan serahkan alat ke Laboran untuk verifikasi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memproses pengembalian: ' . $e->getMessage());
        }
    }
}