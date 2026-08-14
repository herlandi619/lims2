<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BookingRuangan;
use App\Models\Notifikasi;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DosenBookingRuanganController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $bookingList = BookingRuangan::with(['ruangan', 'user'])
            ->where('user_id', auth()->id())
            ->when($search, function ($query, $search) {
                $query->where('keperluan', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhereHas('ruangan', function ($q) use ($search) {
                          $q->where('nama_ruangan', 'like', "%{$search}%")
                            ->orWhere('kode_ruangan', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        $ruanganList = Ruangan::where('status', 'aktif')
            ->select('id', 'kode_ruangan', 'nama_ruangan', 'kapasitas', 'lokasi')
            ->get();

        // --- REKAM ACTIVITY LOG (Membuka Halaman Index) ---
        ActivityLog::create([
            'user_id'   => auth()->id(),
            'aktivitas' => $search 
                ? "Melihat halaman booking ruangan dengan pencarian '{$search}'" 
                : "Membuka halaman daftar booking ruangan",
            'ip_address' => $request->ip(),
            'browser'   => $request->userAgent(),
        ]);

        return Inertia::render('Dosen/BookingRuangan/Index', [
            'bookingList' => $bookingList,
            'ruanganList' => $ruanganList,
            'filters'     => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id'  => 'required|exists:ruangan,id',
            'tanggal'     => 'required|date|after_or_equal:today',
            'jam_mulai'   => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'keperluan'   => 'required|string|max:500',
            'catatan'     => 'nullable|string|max:500',
        ]);

        $ruanganId  = $request->ruangan_id;
        $tanggal    = $request->tanggal;
        $jamMulai   = $request->jam_mulai;
        $jamSelesai = $request->jam_selesai;

        // Ambil data ruangan untuk keperluan log dan notifikasi
        $ruangan = Ruangan::findOrFail($ruanganId);

        // PENGECEKAN OVERLAP BENTROK WAKTU
        $isBentrok = BookingRuangan::where('ruangan_id', $ruanganId)
            ->where('tanggal', $tanggal)
            ->whereIn('status', ['menunggu', 'disetujui'])
            ->where(function ($query) use ($jamMulai, $jamSelesai) {
                $query->where('jam_mulai', '<', $jamSelesai)
                    ->where('jam_selesai', '>', $jamMulai);
            })
            ->exists();

        // Mengembalikan error jika bentrok
        if ($isBentrok) {
            return back()->with('error', 'Gagal! Ruangan sudah di-booking pada tanggal dan jam tersebut.');
        }

        try {
            DB::transaction(function () use ($request, $ruangan) {
                // 1. Simpan Peminjaman / Booking Ruangan
                $booking = BookingRuangan::create([
                    'user_id'    => auth()->id(),
                    'ruangan_id' => $request->ruangan_id,
                    'tanggal'    => $request->tanggal,
                    'jam_mulai'  => $request->jam_mulai,
                    'jam_selesai'=> $request->jam_selesai,
                    'keperluan'  => $request->keperluan,
                    'catatan'    => $request->catatan,
                    'status'     => 'menunggu',
                ]);

                // 2. Catat Activity Log
                ActivityLog::create([
                    'user_id'   => auth()->id(),
                    'aktivitas' => "Mengajukan booking ruangan '{$ruangan->nama_ruangan}' pada tanggal {$request->tanggal} ({$request->jam_mulai} - {$request->jam_selesai})",
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => auth()->id(),
                    'judul'        => 'Pengajuan Booking Ruangan',
                    'isi'          => "Pengajuan booking ruangan '{$ruangan->nama_ruangan}' untuk tanggal {$request->tanggal} ({$request->jam_mulai} - {$request->jam_selesai}) berhasil dikirim. Silakan tunggu verifikasi admin.",
                    'sudah_dibaca' => false,
                ]);
            });

            return back()->with('success', 'Pengajuan booking ruangan berhasil dikirim.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memproses booking: ' . $e->getMessage());
        }
    }

    public function cancel(Request $request, $id)
    {
        $booking = BookingRuangan::with('ruangan')
            ->where('user_id', auth()->id())
            ->where('status', 'menunggu')
            ->findOrFail($id);

        try {
            DB::transaction(function () use ($request, $booking) {
                $namaRuangan = $booking->ruangan->nama_ruangan ?? 'Ruangan';
                $tanggal = $booking->tanggal;

                // 1. Hapus/Batal data booking
                $booking->delete();

                // 2. Catat Activity Log
                ActivityLog::create([
                    'user_id'   => auth()->id(),
                    'aktivitas' => "Membatalkan pengajuan booking ruangan '{$namaRuangan}' untuk tanggal {$tanggal}",
                    'ip_address' => $request->ip(),
                    'browser'   => $request->userAgent(),
                ]);

                // 3. Kirim Notifikasi ke User
                Notifikasi::create([
                    'user_id'      => auth()->id(),
                    'judul'        => 'Pembatalan Booking Ruangan',
                    'isi'          => "Pengajuan booking ruangan '{$namaRuangan}' untuk tanggal {$tanggal} telah berhasil dibatalkan.",
                    'sudah_dibaca' => false,
                ]);
            });

            return back()->with('success', 'Pengajuan booking ruangan berhasil dibatalkan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal membatalkan booking: ' . $e->getMessage());
        }
    }
}