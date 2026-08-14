<?php

namespace App\Http\Controllers\Kepala;


use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\BookingRuangan;
use App\Models\MaintenanceAlat;
use App\Models\KalibrasiAlat;
use App\Models\RiwayatAlat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KepalaDashboardStatistikController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. Ringkasan Angka (Summary Cards)
        $summary = [
            'total_inventaris'  => Alat::sum('jumlah_stok'),
            'total_peminjaman'  => Peminjaman::whereIn('status', ['menunggu', 'disetujui', 'dipinjam'])->count(),
            'total_booking'     => BookingRuangan::whereIn('status', ['menunggu', 'disetujui'])->count(),
            'total_maintenance' => MaintenanceAlat::where('status', 'proses')->count(),
            'total_kalibrasi'   => KalibrasiAlat::count(),
        ];

        // 2. Statistik 1: Top 5 Alat Paling Sering Dipinjam
        $topPinjam = DB::table('detail_peminjaman')
            ->join('alat', 'detail_peminjaman.alat_id', '=', 'alat.id')
            ->select('alat.nama_alat', DB::raw('SUM(detail_peminjaman.jumlah) as total_dipinjam'))
            ->groupBy('alat.id', 'alat.nama_alat')
            ->orderByDesc('total_dipinjam')
            ->limit(5)
            ->get();

        // 3. Statistik 2: Top 5 Alat Paling Sering Rusak/Maintenance
        $topRusak = MaintenanceAlat::join('alat', 'maintenance_alat.alat_id', '=', 'alat.id')
            ->select('alat.nama_alat', DB::raw('COUNT(maintenance_alat.id) as total_maintenance'))
            ->groupBy('alat.id', 'alat.nama_alat')
            ->orderByDesc('total_maintenance')
            ->limit(5)
            ->get();

        // 4. Statistik 3: Laboratorium / Ruangan Paling Sibuk
        $labSibuk = BookingRuangan::join('ruangan', 'booking_ruangan.ruangan_id', '=', 'ruangan.id')
            ->select('ruangan.nama_ruangan', DB::raw('COUNT(booking_ruangan.id) as total_booking'))
            ->groupBy('ruangan.id', 'ruangan.nama_ruangan')
            ->orderByDesc('total_booking')
            ->limit(5)
            ->get();

        // 5. Tabel Audit Log Riwayat Alat (Search & Paginate 5)
        $riwayat = RiwayatAlat::with(['alat', 'user'])
            ->when($search, function ($query, $search) {
                $query->where('aktivitas', 'like', "%{$search}%")
                      ->orWhereHas('alat', function ($q) use ($search) {
                          $q->where('nama_alat', 'like', "%{$search}%");
                      })
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('KepalaLaboran/Dashboard/Index', [
            'summary'   => $summary,
            'topPinjam' => $topPinjam,
            'topRusak'  => $topRusak,
            'labSibuk'  => $labSibuk,
            'riwayat'   => $riwayat,
            'filters'   => ['search' => $search],
        ]);
    }
}