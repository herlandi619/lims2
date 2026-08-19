<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KepalaMonitoringJadwalController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Query data jadwal dengan relasi, pencarian, dan paginate 5
        $jadwal = JadwalLaboratorium::with(['ruangan', 'dosen'])
            ->when($search, function ($query, $search) {
                $query->where('mata_kuliah', 'like', "%{$search}%")
                      ->orWhere('kelas', 'like', "%{$search}%")
                      ->orWhere('hari', 'like', "%{$search}%")
                      ->orWhereHas('ruangan', function ($q) use ($search) {
                          $q->where('nama_ruangan', 'like', "%{$search}%");
                      })
                      ->orWhereHas('dosen', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // Data tambahan untuk analisis utilisasi (contoh: Total Jadwal & Total Ruangan Aktif)
        $statistik = [
            'total_jadwal' => JadwalLaboratorium::count(),
            'total_ruangan_terpakai' => JadwalLaboratorium::distinct('ruangan_id')->count('ruangan_id'),
            'total_ruangan_tersedia' => Ruangan::count(),
        ];

        return Inertia::render('KepalaLaboran/MonitoringJadwal/Index', [
            'jadwal' => $jadwal,
            'statistik' => $statistik,
            'filters' => $request->only(['search']),
        ]);
    }

    public function cetakLaporan(Request $request)
    {
        $jadwal = JadwalLaboratorium::with(['ruangan', 'dosen'])->latest()->get();

        // Opsi A: Jika ingin mengunduh atau merender halaman cetak HTML khusus
        return view('kepala.monitoring.cetak', [
            'jadwal' => $jadwal,
            'tanggal' => now()->format('d-m-Y')
        ]);

        // Opsi B: Jika menggunakan package PDF (seperti barryvdh/laravel-dompdf):
        // $pdf = \PDF::loadView('pdf.laporan-utilisasi', compact('jadwal'));
        // return $pdf->download('laporan-utilisasi-lab.pdf');
    }
}