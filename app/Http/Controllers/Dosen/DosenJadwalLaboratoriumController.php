<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\JadwalLaboratorium;
use App\Models\ActivityLog;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DosenJadwalLaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Query urutan hari menggunakan CASE WHEN (Kompatibel untuk SQLite & MySQL)
        $orderHariSql = "
            CASE LOWER(hari)
                WHEN 'senin' THEN 1
                WHEN 'selasa' THEN 2
                WHEN 'rabu' THEN 3
                WHEN 'kamis' THEN 4
                WHEN 'jumat' THEN 5
                WHEN 'sabtu' THEN 6
                WHEN 'minggu' THEN 7
                ELSE 8
            END
        ";

        // Filter jadwal berdasarkan Dosen yang sedang login
        $dosenId = auth()->id();

        // Fetch data jadwal laboratorium dengan relasi kelasPraktikum & ruangan
        $jadwalList = JadwalLaboratorium::with([
            'ruangan:id,kode_ruangan,nama_ruangan,lokasi',
            'kelasPraktikum' => function ($query) {
                $query->select('id', 'dosen_id', 'kode_kelas', 'nama_kelas', 'nama_praktikum')
                      ->with('dosen:id,name,email');
            }
        ])
        // Hanya tampilkan jadwal di mana dosen pengampunya adalah dosen yang sedang login
        ->whereHas('kelasPraktikum', function ($q) use ($dosenId) {
            $q->where('dosen_id', $dosenId);
        })
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('hari', 'like', "%{$search}%")
                  ->orWhereHas('ruangan', function ($r) use ($search) {
                      $r->where('nama_ruangan', 'like', "%{$search}%")
                        ->orWhere('kode_ruangan', 'like', "%{$search}%");
                  })
                  ->orWhereHas('kelasPraktikum', function ($kp) use ($search) {
                      $kp->where('nama_praktikum', 'like', "%{$search}%")
                         ->orWhere('nama_kelas', 'like', "%{$search}%")
                         ->orWhere('kode_kelas', 'like', "%{$search}%");
                  });
            });
        })
        ->orderByRaw($orderHariSql)
        ->orderBy('jam_mulai', 'asc')
        ->paginate(10)
        ->withQueryString();

        // Catat Log Aktivitas
        ActivityLog::create([
            'user_id'   => auth()->id(),
            'aktivitas' => $search 
                ? "Mencari jadwal laboratorium dengan kata kunci: '{$search}'" 
                : "Melihat daftar jadwal laboratorium mengajar",
            'ip_address' => $request->ip(),
            'browser'   => $request->userAgent(),
        ]);

        return Inertia::render('Dosen/JadwalLaboratorium/Index', [
            'jadwalList' => $jadwalList,
            'filters'    => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kelas_praktikum_id' => 'required|exists:kelas_praktikum,id',
            'ruangan_id'         => 'required|exists:ruangan,id',
            'hari'               => 'required|string|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'jam_mulai'          => 'required|date_format:H:i',
            'jam_selesai'        => 'required|date_format:H:i|after:jam_mulai',
        ]);

        try {
            DB::transaction(function () use ($request) {
                // 1. Simpan Jadwal Laboratorium
                $jadwal = JadwalLaboratorium::create([
                    'kelas_praktikum_id' => $request->kelas_praktikum_id,
                    'ruangan_id'         => $request->ruangan_id,
                    'hari'               => strtolower($request->hari),
                    'jam_mulai'          => $request->jam_mulai,
                    'jam_selesai'        => $request->jam_selesai,
                ]);

                // 2. Catat Log Aktivitas
                ActivityLog::create([
                    'user_id'   => auth()->id(),
                    'aktivitas' => "Menambahkan jadwal laboratorium baru (ID Kelas: {$request->kelas_praktikum_id}) pada hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai})",
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke Dosen
                Notifikasi::create([
                    'user_id'      => auth()->id(),
                    'judul'        => 'Jadwal Laboratorium Baru',
                    'isi'          => "Jadwal praktikum untuk hari {$request->hari} ({$request->jam_mulai} - {$request->jam_selesai}) berhasil ditambahkan.",
                    'sudah_dibaca' => false,
                ]);
            });

            return back()->with('success', 'Jadwal laboratorium berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan jadwal: ' . $e->getMessage());
        }
    }
}