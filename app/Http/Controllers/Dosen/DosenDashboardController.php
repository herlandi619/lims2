<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\BookingRuangan;
use App\Models\JadwalLaboratorium;
use App\Models\Peminjaman;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia; 

class DosenDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $searchBooking = $request->input('search_booking', '');
        $searchJadwal = $request->input('search_jadwal', '');

        // 1. Jadwal Mengajar Dosen (Paginate 5)
        $jadwalMengajar = JadwalLaboratorium::with('ruangan')
            ->where('dosen_id', $user->id)
            ->when($searchJadwal, function ($query, $search) {
                $query->where('mata_kuliah', 'like', "%{$search}%")
                      ->orWhere('kelas', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5, ['*'], 'jadwal_page')
            ->withQueryString();

        // 2. Booking Ruangan oleh Dosen (Paginate 5)
        $bookingRuangan = BookingRuangan::with('ruangan')
            ->where('user_id', $user->id)
            ->when($searchBooking, function ($query, $search) {
                $query->where('keperluan', 'like', "%{$search}%")
                      ->orWhereHas('ruangan', function ($q) use ($search) {
                          $q->where('nama_ruangan', 'like', "%{$search}%");
                      });
            })
            ->orderBy('id', 'desc')
            ->paginate(5, ['*'], 'booking_page')
            ->withQueryString();

        // 3. Alat yang Sedang/Pernah Dipinjam Dosen (Paginate 5)
        $peminjamanAlat = Peminjaman::with('details.alat')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate(5, ['*'], 'pinjam_page')
            ->withQueryString();

        // 4. Statistik Penggunaan Lab oleh Dosen
        $stats = [
            'total_mengajar'  => JadwalLaboratorium::where('dosen_id', $user->id)->count(),
            'booking_aktif'   => BookingRuangan::where('user_id', $user->id)->where('status', 'disetujui')->count(),
            'peminjaman_aktif' => Peminjaman::where('user_id', $user->id)->where('status', 'dipinjam')->count(),
            'total_booking'   => BookingRuangan::where('user_id', $user->id)->count(),
        ];

        // 5. Data Master Ruangan untuk Form Modal Booking
        $ruanganList = Ruangan::where('status', 'aktif')->get();

        return Inertia::render('Dosen/Dashboard/Index', [
            'jadwalMengajar' => $jadwalMengajar,
            'bookingRuangan' => $bookingRuangan,
            'peminjamanAlat' => $peminjamanAlat,
            'stats'          => $stats,
            'ruanganList'    => $ruanganList,
            'filters'        => [
                'search_booking' => $searchBooking,
                'search_jadwal'  => $searchJadwal,
            ],
        ]);
    }

    public function storeBooking(Request $request)
    {
        $validated = $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'tanggal'    => 'required|date',
            'jam_mulai'  => 'required',
            'jam_selesai'=> 'required',
            'keperluan'  => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status']  = 'menunggu';

        BookingRuangan::create($validated);

        return redirect()->back()->with('success', 'Booking ruangan berhasil diajukan!');
    }

    public function updateBooking(Request $request, $id)
    {
        $booking = BookingRuangan::where('user_id', auth()->id())->findOrFail($id);

        $validated = $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'tanggal'    => 'required|date',
            'jam_mulai'  => 'required',
            'jam_selesai'=> 'required',
            'keperluan'  => 'nullable|string',
        ]);

        $booking->update($validated);

        return redirect()->back()->with('success', 'Data booking berhasil diperbarui!');
    }

    public function destroyBooking($id)
    {
        $booking = BookingRuangan::where('user_id', auth()->id())->findOrFail($id);
        $booking->delete();

        return redirect()->back()->with('success', 'Booking ruangan berhasil dibatalkan!');
    }
}
