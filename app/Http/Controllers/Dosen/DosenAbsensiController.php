<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\KelasPraktikum;
use App\Models\PertemuanAbsensi;
use App\Models\DetailAbsensi;
use App\Models\User;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
  
class DosenAbsensiController extends Controller
{ 
    public function index(Request $request)
{
    $search = $request->input('search');
    $semester = $request->input('semester');

    // Mengambil ID Dosen / User yang sedang login
    $user = Auth::user(); 

    $kelas = KelasPraktikum::with(['dosen', 'ruangan', 'pertemuan'])
        ->withCount('pertemuan')
        // 🔒 FILTER UTAMA: Hanya ambil kelas milik dosen yang login
        // Kasus 1: Jika kolom 'dosen_id' langsung menyimpan ID User/Dosen
        ->where('dosen_id', $user->id)
        
        /* 
        // Kasus 2: Jika 'dosen_id' merujuk ke tabel 'dosens' (di mana user_id ada di tabel dosens):
        ->whereHas('dosen', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        */

        ->when($search, function ($query, $search) {
            // Membungkus kondisi OR ke dalam sub-query agar tidak merusak filter dosen_id
            $query->where(function ($q) use ($search) {
                $q->where('nama_praktikum', 'like', "%{$search}%")
                  ->orWhere('kode_kelas', 'like', "%{$search}%")
                  ->orWhere('nama_kelas', 'like', "%{$search}%");
            });
        })
        ->when($semester, function ($query, $semester) {
            $query->where('semester', $semester);
        })
        ->latest()
        ->paginate(5)
        ->withQueryString();

    return Inertia::render('Dosen/Absensi/Index', [
        'kelas' => $kelas,
        'filters' => [
            'search' => $search,
            'semester' => $semester
        ]
    ]);
}
    // Membuat Kelas Baru + Otomatis Membuat 14 Lembar Pertemuan
    public function storeKelas(Request $request)
    {
        $request->validate([
            'kode_kelas' => 'required|string|unique:kelas_praktikum,kode_kelas',
            'nama_praktikum' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:7',
            'nama_kelas' => 'required|string|max:100',
            'tahun_ajaran' => 'required|string|max:20',
            'ruangan_id' => 'nullable|exists:ruangan,id',
        ]);

        DB::transaction(function () use ($request) {
            $kelas = KelasPraktikum::create([
                'kode_kelas' => $request->kode_kelas,
                'nama_praktikum' => $request->nama_praktikum,
                'semester' => $request->semester,
                'nama_kelas' => $request->nama_kelas,
                'tahun_ajaran' => $request->tahun_ajaran,
                'dosen_id' => auth()->id(),
                'ruangan_id' => $request->ruangan_id,
                'status_aktif' => true,
            ]);

            // Auto Generate 14 Lembar Pertemuan untuk Map Praktikum ini
            for ($i = 1; $i <= 14; $i++) {
                PertemuanAbsensi::create([
                    'kelas_praktikum_id' => $kelas->id,
                    'pertemuan_ke' => $i,
                    'topik_materi' => "Materi Pertemuan Ke-{$i}",
                    'status_pertemuan' => 'terjadwal',
                ]);
            }
        });

        return redirect()->back()->with('success', 'Kelas Praktikum dan 14 Map Pertemuan Absensi berhasil dibuat.');
    }

    public function showPertemuan($id)
    {
        // Load pertemuan beserta kelas praktikum dan mahasiswa yang terdaftar di kelas tersebut
        $pertemuan = PertemuanAbsensi::with([
            'kelasPraktikum.dosen', 
            'kelasPraktikum.mahasiswa', // Pastikan relasi 'mahasiswa' ada di model KelasPraktikum
            'detailAbsensi.mahasiswa'
        ])->findOrFail($id);

        // Ambil daftar mahasiswa HANYA dari kelas praktikum ini (melalui relasi kelas_mahasiswa)
        $mahasiswa = $pertemuan->kelasPraktikum->mahasiswa; 
        // Catatan: Jika relasi di model KelasPraktikum menggunakan nama lain (misal: students()), 
        // sesuaikan menjadi: $pertemuan->kelasPraktikum->students;

        // Format data presensi
        $presensiMap = $pertemuan->detailAbsensi->keyBy('mahasiswa_id');

        $listAbsensi = $mahasiswa->map(function ($mhs) use ($presensiMap) {
            $detail = $presensiMap->get($mhs->id);
            return [
                'mahasiswa_id' => $mhs->id,
                'nim' => $mhs->nim,
                'nama' => $mhs->name,
                'status_kehadiran' => $detail ? $detail->status_kehadiran : 'alpa',
                'keterangan' => $detail ? $detail->keterangan : '',
            ];
        });

        return response()->json([
            'pertemuan' => $pertemuan,
            'list_absensi' => $listAbsensi
        ]);
    }

