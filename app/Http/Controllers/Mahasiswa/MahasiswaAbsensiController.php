<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\KelasPraktikum;
use App\Models\DetailAbsensi;
use Illuminate\Http\Request;
use Inertia\Inertia; 

class MahasiswaAbsensiController extends Controller
{
    // Halaman Utama Monitoring Absensi Mahasiswa
    public function index(Request $request)
{
    $mahasiswaId = auth()->id();

    // Ambil HANYA kelas praktikum yang benar-benar diikuti oleh mahasiswa login
    // Berdasarkan relasi ke tabel pertemuan -> detail_absensi milik mahasiswa tersebut
    $kelas = KelasPraktikum::with(['dosen', 'ruangan'])
        ->whereHas('pertemuan.detailAbsensi', function ($query) use ($mahasiswaId) {
            $query->where('mahasiswa_id', $mahasiswaId);
        })
        ->get()
        ->map(function ($item) use ($mahasiswaId) {
            // Hitung rekap statistik kehadiran pribadi
            $absensiPribadi = DetailAbsensi::whereHas('pertemuan', function ($q) use ($item) {
                $q->where('kelas_praktikum_id', $item->id);
            })->where('mahasiswa_id', $mahasiswaId)->get();

            $totalHadir = $absensiPribadi->where('status_kehadiran', 'hadir')->count();
            $totalIzin  = $absensiPribadi->where('status_kehadiran', 'izin')->count();
            $totalSakit = $absensiPribadi->where('status_kehadiran', 'sakit')->count();
            $totalAlpa  = $absensiPribadi->where('status_kehadiran', 'alpa')->count();
            $totalPertemuan = $absensiPribadi->count();

            $persentase = $totalPertemuan > 0 
                ? round(($totalHadir / 14) * 100, 1) 
                : 0;

            $item->rekap_pribadi = [
                'hadir' => $totalHadir,
                'izin'  => $totalIzin,
                'sakit' => $totalSakit,
                'alpa'  => $totalAlpa,
                'persentase' => $persentase,
            ];

            return $item;
        });

    return Inertia::render('Mahasiswa/Absensi/Index', [
        'kelas' => $kelas
    ]);
}

    // Detail 14 Pertemuan beserta Status Kehadiran Pribadi Mahasiswa
    public function showKelas($id)
    {
        $mahasiswaId = auth()->id();

        $kelas = KelasPraktikum::with(['dosen', 'ruangan', 'pertemuan' => function ($q) {
            $q->orderBy('pertemuan_ke', 'asc');
        }])->findOrFail($id);

        // Ambil record detail absensi mahasiswa ini pada kelas tersebut
        $detailAbsensi = DetailAbsensi::whereHas('pertemuan', function ($q) use ($id) {
            $q->where('kelas_praktikum_id', $id);
        })
        ->where('mahasiswa_id', $mahasiswaId)
        ->get()
        ->keyBy('pertemuan_absensi_id');

        // Gabungkan status kehadiran ke tiap lembar pertemuan
        $pertemuanList = $kelas->pertemuan->map(function ($ptm) use ($detailAbsensi) {
            $detail = $detailAbsensi->get($ptm->id);

            return [
                'id' => $ptm->id,
                'pertemuan_ke' => $ptm->pertemuan_ke,
                'tanggal_praktik' => $ptm->tanggal_praktik,
                'topik_materi' => $ptm->topik_materi,
                'status_pertemuan' => $ptm->status_pertemuan,
                'status_kehadiran' => $detail ? $detail->status_kehadiran : 'belum_absen',
                'waktu_presensi' => $detail ? $detail->waktu_presensi : null,
                'keterangan' => $detail ? $detail->keterangan : null,
            ];
        });

        return response()->json([
            'kelas' => $kelas,
            'pertemuan_list' => $pertemuanList
        ]);
    }
}