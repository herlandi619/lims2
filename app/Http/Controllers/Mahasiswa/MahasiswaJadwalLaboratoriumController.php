<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use App\Models\ActivityLog;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MahasiswaJadwalLaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Query urutan hari menggunakan CASE WHEN (Kompatibel untuk SQLite & MySQL)
        $orderHariSql = "
            CASE hari
                WHEN 'Senin' THEN 1
                WHEN 'Selasa' THEN 2
                WHEN 'Rabu' THEN 3
                WHEN 'Kamis' THEN 4
                WHEN 'Jumat' THEN 5
                WHEN 'Sabtu' THEN 6
                WHEN 'Minggu' THEN 7
                ELSE 8
            END
        ";

        // Fetch data jadwal laboratorium dengan relasi ruangan & dosen (users)
        $jadwalList = JadwalLaboratorium::with([
            'ruangan:id,kode_ruangan,nama_ruangan,lokasi',
            'dosen:id,name,email'
        ])
        ->when($search, function ($query, $search) {
            $query->where('nama_mata_kuliah', 'like', "%{$search}%")
                  ->orWhere('hari', 'like', "%{$search}%")
                  ->orWhere('kelas', 'like', "%{$search}%")
                  ->orWhereHas('ruangan', function ($q) use ($search) {
                      $q->where('nama_ruangan', 'like', "%{$search}%")
                        ->orWhere('kode_ruangan', 'like', "%{$search}%");
                  })
                  ->orWhereHas('dosen', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        })
        ->orderByRaw($orderHariSql)
        ->orderBy('jam_mulai', 'asc')
        ->paginate(5)
        ->withQueryString();

        // Catat Log Aktivitas
        ActivityLog::create([
            'user_id'   => auth()->id(),
            'aktivitas' => $search 
                ? "Mencari jadwal laboratorium dengan kata kunci: '{$search}'" 
                : "Melihat daftar jadwal laboratorium",
            'ip_address' => $request->ip(),
            'browser'   => $request->userAgent(),
        ]);

        return Inertia::render('Mahasiswa/JadwalLaboratorium/Index', [
            'jadwalList' => $jadwalList,
            'filters'    => ['search' => $search],
        ]);
    }

    // Metode store jika di kemudian hari mahasiswa/dosen mengajukan/menambahkan jadwal baru
    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id'       => 'required|exists:ruangan,id',
            'dosen_id'         => 'required|exists:users,id',
            'nama_mata_kuliah' => 'required|string|max:255',
            'kelas'            => 'required|string|max:50',
            'hari'             => 'required|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_mulai'        => 'required|date_format:H:i',
            'jam_selesai'      => 'required|date_format:H:i|after:jam_mulai',
        ]);

        try {
            DB::transaction(function () use ($request) {
                // 1. Simpan Jadwal Laboratorium
                $jadwal = JadwalLaboratorium::create([
                    'ruangan_id'       => $request->ruangan_id,
                    'dosen_id'         => $request->dosen_id,
                    'nama_mata_kuliah' => $request->nama_mata_kuliah,
                    'kelas'            => $request->kelas,
                    'hari'             => $request->hari,
                    'jam_mulai'        => $request->jam_mulai,
                    'jam_selesai'      => $request->jam_selesai,
                ]);

                // 2. Catat Log Aktivitas (Activity Logs)
                ActivityLog::create([
                    'user_id'    => auth()->id(),
                    'aktivitas' => "Menambahkan jadwal praktikum '{$request->nama_mata_kuliah}' (Kelas {$request->kelas}) pada hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai})",
                    'ip_address' => $request->ip(),
                    'browser'    => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => auth()->id(),
                    'judul'        => 'Jadwal Laboratorium Baru',
                    'isi'          => "Jadwal praktikum '{$request->nama_mata_kuliah}' kelas {$request->kelas} untuk hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai}) berhasil ditambahkan.",
                    'sudah_dibaca' => false,
                ]);
            });

            return back()->with('success', 'Jadwal laboratorium berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan jadwal: ' . $e->getMessage());
        }
    }
}