    // Simpan/Batch Update Absensi, Berita Acara & Absen Fisik
    public function simpanAbsensi(Request $request, $id)
    {
        $pertemuan = PertemuanAbsensi::findOrFail($id);

        // 1. Tambahkan validasi untuk berita_acara & file_absen_fisik
        $request->validate([
            'topik_materi' => 'required|string',
            'tanggal_praktik' => 'required|date',
            'berita_acara' => 'required|string', // Wajib diisi
            'file_absen_fisik' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048', // Bisa diupload dosen
            'absensi' => 'required|array',
            'absensi.*.mahasiswa_id' => 'required|exists:users,id',
            'absensi.*.status_kehadiran' => 'required|in:hadir,izin,sakit,alpa',
        ]);

        DB::transaction(function () use ($request, $pertemuan) {
            
            // 2. Gunakan 'berita_acara' (bukan catatan_dosen)
            $dataUpdate = [
                'topik_materi' => $request->topik_materi,
                'tanggal_praktik' => $request->tanggal_praktik,
                'berita_acara' => $request->berita_acara, 
                'status_pertemuan' => 'selesai',
            ];

            // 3. Logika untuk menyimpan file gambar/PDF absensi fisik jika diunggah dosen
            if ($request->hasFile('file_absen_fisik')) {
                $dataUpdate['file_absen_fisik'] = $request->file('file_absen_fisik')->store('absensi_fisik', 'public');
            }

            // 4. Update tabel pertemuan
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


    public function generateQr($id)
    {
        $pertemuan = PertemuanAbsensi::findOrFail($id);
        $pertemuan->update([
            'qr_token' => Str::random(32),
            'status_pertemuan' => 'berlangsung'
        ]);

        return redirect()->back()->with('success', 'QR Code presensi berhasil dibuat.');
    }

    public function exportPdf($id)
    {
        // Ambil data kelas praktikum beserta relasi mahasiswa, pertemuan, dan detail absensi
        $kelas = KelasPraktikum::with([
            'dosen',
            'ruangan',
            'mahasiswa',
            'pertemuan.detailAbsensi'
        ])->findOrFail($id);

        // Pastikan dosen yang mendownload adalah dosen pengampu kelas tersebut (opsional, untuk keamanan)
        if ($kelas->dosen_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Load view khusus untuk template PDF
        $pdf = Pdf::loadView('exports.rekap-absensi-pdf', [
            'kelas' => $kelas
        ]);

        // Atur orientasi kertas (landscape lebih baik karena kolom 14 pertemuan cukup panjang)
        $pdf->setPaper('a4', 'landscape');

        // Download file PDF dengan nama dinamis
        $namaFile = 'Rekap-Absensi-' . Str::slug($kelas->nama_praktikum) . '-' . Str::slug($kelas->nama_kelas) . '.pdf';
        
        return $pdf->download($namaFile);
    }

    // Menghapus Kelas Praktikum beserta data relasinya
    public function destroy($id)
    {
        $kelas = KelasPraktikum::findOrFail($id);

        // 🔒 Proteksi Keamanan: Pastikan hanya dosen pemilik kelas yang bisa menghapus
        if ($kelas->dosen_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus kelas ini.');
        }

        DB::transaction(function () use ($kelas) {
            // 1. Ambil semua ID pertemuan yang terikat dengan kelas ini
            $pertemuanIds = PertemuanAbsensi::where('kelas_praktikum_id', $kelas->id)->pluck('id');

            // 2. Hapus detail absensi terkait
            DetailAbsensi::whereIn('pertemuan_absensi_id', $pertemuanIds)->delete();

            // 3. Hapus pertemuan absensi
            PertemuanAbsensi::whereIn('id', $pertemuanIds)->delete();

            // 4. Hapus relasi pivot mahasiswa (jika ada relasi belongsToMany)
            if (method_exists($kelas, 'mahasiswa')) {
                $kelas->mahasiswa()->detach();
            }

            // 5. Hapus kelas praktikum
            $kelas->delete();
        });

        return redirect()->back()->with('success', 'Kelas Praktikum dan seluruh data absensi terkait berhasil dihapus.');
    }
 
}