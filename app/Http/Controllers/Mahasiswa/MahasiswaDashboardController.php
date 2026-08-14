<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Peminjaman;
use App\Models\BookingRuangan;
use App\Models\JadwalLaboratorium;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class MahasiswaDashboardController extends Controller
{ 
    /**
     * Tampilkan halaman Dashboard Mahasiswa.
     */
    public function index(Request $request): Response
    {
        $userId = Auth::id();
        $todayDate = Carbon::today()->toDateString();
        $search = $request->input('search');

        $hariIni = Carbon::now()->locale('id')->isoFormat('dddd');

        // --- REKAM ACTIVITY LOG ---
        ActivityLog::create([
            'user_id'    => $userId,
            'aktivitas'  => 'Membuka halaman dashboard mahasiswa',
            'ip_address' => $request->ip(),
            'browser'    => $request->userAgent(),
        ]);

        // 1. Jumlah Alat yang Sedang Dipinjam
        $jumlahDipinjam = Peminjaman::where('user_id', $userId)
            ->where('status', 'dipinjam')
            ->count();

        // 2. Jumlah Booking Ruangan Aktif
        $jumlahBookingAktif = BookingRuangan::where('user_id', $userId)
            ->whereIn('status', ['pending', 'disetujui'])
            ->where('tanggal', '>=', $todayDate)
            ->count();

        // 3. TOTAL DENDA BELUM DIBAYAR (TAMBAHAN BARU)
        // Menghitung jumlah denda dari peminjaman yang status dendanya belum dibayar
        // $totalDenda = Peminjaman::where('user_id', $userId)
        //     ->where('status_pembayaran_denda', 'belum_dibayar') // Sesuaikan nama kolom & valuenya
        //     ->sum('denda'); // Sesuaikan nama kolom nominal denda (contoh: denda / nominal_denda)

        // 3. TOTAL DENDA BELUM DIBAYAR (Solusi)
        // 3. TOTAL DENDA BELUM DIBAYAR (Solusi yang benar)
        $totalDenda = Peminjaman::where('user_id', $userId)
            ->where('status_denda', 'belum_dibayar')
            ->sum('total_denda');

        // Ambil semua data peminjaman user beserta denda untuk di-cek
        // $cekDenda = Peminjaman::where('user_id', $userId)->get(['id', 'denda', 'status_pembayaran_denda']);
        // dd($cekDenda); // Ini akan menghentikan halaman dan menampilkan data


        // 4. Jadwal Praktikum Hari Ini
        $jadwalHariIni = JadwalLaboratorium::with(['ruangan'])
            ->where(function ($q) use ($hariIni) {
                if (strtolower($hariIni) === 'jumat') {
                    $q->whereIn('hari', ['Jumat', "Jum'at", 'jumat', "jum'at"]);
                } else {
                    $q->whereRaw('LOWER(hari) = ?', [strtolower($hariIni)]);
                }
            })
            ->get();

        // 5. Notifikasi Terbaru
        $notifikasiTerbaru = Notifikasi::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        // 6. Tabel Riwayat Peminjaman Terakhir
        $riwayatPeminjaman = Peminjaman::with(['details.alat'])
            ->where('user_id', $userId)
            ->when($search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('kode_peminjaman', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('details.alat', function ($q) use ($search) {
                            $q->where('nama_alat', 'like', "%{$search}%")
                              ->orWhere('kode_alat', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Mahasiswa/Dashboard/Index', [
            'metrics' => [
                'jumlahDipinjam'     => $jumlahDipinjam,
                'jumlahBookingAktif' => $jumlahBookingAktif,
                'totalDenda'         => $totalDenda, // <-- Dikirim ke frontend
            ],
            'hariIni'           => $hariIni,
            'jadwalHariIni'     => $jadwalHariIni,
            'notifikasiTerbaru' => $notifikasiTerbaru,
            'riwayatPeminjaman' => $riwayatPeminjaman,
            'filters'           => [
                'search' => $search,
            ],
        ]);
    }
}