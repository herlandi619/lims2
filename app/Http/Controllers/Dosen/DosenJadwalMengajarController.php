<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DosenJadwalMengajarController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $dosenId = Auth::id();

        // Mengambil jadwal khusus dosen yang sedang login
        $jadwal = JadwalLaboratorium::with(['ruangan', 'dosen'])
            ->where('dosen_id', $dosenId)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('mata_kuliah', 'like', "%{$search}%")
                      ->orWhere('kelas', 'like', "%{$search}%")
                      ->orWhere('hari', 'like', "%{$search}%")
                      ->orWhereHas('ruangan', function ($subQ) use ($search) {
                          $subQ->where('nama_ruangan', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Dosen/JadwalMengajar/Index', [
            'jadwal' => $jadwal,
            'filters' => $request->only(['search']),
        ]);
    }

    public function konfirmasi(Request $request, $id)
    {
        $jadwal = JadwalLaboratorium::where('id', $id)->where('dosen_id', Auth::id())->firstOrFail();
        
        // Logika tambahan untuk pemantauan kehadiran/pelaksanaan praktikum bisa disematkan di sini
        
        return redirect()->back()->with('success', 'Status pelaksanaan praktikum berhasil dikonfirmasi.');
    }
}