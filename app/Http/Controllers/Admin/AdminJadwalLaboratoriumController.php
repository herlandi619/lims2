<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminJadwalLaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $jadwal = JadwalLaboratorium::with(['ruangan', 'dosen'])
            ->when($search, function ($query, $search) {
                $query->where('mata_kuliah', 'like', "%{$search}%")
                      ->orWhere('kelas', 'like', "%{$search}%")
                      ->orWhereHas('ruangan', function ($q) use ($search) {
                          $q->where('nama_ruangan', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5);

        return Inertia::render('Admin/JadwalLaboratorium/Index', [
            'jadwal' => $jadwal,
            'ruangan' => Ruangan::all(),
            'dosen' => User::where('role', 'dosen')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required',
            'mata_kuliah' => 'required',
            'kelas' => 'required',
            'hari' => 'required',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        JadwalLaboratorium::create($request->all());
        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $jadwal = JadwalLaboratorium::findOrFail($id);
        $jadwal->update($request->all());
        return redirect()->back()->with('success', 'Jadwal berhasil di-update.');
    }

    public function destroy($id)
    {
        JadwalLaboratorium::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Jadwal berhasil dihapus.');
    }
}