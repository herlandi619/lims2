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

class DosenAbsensiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $semester = $request->input('semester');

        $kelas = KelasPraktikum::with(['dosen', 'ruangan', 'pertemuan']) // ✅ Wajib tambahkan 'pertemuan'
            ->withCount('pertemuan')
            ->when($search, function ($query, $search) {
                $query->where('nama_praktikum', 'like', "%{$search}%")
                    ->orWhere('kode_kelas', 'like', "%{$search}%")
                    ->orWhere('nama_kelas', 'like', "%{$search}%");
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

    // Menampilkan 14 Pertemuan dan Mahasiswa untuk Diabsen
    public function showPertemuan($id)
    {
        $pertemuan = PertemuanAbsensi::with(['kelasPraktikum.dosen', 'detailAbsensi.mahasiswa'])->findOrFail($id);

        // Ambil semua mahasiswa aktif (bisa disesuaikan dengan kriteria per kelas)
        $mahasiswa = User::where('role', 'mahasiswa')
            ->where('status', true)
            ->get(['id', 'name', 'nim']);

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

    // Simpan/Batch Update Absensi 14 Pertemuan
    public function simpanAbsensi(Request $request, $id)
    {
        $pertemuan = PertemuanAbsensi::findOrFail($id);

        $request->validate([
            'topik_materi' => 'required|string',
            'tanggal_praktik' => 'required|date',
            'absensi' => 'required|array',
            'absensi.*.mahasiswa_id' => 'required|exists:users,id',
            'absensi.*.status_kehadiran' => 'required|in:hadir,izin,sakit,alpa',
        ]);

        DB::transaction(function () use ($request, $pertemuan) {
            $pertemuan->update([
                'topik_materi' => $request->topik_materi,
                'tanggal_praktik' => $request->tanggal_praktik,
                'catatan_dosen' => $request->catatan_dosen,
                'status_pertemuan' => 'selesai',
            ]);

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

        return redirect()->back()->with('success', "Lembar pertemuan ke-{$pertemuan->pertemuan_ke} berhasil disimpan.");
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
}