<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\PenyewaanPenelitian;
use App\Models\TagihanPenyewaan; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboranPenyewaanPenelitianController extends Controller
{
    public function index(Request $request)
    {
        $searchSewa = $request->input('search_sewa');
        $searchRekap = $request->input('search_rekap');

        // Tab 1: Data Penyewaan Alat
        $penyewaan = PenyewaanPenelitian::with(['surat', 'mahasiswa', 'details.alat', 'tagihan'])
            ->when($searchSewa, function ($query, $search) {
                $query->whereHas('mahasiswa', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('surat', function($q) use ($search) {
                    $q->where('judul_penelitian', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(5, ['*'], 'sewa_page')
            ->withQueryString();

        // Tab 2: Data Rekap Tagihan Keseluruhan
        $rekap = TagihanPenyewaan::with(['penyewaan.surat', 'mahasiswa'])
            ->when($searchRekap, function ($query, $search) {
                $query->where('nomor_nota', 'like', "%{$search}%")
                      ->orWhereHas('mahasiswa', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5, ['*'], 'rekap_page')
            ->withQueryString();

        return Inertia::render('Laboran/Penyewaan/Index', [
            'penyewaan' => $penyewaan,
            'rekap' => $rekap,
            'filters' => [
                'search_sewa' => $searchSewa,
                'search_rekap' => $searchRekap
            ]
        ]);
    }

    public function approve($id)
    {
        $penyewaan = PenyewaanPenelitian::findOrFail($id);
        $penyewaan->update(['status' => 'disetujui']);

        return back()->with('success', 'Penyewaan alat disetujui. Silakan buat tagihan biaya.');
    }

    public function buatTagihan(Request $request, $id)
    {
        $request->validate([
            'total_tagihan' => 'required|numeric|min:0'
        ]);

        $penyewaan = PenyewaanPenelitian::findOrFail($id);

        // Buat record tagihan dengan status draft untuk diteruskan ke admin
        TagihanPenyewaan::create([
            'nomor_nota' => 'INV-RES-' . time(),
            'penyewaan_penelitian_id' => $penyewaan->id,
            'mahasiswa_id' => $penyewaan->mahasiswa_id,
            'total_tagihan' => $request->total_tagihan,
            'status_tagihan' => 'draft_laboran'
        ]);

        return back()->with('success', 'Tagihan berhasil dibuat dan diteruskan ke Admin untuk dirilis.');
    }
}