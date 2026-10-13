<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SuratPenelitian;
use App\Models\TagihanPenyewaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPenelitianController extends Controller
{
    public function index(Request $request)
    {
        $searchSurat = $request->input('search_surat');
        $searchTagihan = $request->input('search_tagihan');

        // Ambil data surat penelitian (Paginate 5)
        $penelitian = SuratPenelitian::with('mahasiswa')
            ->when($searchSurat, function ($query, $search) {
                $query->where('judul_penelitian', 'like', "%{$search}%")
                      ->orWhereHas('mahasiswa', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5, ['*'], 'surat_page')
            ->withQueryString();

        // Ambil data tagihan penelitian (Paginate 5)
        $tagihan = TagihanPenyewaan::with(['penyewaan.surat', 'mahasiswa'])
            ->when($searchTagihan, function ($query, $search) {
                $query->where('nomor_nota', 'like', "%{$search}%")
                      ->orWhereHas('mahasiswa', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(5, ['*'], 'tagihan_page')
            ->withQueryString();

        return Inertia::render('Admin/Penelitian/Index', [
            'penelitian' => $penelitian,
            'tagihan' => $tagihan,
            'filters' => [
                'search_surat' => $searchSurat,
                'search_tagihan' => $searchTagihan
            ]
        ]);
    }

    public function teruskanLaboran($id)
    {
        $surat = SuratPenelitian::findOrFail($id);
        $surat->update(['status' => 'diteruskan_laboran']);

        return back()->with('success', 'Surat penelitian berhasil divalidasi dan diteruskan ke Laboran.');
    }
}