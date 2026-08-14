<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KategoriAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MahasiswaInventarisController extends Controller
{
    public function index(Request $request)
    {
        $query = Alat::with(['kategori', 'lokasi', 'supplier']);

        // Fitur Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_alat', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_alat', 'like', '%' . $request->search . '%')
                  ->orWhere('merk', 'like', '%' . $request->search . '%');
            });
        }

        // Fitur Filter Kategori
        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Paginate 5 Data
        $alat = $query->paginate(5)->withQueryString();
        $kategori = KategoriAlat::all();

        // Jika ada request detail_id (melalui Inertia)
        $detailAlat = null;
        if ($request->detail_id) {
            $detailAlat = Alat::with([
                'kategori', 
                'lokasi', 
                'supplier', 
                'maintenanceAlat' => function($q) {
                    $q->latest()->first();
                }, 
                'kalibrasiAlat' => function($q) {
                    $q->latest()->first();
                }, 
                'riwayatAlat.user' => function($q) {
                    $q->latest()->take(5);
                }
            ])->find($request->detail_id);
        }

        // Jika ada request scan_qr (melalui Inertia)
        if ($request->scan_qr) {
            $detailAlat = Alat::with([
                'kategori', 
                'lokasi', 
                'supplier', 
                'maintenanceAlat' => function($q) {
                    $q->latest()->first();
                }, 
                'kalibrasiAlat' => function($q) {
                    $q->latest()->first();
                }, 
                'riwayatAlat.user' => function($q) {
                    $q->latest()->take(5);
                }
            ])->where('qr_code', $request->scan_qr)->first();
        }

        return Inertia::render('Mahasiswa/Inventaris/Index', [
            'alat' => $alat,
            'kategori' => $kategori,
            'detailAlat' => $detailAlat,
            'filters' => $request->only(['search', 'kategori_id', 'detail_id', 'scan_qr']),
        ]);
    }
}