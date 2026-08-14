<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BookingRuangan;
use App\Models\JadwalLaboratorium;
use App\Models\Notifikasi;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaboranManajemenRuanganController extends Controller
{
    public function index(Request $request)
    {
        $searchBooking = $request->input('search_booking');
        $searchJadwal = $request->input('search_jadwal');
        $activeTab = $request->input('tab', 'booking');

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

        // Data Jadwal Lab (Paginate 5)
        $jadwal = JadwalLaboratorium::with(['ruangan', 'dosen'])
            ->when($searchJadwal, function ($q) use ($searchJadwal) {
                $q->where('mata_kuliah', 'like', "%{$searchJadwal}%")
                  ->orWhere('kelas', 'like', "%{$searchJadwal}%")
                  ->orWhereHas('ruangan', fn($r) => $r->where('nama_ruangan', 'like', "%{$searchJadwal}%"));
            })
            ->latest()
            ->paginate(5, ['*'], 'jadwal_page')
            ->withQueryString();

        // Master Data untuk Dropdown Form Jadwal
        $ruangan = Ruangan::where('status', 'aktif')->get();
        $dosen = User::where('role', 'dosen')->get();

        return Inertia::render('Laboran/RuanganManajemen/Index', [
            'bookingList' => $booking,
            'jadwalList'  => $jadwal,
            'ruanganList' => $ruangan,
            'dosenList'   => $dosen,
            'filters'     => [
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
            // 1. UPDATE BOOKING
            $booking->update([
                'status'  => 'disetujui',
                'catatan' => $request->catatan,
            ]);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menyetujui booking ruangan {$namaRuangan} untuk pemohon (ID: {$booking->user_id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Pemohon Booking)
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
            // 1. UPDATE BOOKING
            $booking->update([
                'status'  => 'ditolak',
                'catatan' => $request->catatan,
            ]);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menolak booking ruangan {$namaRuangan} untuk pemohon (ID: {$booking->user_id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Pemohon Booking)
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
            // 1. UPDATE BOOKING
            $booking->update(['status' => 'selesai']);

            $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menandai selesai sesi booking ruangan {$namaRuangan} (ID Booking: {$booking->id})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Pemohon Booking)
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
            'ruangan_id'  => 'required|exists:ruangan,id',
            'mata_kuliah' => 'required|string|max:255',
            'kelas'       => 'required|string|max:255',
            'dosen_id'    => 'nullable|exists:users,id',
            'hari'        => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai'   => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // 1. STORE JADWAL
            $jadwal = JadwalLaboratorium::create($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan jadwal lab baru: {$jadwal->mata_kuliah} ({$jadwal->kelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Kirim ke Dosen Pengampu jika dipilih)
            if ($jadwal->dosen_id) {
                Notifikasi::create([
                    'user_id'      => $jadwal->dosen_id,
                    'judul'        => 'Jadwal Praktikum Baru',
                    'isi'          => "Anda dijadwalkan mengampu perkuliahan {$jadwal->mata_kuliah} ({$jadwal->kelas}) pada hari " . ucfirst($jadwal->hari) . " jam {$jadwal->jam_mulai} - {$jadwal->jam_selesai}.",
                    'sudah_dibaca' => false,
                ]);
            }

            // Notifikasi konfirmasi untuk Laboran
            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Ditambahkan',
                'isi'          => "Jadwal {$jadwal->mata_kuliah} ({$jadwal->kelas}) telah berhasil disimpan.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil ditambahkan!');
    }

    public function updateJadwal(Request $request, JadwalLaboratorium $jadwal)
    {
        $validated = $request->validate([
            'ruangan_id'  => 'required|exists:ruangan,id',
            'mata_kuliah' => 'required|string|max:255',
            'kelas'       => 'required|string|max:255',
            'dosen_id'    => 'nullable|exists:users,id',
            'hari'        => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jam_mulai'   => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
        ]);

        DB::transaction(function () use ($jadwal, $validated, $request) {
            // 1. UPDATE JADWAL
            $jadwal->update($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui jadwal lab: {$jadwal->mata_kuliah} ({$jadwal->kelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Dosen Pengampu jika ada)
            if ($jadwal->dosen_id) {
                Notifikasi::create([
                    'user_id'      => $jadwal->dosen_id,
                    'judul'        => 'Perubahan Jadwal Praktikum',
                    'isi'          => "Jadwal perkuliahan {$jadwal->mata_kuliah} ({$jadwal->kelas}) telah diperbarui menjadi hari " . ucfirst($jadwal->hari) . " jam {$jadwal->jam_mulai} - {$jadwal->jam_selesai}.",
                    'sudah_dibaca' => false,
                ]);
            }

            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Diperbarui',
                'isi'          => "Jadwal {$jadwal->mata_kuliah} ({$jadwal->kelas}) telah diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil diperbarui!');
    }

    public function destroyJadwal(Request $request, JadwalLaboratorium $jadwal)
    {
        DB::transaction(function () use ($jadwal, $request) {
            $mataKuliah = $jadwal->mata_kuliah;
            $kelas = $jadwal->kelas;
            $dosenId = $jadwal->dosen_id;

            // 1. DELETE JADWAL
            $jadwal->delete();

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus jadwal lab: {$mataKuliah} ({$kelas})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Dosen jika ada)
            if ($dosenId) {
                Notifikasi::create([
                    'user_id'      => $dosenId,
                    'judul'        => 'Jadwal Praktikum Dihapus',
                    'isi'          => "Jadwal perkuliahan {$mataKuliah} ({$kelas}) telah dihapus dari sistem.",
                    'sudah_dibaca' => false,
                ]);
            }

            Notifikasi::create([
                'user_id'      => auth()->id(),
                'judul'        => 'Jadwal Berhasil Dihapus',
                'isi'          => "Jadwal {$mataKuliah} ({$kelas}) telah dihapus dari sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Jadwal laboratorium berhasil dihapus!');
    }
}