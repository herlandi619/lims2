<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\DetailPeminjaman;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
 
class MahasiswaPeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Query Peminjaman milik Mahasiswa yang login beserta detail & alat
        $query = Peminjaman::with(['details.alat', 'user'])
            ->where('user_id', $user->id);

        // Search berdasarkan kode peminjaman atau nama alat di detail
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('kode_peminjaman', 'like', '%' . $request->search . '%')
                  ->orWhereHas('details.alat', function ($qAlat) use ($request) {
                      $qAlat->where('nama_alat', 'like', '%' . $request->search . '%')
                            ->orWhere('kode_alat', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Paginate 5 Data
        $peminjaman = $query->latest()->paginate(5)->withQueryString();

        // Ambil daftar alat yang tersedia
        $daftarAlat = Alat::where('status', 'tersedia')
            ->where('stok_tersedia', '>', 0)
            ->select('id', 'nama_alat', 'kode_alat', 'stok_tersedia')
            ->get();

        $selectedAlatId = $request->alat_id ?? null;

        // --- REKAM ACTIVITY LOG (Membuka Halaman Index Mahasiswa) ---
        ActivityLog::create([
            'user_id'   => $user->id,
            'aktivitas' => $request->search 
                ? "Melihat halaman daftar peminjaman alat dengan pencarian '{$request->search}'" 
                : "Membuka halaman daftar peminjaman alat",
            'ip_address' => $request->ip(),
            'browser'   => $request->userAgent(),
        ]);

        return Inertia::render('Mahasiswa/Peminjaman/Index', [
            'peminjaman' => $peminjaman,
            'daftarAlat' => $daftarAlat,
            'selectedAlatId' => $selectedAlatId,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'alat_id'                 => 'required|exists:alat,id',
            'jumlah'                  => 'required|integer|min:1',
            'tanggal_pinjam'          => 'required|date',
            'tanggal_rencana_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'keperluan'               => 'required|string|max:255',
        ]);

        $alat = Alat::findOrFail($request->alat_id);

        // Validasi ketersediaan stok
        if ($request->jumlah > $alat->stok_tersedia) {
            return back()->withErrors([
                'jumlah' => "Jumlah melebihi stok yang tersedia ({$alat->stok_tersedia} unit)."
            ])->with('error', "Jumlah melebihi stok yang tersedia ({$alat->stok_tersedia} unit).");
        }

        try {
            // Simpan transaksi menggunakan DB Transaction
            DB::transaction(function () use ($request, $alat) {
                $userMahasiswa = $request->user();

                // 1. Simpan Header Peminjaman
                $peminjaman = Peminjaman::create([
                    'user_id'                 => $userMahasiswa->id,
                    'kode_peminjaman'         => 'TRX-' . time() . rand(10, 99),
                    'tanggal_pinjam'          => $request->tanggal_pinjam,
                    'tanggal_rencana_kembali' => $request->tanggal_rencana_kembali,
                    'keperluan'               => $request->keperluan,
                    'status'                  => 'menunggu',
                ]);

                // 2. Simpan Detail Peminjaman
                DetailPeminjaman::create([
                    'peminjaman_id'   => $peminjaman->id,
                    'alat_id'        => $request->alat_id,
                    'jumlah'         => $request->jumlah,
                    'kondisi_sebelum' => $alat->kondisi ?? 'baik',
                ]);

                // 3. Catat Log Aktivitas (Activity Logs)
                ActivityLog::create([
                    'user_id'   => $userMahasiswa->id,
                    'aktivitas' => "Mengajukan peminjaman alat '{$alat->nama_alat}' sejumlah {$request->jumlah} unit (Kode: {$peminjaman->kode_peminjaman})",
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 4. Kirim Notifikasi ke Mahasiswa (Konfirmasi Pengajuan)
                Notifikasi::create([
                    'user_id'      => $userMahasiswa->id,
                    'judul'        => 'Pengajuan Peminjaman Alat',
                    'isi'          => "Pengajuan peminjaman alat '{$alat->nama_alat}' sebanyak {$request->jumlah} unit ({$peminjaman->kode_peminjaman}) berhasil dikirim. Silakan tunggu verifikasi laboran.",
                    'sudah_dibaca' => false,
                ]);

                // 5. Kirim Notifikasi ke Seluruh Laboran
                // Menggunakan LOWER(role) agar aman dari kapitalisasi huruf
                $laborans = User::whereRaw('LOWER(role) = ?', ['laboran'])->get();

                foreach ($laborans as $laboran) {
                    Notifikasi::create([
                        'user_id'      => $laboran->id,
                        'judul'        => 'Pengajuan Peminjaman Baru',
                        'isi'          => "{$userMahasiswa->name} mengajukan peminjaman '{$alat->nama_alat}' sebanyak {$request->jumlah} unit (Kode: {$peminjaman->kode_peminjaman}).",
                        'sudah_dibaca' => false,
                    ]);
                }

            });

            return redirect()->route('mahasiswa.peminjaman.index')
                ->with('success', 'Pengajuan peminjaman alat berhasil dibuat!');

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengajukan peminjaman: ' . $e->getMessage());
        }
    }
}