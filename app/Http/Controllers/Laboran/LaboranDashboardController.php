<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\MaintenanceAlat;
use App\Models\KalibrasiAlat;
use App\Models\BookingRuangan;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LaboranDashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $today = Carbon::today()->toDateString();

        // 1. Ringkasan Statistik
        $totalAlat = Alat::sum('jumlah_stok');
        $alatRusak = Alat::where('kondisi', 'rusak')->orWhere('status', 'rusak')->count();
        $totalMaintenance = MaintenanceAlat::where('status', 'proses')->count();
        $totalKalibrasi = KalibrasiAlat::whereDate('kalibrasi_berikutnya', '>=', $today)->count();
        $bookingHariIni = BookingRuangan::whereDate('tanggal', $today)->count();
        $peminjamanAktif = Peminjaman::whereIn('status', ['disetujui', 'dipinjam'])->count();

        // 2. Data Tabel Peminjaman Terbaru (Paginate 5 Data)
        $peminjamanTerbaru = Peminjaman::with('user')
            ->when($search, function ($query, $search) {
                $query->where('kode_peminjaman', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // 3. Data Booking Hari Ini
        $listBookingHariIni = BookingRuangan::with(['user', 'ruangan'])
            ->whereDate('tanggal', $today)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Laboran/Dashboard/Index', [
            'stats' => [
                'total_alat' => $totalAlat,
                'alat_rusak' => $alatRusak,
                'maintenance' => $totalMaintenance,
                'kalibrasi' => $totalKalibrasi,
                'booking_hari_ini' => $bookingHariIni,
                'peminjaman_aktif' => $peminjamanAktif,
            ],
            'peminjamanTerbaru' => $peminjamanTerbaru,
            'bookingHariIni' => $listBookingHariIni,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}