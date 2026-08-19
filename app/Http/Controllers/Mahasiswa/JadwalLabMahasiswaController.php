<?php
namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\KrsMahasiswa;
use App\Models\JadwalLaboratorium;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JadwalLabMahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $userId = auth()->id(); // ID Mahasiswa yang sedang login

        // 1. Jadwal Praktikum Pribadi (Berdasarkan KRS Mahasiswa & tabel jadwal_laboratorium)
        $jadwalPraktikum = KrsMahasiswa::with(['jadwalLaboratorium.ruangan', 'jadwalLaboratorium.dosen'])
            ->where('user_id', $userId)
            ->whereHas('jadwalLaboratorium', function ($query) use ($search) {
                if ($search) {
                    $query->where('mata_kuliah', 'like', "%{$search}%")
                          ->orWhere('kelas', 'like', "%{$search}%")
                          ->orWhere('hari', 'like', "%{$search}%");
                }
            })
            ->paginate(5, ['*'], 'krs_page')
            ->withQueryString();

        // 2. Status Penggunaan Laboratorium Keseluruhan (Untuk cek bentrok)
        $statusLaboratorium = JadwalLaboratorium::with(['ruangan', 'dosen'])
            ->when($search, function ($query, $search) {
                $query->where('mata_kuliah', 'like', "%{$search}%")
                      ->orWhere('kelas', 'like', "%{$search}%")
                      ->orWhere('hari', 'like', "%{$search}%");
            })
            ->paginate(5, ['*'], 'lab_page')
            ->withQueryString();

        // Data ruangan untuk pilihan form modal
        $ruanganList = Ruangan::all();

        return Inertia::render('Mahasiswa/JadwalLab/Index', [
            'jadwalPraktikum' => $jadwalPraktikum,
            'statusLaboratorium' => $statusLaboratorium,
            'ruanganList' => $ruanganList,
            'filters' => $request->only(['search']),
        ]);
    }

    public function storeBooking(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'mata_kuliah' => 'required|string|max:255',
            'kelas' => 'required|string|max:50',
            'hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        // Validasi Cek Bentrok Waktu pada Ruangan yang sama di hari yang sama
        $isBentrok = JadwalLaboratorium::where('ruangan_id', $request->ruangan_id)
            ->where('hari', $request->hari)
            ->where(function ($query) use ($request) {
                $query->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('jam_mulai', '<=', $request->jam_mulai)
                            ->where('jam_selesai', '>=', $request->jam_selesai);
                      });
            })->exists();

        if ($isBentrok) {
            return back()->with('error', 'Ruangan laboratorium sudah terpakai pada hari dan jam tersebut (Bentrok)!');
        }

        // Simpan jadwal baru (misal sebagai jadwal kegiatan mandiri/tambahan mahasiswa)
        JadwalLaboratorium::create([
            'ruangan_id' => $request->ruangan_id,
            'mata_kuliah' => $request->mata_kuliah,
            'kelas' => $request->kelas,
            'dosen_id' => null, // Jika mandiri, dosen bisa dikosongkan
            'hari' => $request->hari,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
        ]);

        return back()->with('success', 'Pengajuan jadwal mandiri / penggunaan lab berhasil disimpan!');
    }
}