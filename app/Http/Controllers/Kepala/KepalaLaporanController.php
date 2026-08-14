<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\BookingRuangan;
use App\Models\MaintenanceAlat;
use App\Models\KalibrasiAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class KepalaLaporanController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'peminjaman');

        // 1. Rekap Peminjaman Alat
        $peminjamanList = Peminjaman::with('user')
            ->when($request->search_peminjaman, function ($q, $search) {
                $q->where('kode_peminjaman', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'peminjaman_page')
            ->withQueryString();

        // 2. Rekap Booking Ruangan
        $bookingList = BookingRuangan::with(['user', 'ruangan'])
            ->when($request->search_booking, function ($q, $search) {
                $q->where('keperluan', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('ruangan', fn($r) => $r->where('nama_ruangan', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'booking_page')
            ->withQueryString();

        // 3. Rekap Maintenance Alat
        $maintenanceList = MaintenanceAlat::with('alat')
            ->when($request->search_maintenance, function ($q, $search) {
                $q->where('teknisi', 'like', "%{$search}%")
                  ->orWhere('jenis', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%")
                  ->orWhereHas('alat', fn($a) => $a->where('nama_alat', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'maintenance_page')
            ->withQueryString();

        // 4. Rekap Kalibrasi Alat
        $kalibrasiList = KalibrasiAlat::with('alat')
            ->when($request->search_kalibrasi, function ($q, $search) {
                $q->where('hasil', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('alat', fn($a) => $a->where('nama_alat', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'kalibrasi_page')
            ->withQueryString();

        return Inertia::render('KepalaLaboran/Laporan/Index', [
            'peminjamanList'  => $peminjamanList,
            'bookingList'     => $bookingList,
            'maintenanceList' => $maintenanceList,
            'kalibrasiList'   => $kalibrasiList,
            'filters'         => [
                'tab'                => $activeTab,
                'search_peminjaman'  => $request->search_peminjaman ?? '',
                'search_booking'     => $request->search_booking ?? '',
                'search_maintenance' => $request->search_maintenance ?? '',
                'search_kalibrasi'   => $request->search_kalibrasi ?? '',
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $type = $request->input('type', 'peminjaman');
        $filename = 'Laporan_' . ucfirst($type) . '_' . date('Y-m-d') . '.pdf';

        switch ($type) {
            case 'booking':
                $data = BookingRuangan::with(['user', 'ruangan'])->latest()->get();
                $pdf = Pdf::loadView('pdf.laporan-booking', ['data' => $data]);
                break;

            case 'maintenance':
                $data = MaintenanceAlat::with('alat')->latest()->get();
                $pdf = Pdf::loadView('pdf.laporan-maintenance', ['data' => $data]);
                break;

            case 'kalibrasi':
                $data = KalibrasiAlat::with('alat')->latest()->get();
                $pdf = Pdf::loadView('pdf.laporan-kalibrasi', ['data' => $data]);
                break;

            case 'peminjaman':
            default:
                $data = Peminjaman::with('user')->latest()->get();
                $pdf = Pdf::loadView('pdf.laporan-peminjaman', ['data' => $data]);
                break;
        }

        // Atur ukuran kertas dan orientasi (A4 Landscape agar muat banyak kolom)
        $pdf->setPaper('a4', 'landscape');

        // Mengunduh langsung berkas PDF
        return $pdf->download($filename);
    }
}