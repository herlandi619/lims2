<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BookingRuangan;
use App\Models\JadwalLaboratorium;
use App\Models\KelasPraktikum;
use App\Models\Notifikasi;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
 
class LaboranManajemenRuanganController extends Controller
{
    public function index(Request $request)
    {
        $searchBooking = $request->input('search_booking');
        $searchJadwal  = $request->input('search_jadwal');
        $activeTab     = $request->input('tab', 'booking');

        // Data Booking Ruangan (Paginate 5)
        $booking = BookingRuangan::with(['user', 'ruangan'])
            ->when($searchBooking, function ($q) use ($searchBooking) {
                $q->whereHas('ruangan', fn($r) => $r->where('nama_ruangan', 'like', "%{$searchBooking}%"))
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$searchBooking}%"))
                  ->orWhere('keperluan', 'like', "%{$searchBooking}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'booking_page')
            ->withQueryString();

        // Data Jadwal Lab via relasi kelasPraktikum (Paginate 5)
        $jadwal = JadwalLaboratorium::with([
                'ruangan', 
                'kelasPraktikum.dosen'
            ])
            ->when($searchJadwal, function ($q) use ($searchJadwal) {
                $q->whereHas('kelasPraktikum', function ($kp) use ($searchJadwal) {
                    $kp->where('nama_praktikum', 'like', "%{$searchJadwal}%")
                       ->orWhere('nama_kelas', 'like', "%{$searchJadwal}%")
                       ->orWhere('kode_kelas', 'like', "%{$searchJadwal}%")
                       ->orWhereHas('dosen', fn($d) => $d->where('name', 'like', "%{$searchJadwal}%"));
                })
                ->orWhereHas('ruangan', fn($r) => $r->where('nama_ruangan', 'like', "%{$searchJadwal}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'jadwal_page')
            ->withQueryString();

        // Master Data untuk Dropdown Form Jadwal
        $ruanganList        = Ruangan::where('status', 'aktif')->get();
        $kelasPraktikumList = KelasPraktikum::with('dosen:id,name,email')->get();

        return Inertia::render('Laboran/RuanganManajemen/Index', [
            'bookingList'        => $booking,
            'jadwalList'         => $jadwal,
            'ruanganList'        => $ruanganList,
            'kelasPraktikumList' => $kelasPraktikumList,
            'filters'            => [
                'search_booking' => $searchBooking,
                'search_jadwal'  => $searchJadwal,
                'tab'            => $activeTab,
            ],
        ]);
    }

    // ---------------- BOOKING ACTIONS ----------------
    public function approveBooking(Request $request, BookingRuangan $booking)
    {
        $request->validate(['catatan' => 'nullable|string']);

        DB::transaction(function () use ($booking, $request) {
            $booking->update([
                'status'  => 'disetujui',
                'catatan' => $request->catatan,
            ]);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menyetujui booking ruangan {$namaRuangan} untuk pemohon (ID: {$booking->user_id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            Notifikasi::create([
                'user_id'      => $booking->user_id,
                'judul'        => 'Booking Ruangan Disetujui',
                'isi'          => "Pengajuan booking Anda untuk ruangan {$namaRuangan} telah DISETUJUI.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Booking ruangan berhasil disetujui!');
    }

    public function rejectBooking(Request $request, BookingRuangan $booking)
    {
        $request->validate(['catatan' => 'required|string']);

        DB::transaction(function () use ($booking, $request) {
            $booking->update([
                'status'  => 'ditolak',
                'catatan' => $request->catatan,
            ]);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menolak booking ruangan {$namaRuangan} untuk pemohon (ID: {$booking->user_id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            Notifikasi::create([
                'user_id'      => $booking->user_id,
                'judul'        => 'Booking Ruangan Ditolak',
                'isi'          => "Pengajuan booking Anda untuk ruangan {$namaRuangan} DITOLAK. Catatan: {$request->catatan}",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Booking ruangan berhasil ditolak!');
    }

    public function finishBooking(Request $request, BookingRuangan $booking)
    {
        DB::transaction(function () use ($booking, $request) {
            $booking->update(['status' => 'selesai']);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menandai selesai sesi booking ruangan {$namaRuangan} (ID Booking: {$booking->id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            Notifikasi::create([
                'user_id'      => $booking->user_id,
                'judul'        => 'Sesi Booking Selesai',
                'isi'          => "Sesi penggunaan ruangan {$namaRuangan} telah ditandai SELESAI.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Sesi booking telah ditandai selesai.');
    }

    // ---------------- JADWAL CRUD ACTIONS ----------------
    public function storeJadwal(Request $request)
    {
        $validated = $request->validate([
            'kelas_praktikum_id' => 'required|exists:kelas_praktikum,id',
            'ruangan_id'         => 'required|exists:ruangan,id',
            'hari'               => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'jam_mulai'          => 'required|date_format:H:i',
            'jam_selesai'        => 'required|date_format:H:i|after:jam_mulai',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $jadwal = JadwalLaboratorium::create($validated);
            $jadwal->load('kelasPraktikum.dosen');

            $namaPraktikum = $jadwal->kelasPraktikum->nama_praktikum ?? 'Praktikum';
            $namaKelas     = $jadwal->kelasPraktikum->nama_kelas ?? '-';
            $dosenId       = $jadwal->kelasPraktikum->dosen_id ?? null;

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan jadwal lab baru: {$namaPraktikum} ({$namaKelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            if ($dosenId) {
                Notifikasi::create([
                    'user_id'      => $dosenId,
                    'judul'        => 'Jadwal Praktikum Baru',
                    'isi'          => "Anda dijadwalkan mengampu perkuliahan {$namaPraktikum} ({$namaKelas}) pada hari " . ucfirst($jadwal->hari) . " jam {$jadwal->jam_mulai} - {$jadwal->jam_selesai}.",
                    'sudah_dibaca' => false,
                ]);
            }

            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Ditambahkan',
                'isi'          => "Jadwal {$namaPraktikum} ({$namaKelas}) telah berhasil disimpan.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil ditambahkan!');
    }

    public function updateJadwal(Request $request, JadwalLaboratorium $jadwal)
    {
        $validated = $request->validate([
            'kelas_praktikum_id' => 'required|exists:kelas_praktikum,id',
            'ruangan_id'         => 'required|exists:ruangan,id',
            'hari'               => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'jam_mulai'          => 'required|date_format:H:i',
            'jam_selesai'        => 'required|date_format:H:i|after:jam_mulai',
        ]);

        DB::transaction(function () use ($jadwal, $validated, $request) {
            $jadwal->update($validated);
            $jadwal->load('kelasPraktikum.dosen');

            $namaPraktikum = $jadwal->kelasPraktikum->nama_praktikum ?? 'Praktikum';
            $namaKelas     = $jadwal->kelasPraktikum->nama_kelas ?? '-';
            $dosenId       = $jadwal->kelasPraktikum->dosen_id ?? null;

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui jadwal lab: {$namaPraktikum} ({$namaKelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            if ($dosenId) {
                Notifikasi::create([
                    'user_id'      => $dosenId,
                    'judul'        => 'Perubahan Jadwal Praktikum',
                    'isi'          => "Jadwal perkuliahan {$namaPraktikum} ({$namaKelas}) telah diperbarui menjadi hari " . ucfirst($jadwal->hari) . " jam {$jadwal->jam_mulai} - {$jadwal->jam_selesai}.",
                    'sudah_dibaca' => false,
                ]);
            }

            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Diperbarui',
                'isi'          => "Jadwal {$namaPraktikum} ({$namaKelas}) telah diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil diperbarui!');
    }

    public function destroyJadwal(Request $request, JadwalLaboratorium $jadwal)
    {
        DB::transaction(function () use ($jadwal, $request) {
            $jadwal->load('kelasPraktikum');

            $namaPraktikum = $jadwal->kelasPraktikum->nama_praktikum ?? 'Praktikum';
            $namaKelas     = $jadwal->kelasPraktikum->nama_kelas ?? '-';
            $dosenId       = $jadwal->kelasPraktikum->dosen_id ?? null;

            $jadwal->delete();

            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus jadwal lab: {$namaPraktikum} ({$namaKelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            if ($dosenId) {
                Notifikasi::create([
                    'user_id'      => $dosenId,
                    'judul'        => 'Jadwal Praktikum Dihapus',
                    'isi'          => "Jadwal perkuliahan {$namaPraktikum} ({$namaKelas}) telah dihapus dari sistem.",
                    'sudah_dibaca' => false,
                ]);
            }

            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Dihapus',
                'isi'          => "Jadwal {$namaPraktikum} ({$namaKelas}) telah dihapus dari sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil dihapus!');
    }
}