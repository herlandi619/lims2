<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\KelasMahasiswa;
use App\Models\KelasPraktikum;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DosenKrsMahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Menampilkan data KRS mahasiswa berdasarkan kelas praktikum
        $krsList = KelasMahasiswa::with(['mahasiswa', 'kelasPraktikum.ruangan'])
            ->when($search, function ($query, $search) {
                $query->whereHas('mahasiswa', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nim', 'like', "%{$search}%");
                })->orWhereHas('kelasPraktikum', function ($q) use ($search) {
                    $q->where('nama_praktikum', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // Ambil data pendukung untuk Form Modal
        $listKelas = KelasPraktikum::where('status_aktif', true)->get();
        // Hanya ambil user dengan role mahasiswa
        $listMahasiswa = User::where('role', 'mahasiswa')->get();

        return Inertia::render('Dosen/Krs/Index', [
            'krsList' => $krsList,
            'listKelas' => $listKelas,
            'listMahasiswa' => $listMahasiswa,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kelas_praktikum_id' => 'required|exists:kelas_praktikum,id',
            'mahasiswa_id' => 'required|exists:users,id',
        ]);

        // Cek apakah mahasiswa sudah terdaftar di kelas ini sebelumnya
        $exists = KelasMahasiswa::where('kelas_praktikum_id', $validated['kelas_praktikum_id'])
            ->where('mahasiswa_id', $validated['mahasiswa_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['mahasiswa_id' => 'Mahasiswa tersebut sudah terdaftar pada mata kuliah/kelas ini.']);
        }

        KelasMahasiswa::create([
            'kelas_praktikum_id' => $validated['kelas_praktikum_id'],
            'mahasiswa_id' => $validated['mahasiswa_id'],
            'status_krs' => 'disetujui'
        ]);

        return redirect()->route('dosen.krs.index')->with('success', 'Mahasiswa berhasil dimasukkan ke dalam KRS matkul.');
    }

    public function destroy($id)
    {
        $item = KelasMahasiswa::findOrFail($id);
        $item->delete();

        return redirect()->route('dosen.krs.index')->with('success', 'Data KRS mahasiswa berhasil dihapus.');
    }
}