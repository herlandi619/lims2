<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TagihanPenyewaan;
use App\Models\Peminjaman;
use App\Models\DetailPeminjaman;
use App\Models\Alat;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminTagihanPenelitianController extends Controller
{
    public function index()
    {
        // Alihkan ke Index Gabungan
        return redirect()->route('admin.penelitian.index');
    }

    public function rilisTagihan($id)
    {
        $tagihan = TagihanPenyewaan::findOrFail($id);
        $tagihan->update(['status_tagihan' => 'menunggu_pembayaran']);

        return back()->with('success', 'Tagihan berhasil dirilis ke Mahasiswa terkait.');
    }

    public function verifikasiLunas($id)
    {
        // 1. Ambil data tagihan beserta relasi penyewaan & detailnya
        $tagihan = TagihanPenyewaan::with('penyewaan.details')->findOrFail($id);

        DB::transaction(function () use ($tagihan) {
            // 2. Update tagihan menjadi lunas
            $tagihan->update(['status_tagihan' => 'lunas']);

            $penyewaan = $tagihan->penyewaan;

            if ($penyewaan) {
                // 3. Masukkan ke tabel Peminjaman agar muncul di sirkulasi Laboran
                $peminjaman = Peminjaman::create([
                    'user_id'                 => $tagihan->mahasiswa_id,
                    'kode_peminjaman'         => 'SEWA-' . time() . rand(10, 99), // Kode awalan SEWA
                    'tanggal_pinjam'          => $penyewaan->tanggal_mulai,
                    'tanggal_rencana_kembali' => $penyewaan->tanggal_selesai,
                    'keperluan'               => 'Penyewaan Alat Penelitian (Telah Lunas)',
                    'status'                  => 'disetujui', // Langsung berstatus 'disetujui'
                ]);

                // 4. Masukkan daftar alat ke detail peminjaman
                if ($penyewaan->details) {
                    foreach ($penyewaan->details as $detailSewa) {
                        $alat = Alat::find($detailSewa->alat_id);

                        DetailPeminjaman::create([
                            'peminjaman_id'   => $peminjaman->id,
                            'alat_id'         => $detailSewa->alat_id,
                            'jumlah'          => $detailSewa->jumlah,
                            'kondisi_sebelum' => $alat ? $alat->kondisi : 'baik',
                        ]);
                    }
                }

                // 5. Update status di tabel penyewaan
                // $penyewaan->update([
                //     'status' => 'diproses_sirkulasi'
                // ]);
            }

            // 6. Notifikasi ke Mahasiswa
            Notifikasi::create([
                'user_id'      => $tagihan->mahasiswa_id,
                'judul'        => 'Pembayaran Sewa Diverifikasi',
                'isi'          => "Pembayaran tagihan sewa Anda telah diverifikasi Admin. Silakan temui Laboran untuk penyerahan alat.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Pembayaran diverifikasi. Tagihan lunas dan diteruskan ke Laboran.');
    }
}