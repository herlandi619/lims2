<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\TagihanPenyewaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class MahasiswaTagihanController extends Controller
{
    public function index()
    {
        // Dialihkan ke Index utama agar semua menyatu dalam 1 View Index.jsx
        return redirect()->route('mahasiswa.penelitian.index');
    }

    public function uploadBukti(Request $request, $id)
    {
        $request->validate([
            'bukti_pembayaran' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $tagihan = TagihanPenyewaan::where('id', $id)->where('mahasiswa_id', Auth::id())->firstOrFail();
        
        $path = $request->file('bukti_pembayaran')->store('tagihan_penelitian/bukti', 'public');
        
        $tagihan->update([
            'bukti_pembayaran' => $path
        ]);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.');
    }

    public function cetakNota($id)
    {
        $tagihan = TagihanPenyewaan::with(['penyewaan.details.alat', 'mahasiswa', 'penyewaan.surat'])
            ->where('id', $id)
            ->where('mahasiswa_id', Auth::id())
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.nota-penelitian', compact('tagihan'));
        return $pdf->download('Nota-Penelitian-'.$tagihan->nomor_nota.'.pdf');
    }
}