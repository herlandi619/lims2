<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\KelasPraktikum;
use App\Models\PertemuanAbsensi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboranAbsensiController extends Controller
{
    // Halaman Utama Monitoring Absensi Semua Kelas
    public function index(Request $request)
    {
        $search = $request->input('search');
        $semester = $request->input('semester');

        $kelas = KelasPraktikum::with(['dosen', 'ruangan'])
            ->withCount(['pertemuan as total_pertemuan_selesai' => function ($query) {
                $query->where('status_pertemuan', 'selesai');
            }])
            ->when($search, function ($query, $search) {
                $query->where('nama_praktikum', 'like', "%{$search}%")
                      ->orWhere('kode_kelas', 'like', "%{$search}%")
                      ->orWhere('nama_kelas', 'like', "%{$search}%");
            })
            ->when($semester, function ($query, $semester) {
                $query->where('semester', $semester);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Laboran/Absensi/Index', [
            'kelas' => $kelas,
            'filters' => [
                'search' => $search,
                'semester' => $semester
            ]
        ]);
    }

    // Modal/Detail Data Map 14 Pertemuan Kelas
    public function showKelas($id)
    {
        $kelas = KelasPraktikum::with(['dosen', 'ruangan', 'pertemuan.detailAbsensi'])->findOrFail($id);

        return response()->json([
            'kelas' => $kelas
        ]);
    }

    // Detail Read-Only Lembar Absensi Spesifik
    public function showPertemuan($id)
    {
        $pertemuan = PertemuanAbsensi::with(['kelasPraktikum.dosen', 'detailAbsensi.mahasiswa'])->findOrFail($id);

        return response()->json([
            'pertemuan' => $pertemuan
        ]);
    }
}