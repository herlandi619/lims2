<?php
namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboranJadwalLaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

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

        $ruangan = Ruangan::all();
        $dosen = User::where('role', 'dosen')->get();

        return Inertia::render('Laboran/JadwalLaboratorium/Index', [
            'jadwal' => $jadwal,
            'ruangan' => $ruangan,
            'dosen' => $dosen,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'mata_kuliah' => 'required|string|max:255',
            'kelas' => 'required|string|max:100',
            'dosen_id' => 'nullable|exists:users,id',
            'hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
        ]);

        JadwalLaboratorium::create($request->all());

        return redirect()->back()->with('success', 'Jadwal laboratorium berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'mata_kuliah' => 'required|string|max:255',
            'kelas' => 'required|string|max:100',
            'dosen_id' => 'nullable|exists:users,id',
            'hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
        ]);

        $jadwal = JadwalLaboratorium::findOrFail($id);
        $jadwal->update($request->all());

        return redirect()->back()->with('success', 'Jadwal laboratorium berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $jadwal = JadwalLaboratorium::findOrFail($id);
        $jadwal->delete();

        return redirect()->back()->with('success', 'Jadwal laboratorium berhasil dihapus.');
    }
}
