<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\SuratPenelitian;
use App\Models\PenyewaanPenelitian;
use App\Models\DetailPenyewaanPenelitian;
use App\Models\Alat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MahasiswaPenelitianController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Pastikan memuat relasi 'penyewaan.tagihan' dan 'penyewaan.details.alat'
        $penelitian = SuratPenelitian::with(['penyewaan.details.alat', 'penyewaan.tagihan']) 
            ->where('mahasiswa_id', auth()->id())
            ->when($search, function ($query, $search) {
                $query->where('judul_penelitian', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        $alat = Alat::where('stok_tersedia', '>', 0)->get();

        return Inertia::render('Mahasiswa/Penelitian/Index', [
            'penelitian' => $penelitian,
            'alat' => $alat,
            'filters' => ['search' => $search]
        ]);
    }

    public function storeSurat(Request $request)
    {
        $request->validate([
            'judul_penelitian' => 'required|string|max:255',
            'file_form_a' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'file_form_b' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'file_form_c' => 'required|file|mimes:pdf,doc,docx|max:2048',
        ]);

        SuratPenelitian::create([
            'mahasiswa_id' => auth()->id(),
            'judul_penelitian' => $request->judul_penelitian,
            'file_form_a' => $request->file('file_form_a')->store('surat_penelitian', 'public'),
            'file_form_b' => $request->file('file_form_b')->store('surat_penelitian', 'public'),
            'file_form_c' => $request->file('file_form_c')->store('surat_penelitian', 'public'),
            'status' => 'menunggu_admin'
        ]);

        return back()->with('success', 'Surat penelitian berhasil diajukan dan menunggu validasi Admin.');
    }

    public function storeSewa(Request $request, $surat_id)
    {
        $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alat_ids' => 'required|array|min:2',
            'jumlah' => 'required|array',
        ]);

        $surat = SuratPenelitian::findOrFail($surat_id);

        DB::transaction(function () use ($request, $surat) {
            $penyewaan = PenyewaanPenelitian::create([
                'surat_penelitian_id' => $surat->id,
                'mahasiswa_id' => auth()->id(),
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'status' => 'menunggu_laboran'
            ]);

            foreach ($request->alat_ids as $alat_id) {
                $qty = $request->jumlah[$alat_id] ?? 1;
                
                DetailPenyewaanPenelitian::create([
                    'penyewaan_penelitian_id' => $penyewaan->id,
                    'alat_id' => $alat_id,
                    'jumlah' => $qty
                ]);
            }
        });

        return back()->with('success', 'Pengajuan sewa alat berhasil dikirim ke Laboran.');
    }
}