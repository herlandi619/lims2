<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\DetailPeminjaman;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\PengaturanDenda;
use App\Models\RiwayatAlat;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
 
class LaboranPeminjamanSirkulasiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $pengaturan = PengaturanDenda::first();

        $peminjaman = Peminjaman::with(['user', 'details.alat'])
            ->when($search, function ($q) use ($search) {
                $q->where('kode_peminjaman', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Laboran/Sirkulasi/Index', [
            'peminjaman' => $peminjaman,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'pengaturanDenda' => $pengaturan,
        ]);
    }

    // 1. Approval - Setujui Peminjaman
    public function approve(Request $request, Peminjaman $peminjaman)
    {
        $request->validate([
            'catatan_laboran' => 'nullable|string',
        ]);

        DB::transaction(function () use ($peminjaman, $request) {
            // 1. UPDATE STATUS PEMINJAMAN
            $peminjaman->update([
                'status' => 'disetujui',
                'catatan_laboran' => $request->catatan_laboran,
            ]);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menyetujui pengajuan peminjaman alat (Kode: {$peminjaman->kode_peminjaman})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Peminjam)
            Notifikasi::create([
                'user_id'      => $peminjaman->user_id,
                'judul'        => 'Peminjaman Barang Disetujui!',
                'isi'          => "Pengajuan peminjaman barang ({$peminjaman->kode_peminjaman}) telah disetujui. Silakan mengambil alat di ruang laboratorium.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Pengajuan peminjaman berhasil disetujui!');
    }

    // 2. Approval - Tolak Peminjaman
    public function reject(Request $request, Peminjaman $peminjaman)
    {
        $request->validate([
            'catatan_laboran' => 'required|string',
        ]);

        DB::transaction(function () use ($peminjaman, $request) {
            // 1. UPDATE STATUS PEMINJAMAN
            $peminjaman->update([
                'status' => 'ditolak',
                'catatan_laboran' => $request->catatan_laboran,
            ]);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menolak pengajuan peminjaman alat (Kode: {$peminjaman->kode_peminjaman})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Peminjam)
            Notifikasi::create([
                'user_id'      => $peminjaman->user_id,
                'judul'        => 'Peminjaman Barang Ditolak',
                'isi'          => "Pengajuan peminjaman Anda ({$peminjaman->kode_peminjaman}) DITOLAK. Alasan: {$request->catatan_laboran}",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Pengajuan peminjaman berhasil ditolak!');
    }

    // 3. Approval - Serahkan Alat (Ubah Status ke 'dipinjam' & Potong Stok)
    public function serahkan(Request $request, Peminjaman $peminjaman)
    {
        DB::transaction(function () use ($peminjaman, $request) {
            $peminjaman->load('details.alat');

            foreach ($peminjaman->details as $detail) {
                $alat = $detail->alat;

                // Kurangi stok tersedia
                if ($alat && $alat->stok_tersedia >= $detail->jumlah) {
                    $alat->decrement('stok_tersedia', $detail->jumlah);
                }

                // Log Riwayat Alat
                RiwayatAlat::create([
                    'alat_id'    => $detail->alat_id,
                    'user_id'    => $peminjaman->user_id,
                    'aktivitas'  => 'Peminjaman Diserahkan',
                    'keterangan' => "Alat diserahkan sejumlah {$detail->jumlah} unit untuk transaksi {$peminjaman->kode_peminjaman}",
                ]);
            }

            // 1. UPDATE STATUS PEMINJAMAN
            $peminjaman->update([
                'status' => 'dipinjam',
            ]);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Penyerahan fisik alat untuk kode peminjaman {$peminjaman->kode_peminjaman}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Ke Peminjam)
            Notifikasi::create([
                'user_id'      => $peminjaman->user_id,
                'judul'        => 'Alat Telah Diserahkan',
                'isi'          => "Alat untuk kode peminjaman {$peminjaman->kode_peminjaman} telah diserahkan. Harap jaga peralatan dengan baik.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Alat berhasil diserahkan kepada peminjam!');
    }

    
    // 4 VERIFGIKASI
    public function verifikasiPengembalian(Request $request, Peminjaman $peminjaman)
{
    // 1. Validasi input dari frontend (menerima variasi rusak_ringan & rusak_berat)
    $request->validate([
        'items'                     => 'required|array',
        'items.*.id'                => 'required|exists:detail_peminjaman,id',
        'items.*.kondisi_sesudah'   => 'required|in:baik,cukup,rusak,rusak_ringan,rusak_berat',
        'items.*.foto_pengembalian' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        'items.*.denda_kerusakan'   => 'nullable|numeric|min:0',
        'catatan_laboran'           => 'nullable|string',
    ]);


    DB::transaction(function () use ($request, $peminjaman) {
        $pengaturanDenda = PengaturanDenda::first();

        $tarifDendaPerHari = $pengaturanDenda ? floatval($pengaturanDenda->denda_per_hari) : 5000;
        $tarifRusakSedang  = $pengaturanDenda ? floatval($pengaturanDenda->denda_rusak_ringan ?? 25000) : 25000; 
        $tarifRusakBerat   = $pengaturanDenda ? floatval($pengaturanDenda->denda_rusak_berat ?? 50000) : 50000;

        $tglRencana = Carbon::parse($peminjaman->tanggal_rencana_kembali)->startOfDay();
        $tglKembali = Carbon::now()->startOfDay();

        $hariTerlambat = 0;
        if ($tglKembali->greaterThan($tglRencana)) {
            $hariTerlambat = $tglRencana->diffInDays($tglKembali);
        }

        $totalDendaTerlambat = $hariTerlambat * $tarifDendaPerHari;
        $totalItems = count($request->items);
        $dendaTerlambatPerItem = $totalItems > 0 ? ($totalDendaTerlambat / $totalItems) : 0;

        $totalDendaKerusakan = 0;

        foreach ($request->items as $index => $itemData) {
            $detail = DetailPeminjaman::findOrFail($itemData['id']);
            $alat = Alat::findOrFail($detail->alat_id);

            // Handle Upload Foto
            $fotoPath = $detail->foto_pengembalian;
            if ($request->hasFile("items.{$index}.foto_pengembalian")) {
                $fotoPath = $request->file("items.{$index}.foto_pengembalian")->store('pengembalian', 'public');
            }

            // 2. Kalkulasi Denda Kerusakan
            $dendaRskItem = 0;
            if (isset($itemData['denda_kerusakan']) && floatval($itemData['denda_kerusakan']) > 0) {
                $dendaRskItem = floatval($itemData['denda_kerusakan']);
            } else {
                switch ($itemData['kondisi_sesudah']) {
                    case 'rusak':
                    case 'rusak_berat':
                        $dendaRskItem = $tarifRusakBerat * $detail->jumlah;
                        break;

                    case 'cukup':
                    case 'rusak_ringan':
                        $dendaRskItem = $tarifRusakSedang * $detail->jumlah;
                        break;

                    case 'baik':
                    default:
                        $dendaRskItem = 0;
                        break;
                }
            }

            $totalDendaKerusakan += $dendaRskItem;

            // 3. MAPPING KONDISI SUPAYA COCOK DENGAN SKEMA DB ('baik', 'cukup', 'rusak')
            $kondisiDb = $itemData['kondisi_sesudah'];
            if (in_array($kondisiDb, ['rusak_berat', 'rusak_ringan'])) {
                $kondisiDb = 'rusak'; // Mengubah 'rusak_berat'/'rusak_ringan' menjadi 'rusak' agar lolos CHECK constraint
            }

            // Update Detail Peminjaman menggunakan $kondisiDb
            $detail->update([
                'kondisi_sesudah'     => $kondisiDb, // 👈 SESUAI DENGAN ENUM DB DETAIL_PEMINJAMAN
                'foto_pengembalian'   => $fotoPath,
                'denda_keterlambatan' => $dendaTerlambatPerItem,
                'denda_kerusakan'     => $dendaRskItem,
            ]);

            // Kembalikan stok ketersediaan alat
            $alat->increment('stok_tersedia', $detail->jumlah);

            // Update status kondisi fisik alat di tabel Master Alat
            if (in_array($itemData['kondisi_sesudah'], ['rusak', 'rusak_berat', 'rusak_ringan'])) {
                $alat->update(['kondisi' => 'rusak']); 
            }

            // Log Riwayat Alat
            RiwayatAlat::create([
                'alat_id'   => $alat->id,
                'user_id'   => $peminjaman->user_id,
                'aktivitas' => 'Pengembalian Alat',
                'keterangan'=> "Alat dikembalikan {$detail->jumlah} unit (Kondisi: {$itemData['kondisi_sesudah']}). Kode: {$peminjaman->kode_peminjaman}",
            ]);
        }

        $grandTotalDenda = $totalDendaTerlambat + $totalDendaKerusakan;
        $statusDenda = $grandTotalDenda > 0 ? 'belum_dibayar' : 'lunas';

        $catatanDendaList = [];
        if ($hariTerlambat > 0) {
            $catatanDendaList[] = "Terlambat {$hariTerlambat} hari (Rp " . number_format($totalDendaTerlambat, 0, ',', '.') . ")";
        }
        if ($totalDendaKerusakan > 0) {
            $catatanDendaList[] = "Denda kerusakan/kondisi (Rp " . number_format($totalDendaKerusakan, 0, ',', '.') . ")";
        }
        $catatanDenda = count($catatanDendaList) > 0 ? implode(' & ', $catatanDendaList) : null;

        $peminjaman->update([
            'status'          => 'dikembalikan',
            'tanggal_kembali' => $tglKembali->toDateString(),
            'catatan_laboran' => $request->catatan_laboran,
            'total_denda'     => $grandTotalDenda,
            'status_denda'    => $statusDenda,
            'catatan_denda'   => $catatanDenda,
        ]);

        ActivityLog::create([
            'user_id'    => auth()->id(),
            'aktivitas'  => "Memverifikasi pengembalian alat untuk transaksi {$peminjaman->kode_peminjaman}" . ($grandTotalDenda > 0 ? " dengan total denda Rp " . number_format($grandTotalDenda, 0, ',', '.') : ""),
            'ip_address' => $request->ip(),
            'browser'    => substr($request->userAgent() ?? '', 0, 255),
        ]);

        Notifikasi::create([
            'user_id'      => $peminjaman->user_id,
            'judul'        => $grandTotalDenda > 0 ? 'Pengembalian Diverifikasi (Ada Denda)' : 'Pengembalian Alat Diverifikasi',
            'isi'          => "Pengembalian alat ({$peminjaman->kode_peminjaman}) telah diverifikasi." . ($grandTotalDenda > 0 ? " Total denda: Rp " . number_format($grandTotalDenda, 0, ',', '.') : " Transaksi Selesai."),
            'sudah_dibaca' => false,
        ]);
    });

    return back()->with('success', 'Pengembalian alat berhasil diverifikasi!');
}
  

   public function bayarDenda(Request $request, Peminjaman $peminjaman)
{
    // Cek jika denda memang belum dibayar
    if ($peminjaman->status_denda !== 'belum_dibayar') {
        return back()->with('error', 'Transaksi ini tidak memiliki denda yang perlu dibayar.');
    }

    DB::transaction(function () use ($request, $peminjaman) {
        $totalDenda = (float) ($peminjaman->total_denda ?? 0);
        $totalFormatted = number_format($totalDenda, 0, ',', '.');

        // 1. Update status denda di tabel peminjaman
        $peminjaman->update([
            'status_denda' => 'lunas',
        ]);

        // 2. Catat ke Activity Log
        ActivityLog::create([
            'user_id'    => auth()->id(),
            'aktivitas'  => "Menerima pembayaran denda sebesar Rp {$totalFormatted} untuk kode {$peminjaman->kode_peminjaman}",
            'ip_address' => $request->ip(),
            'browser'    => substr($request->userAgent() ?? '', 0, 255),
        ]);

        // 3. Kirim Notifikasi ke Mahasiswa
        Notifikasi::create([
            'user_id'      => $peminjaman->user_id,
            'judul'        => 'Pembayaran Denda Lunas',
            'isi'          => "Pembayaran denda sebesar Rp {$totalFormatted} untuk peminjaman {$peminjaman->kode_peminjaman} telah diterima. Status denda: LUNAS.",
            'sudah_dibaca' => false,
        ]);
    });

    return back()->with('success', 'Pembayaran denda berhasil dikonfirmasi dan berstatus LUNAS!');
}
    
}