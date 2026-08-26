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

        // Query urutan hari menggunakan CASE WHEN
        $orderHariSql = "
            CASE hari
                WHEN 'senin' THEN 1
                WHEN 'selasa' THEN 2
                WHEN 'rabu' THEN 3
                WHEN 'kamis' THEN 4
                WHEN 'jumat' THEN 5
                WHEN 'sabtu' THEN 6
                ELSE 7
            END
        ";

        // Query Jadwal Laboratorium khusus untuk Mahasiswa yang sedang Login
        $jadwalList = JadwalLaboratorium::with([
            'ruangan:id,kode_ruangan,nama_ruangan,lokasi',
            'kelasPraktikum:id,kode_kelas,nama_praktikum,nama_kelas,dosen_id',
            'kelasPraktikum.dosen:id,name,email'
        ])
        // Filter: Hanya ambil jadwal dari kelas praktikum yang diikuti oleh mahasiswa ini
        ->whereHas('kelasPraktikum.mahasiswa', function ($query) {
            $query->where('mahasiswa_id', auth()->id())
                  ->where('status_krs', 'disetujui');
        })
        // Pencarian (Search)
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('hari', 'like', "%{$search}%")
                  ->orWhereHas('ruangan', function ($qRuangan) use ($search) {
                      $qRuangan->where('nama_ruangan', 'like', "%{$search}%")
                               ->orWhere('kode_ruangan', 'like', "%{$search}%");
                  })
                  ->orWhereHas('kelasPraktikum', function ($qKelas) use ($search) {
                      $qKelas->where('nama_praktikum', 'like', "%{$search}%")
                             ->orWhere('nama_kelas', 'like', "%{$search}%")
                             ->orWhere('kode_kelas', 'like', "%{$search}%")
                             ->orWhereHas('dosen', function ($qDosen) use ($search) {
                                 $qDosen->where('name', 'like', "%{$search}%");
                             });
                  });
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

    public function store(Request $request)
    {
        $request->validate([
            'kelas_praktikum_id' => 'required|exists:kelas_praktikum,id',
            'ruangan_id'         => 'required|exists:ruangan,id',
            'hari'               => 'required|string|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai'          => 'required|date_format:H:i',
            'jam_selesai'        => 'required|date_format:H:i|after:jam_mulai',
        ]);

        try {
            DB::transaction(function () use ($request) {
                // 1. Simpan Jadwal Laboratorium Baru
                $jadwal = JadwalLaboratorium::create([
                    'kelas_praktikum_id' => $request->kelas_praktikum_id,
                    'ruangan_id'         => $request->ruangan_id,
                    'hari'               => strtolower($request->hari),
                    'jam_mulai'          => $request->jam_mulai,
                    'jam_selesai'        => $request->jam_selesai,
                ]);

                // Load relasi kelasPraktikum untuk teks log/notifikasi
                $jadwal->load('kelasPraktikum');

                // 2. Catat Log Aktivitas
                ActivityLog::create([
                    'user_id'   => auth()->id(),
                    'aktivitas' => "Menambahkan jadwal praktikum '{$jadwal->kelasPraktikum->nama_praktikum}' ({$jadwal->kelasPraktikum->nama_kelas}) pada hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai})",
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => auth()->id(),
                    'judul'        => 'Jadwal Laboratorium Baru',
                    'isi'          => "Jadwal praktikum '{$jadwal->kelasPraktikum->nama_praktikum}' kelas {$jadwal->kelasPraktikum->nama_kelas} untuk hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai}) berhasil ditambahkan.",
                    'sudah_dibaca' => false,
                ]);
            });

            return back()->with('success', 'Jadwal laboratorium berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan jadwal: ' . $e->getMessage());
        }
    }
}