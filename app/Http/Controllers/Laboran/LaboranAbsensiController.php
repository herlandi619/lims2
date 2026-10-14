<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\DetailAbsensi;
use App\Models\KelasPraktikum;
use App\Models\PertemuanAbsensi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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

    
    // Simpan/Batch Update Absensi, Berita Acara & Absen Fisik
    public function simpanAbsensi(Request $request, $id)
    {
        $pertemuan = PertemuanAbsensi::findOrFail($id);

        $request->validate([
            'topik_materi' => 'required|string',
            'tanggal_praktik' => 'required|date',
            'berita_acara' => 'required|string', // Wajib isi berita acara
            'file_absen_fisik' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048', // File upload
            'absensi' => 'required|array',
            'absensi.*.mahasiswa_id' => 'required|exists:users,id',
            'absensi.*.status_kehadiran' => 'required|in:hadir,izin,sakit,alpa',
        ]);

        DB::transaction(function () use ($request, $pertemuan) {
            $dataUpdate = [
                'topik_materi' => $request->topik_materi,
                'tanggal_praktik' => $request->tanggal_praktik,
                'berita_acara' => $request->berita_acara,
                'status_pertemuan' => 'selesai',
            ];

            // Proses upload absen fisik jika dosen mengunggah file baru
            if ($request->hasFile('file_absen_fisik')) {
                $dataUpdate['file_absen_fisik'] = $request->file('file_absen_fisik')->store('absensi_fisik', 'public');
            }

            $pertemuan->update($dataUpdate);

            foreach ($request->absensi as $item) {
                DetailAbsensi::updateOrCreate(
                    [
                        'pertemuan_absensi_id' => $pertemuan->id,
                        'mahasiswa_id' => $item['mahasiswa_id'],
                    ],
                    [
                        'status_kehadiran' => $item['status_kehadiran'],
                        'keterangan' => $item['keterangan'] ?? null,
                        'waktu_presensi' => now(),
                    ]
                );
            }
        });

        return redirect()->back()->with('success', "Lembar pertemuan ke-{$pertemuan->pertemuan_ke} beserta Berita Acara berhasil disimpan.");
    }

    public function exportBeritaAcara(Request $request)
    {
        $semester = $request->input('semester');
        $kelasId = $request->input('kelas_id'); // Tangkap kelas_id dari modal

        $query = KelasPraktikum::with(['dosen', 'pertemuan' => function ($q) {
            $q->where('status_pertemuan', 'selesai')->orderBy('pertemuan_ke', 'asc');
        }]);

        // Jika dipanggil dari tombol filter luar (Global per Semester)
        if ($semester) {
            $query->where('semester', $semester);
        }
        
        // Jika dipanggil dari tombol di dalam modal (Spesifik 1 Kelas)
        if ($kelasId) {
            $query->where('id', $kelasId);
        }

        $kelas = $query->get();

        $pdf = Pdf::loadView('pdf.rekap-berita-acara', [
            'kelas' => $kelas,
            'semester' => $semester // akan null jika cetak dari modal, tidak masalah
        ])->setPaper('a4', 'landscape');

        // Penamaan file dinamis
        $namaFile = $kelasId 
            ? "Rekap-Berita-Acara-" . str_replace(' ', '-', $kelas->first()->nama_praktikum) . ".pdf" 
            : ($semester ? "Rekap-Berita-Acara-Semester-{$semester}.pdf" : "Rekap-Berita-Acara-Seluruh.pdf");

        return $pdf->download($namaFile);
    }
}