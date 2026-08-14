<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\BookingRuangan;
use App\Models\MaintenanceAlat;
use App\Models\KalibrasiAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KepalaMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. Monitoring Inventaris (Seluruh Alat)
        $alat = Alat::with(['kategori', 'lokasi', 'supplier'])
            ->when($search, function ($query, $search) {
                $query->where('nama_alat', 'like', "%{$search}%")
                      ->orWhere('kode_alat', 'like', "%{$search}%")
                      ->orWhere('merk', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'page_alat')
            ->withQueryString();

        // 2. Monitoring Aktivitas: Peminjaman Alat
        $peminjaman = Peminjaman::with(['user'])
            ->when($search, function ($query, $search) {
                $query->where('kode_peminjaman', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5, ['*'], 'page_peminjaman')
            ->withQueryString();

        // 3. Monitoring Aktivitas: Booking Ruangan
        $booking = BookingRuangan::with(['user', 'ruangan'])
            ->when($search, function ($query, $search) {
                $query->whereHas('ruangan', function ($q) use ($search) {
                    $q->where('nama_ruangan', 'like', "%{$search}%");
                })->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(5, ['*'], 'page_booking')
            ->withQueryString();

        // 4. Monitoring Aktivitas: Maintenance Alat
        $maintenance = MaintenanceAlat::with(['alat'])
            ->when($search, function ($query, $search) {
                $query->whereHas('alat', function ($q) use ($search) {
                    $q->where('nama_alat', 'like', "%{$search}%");
                })->orWhere('teknisi', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'page_maint')
            ->withQueryString();

        // 5. Monitoring Aktivitas: Kalibrasi Alat
        $kalibrasi = KalibrasiAlat::with(['alat'])
            ->when($search, function ($query, $search) {
                $query->whereHas('alat', function ($q) use ($search) {
                    $q->where('nama_alat', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(5, ['*'], 'page_kalibrasi')
            ->withQueryString();

        return Inertia::render('KepalaLaboran/Monitoring/Index', [
            'alat'        => $alat,
            'peminjaman'  => $peminjaman,
            'booking'     => $booking,
            'maintenance' => $maintenance,
            'kalibrasi'   => $kalibrasi,
            'filters'     => ['search' => $search],
        ]);
    }
}
