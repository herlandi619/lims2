<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Models\Sop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MahasiswaDokumenSopController extends Controller
{
    public function index(Request $request)
    {
        $searchArsip = $request->input('search_arsip');
        $searchSop = $request->input('search_sop');

        $arsip = Arsip::with('user')
            ->when($searchArsip, function ($query, $search) {
                $query->where('judul', 'like', "%{$search}%")
                      ->orWhere('kategori', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5, ['*'], 'arsip_page')
            ->withQueryString();

        $sop = Sop::with('pembuat')
            ->when($searchSop, function ($query, $search) {
                $query->where('judul_sop', 'like', "%{$search}%")
                      ->orWhere('kode_sop', 'like', "%{$search}%")
                      ->orWhere('kategori', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5, ['*'], 'sop_page')
            ->withQueryString();

        return Inertia::render('Mahasiswa/DokumenSop/Index', [
            'arsip' => $arsip,
            'sop' => $sop,
            'filters' => [
                'search_arsip' => $searchArsip,
                'search_sop' => $searchSop,
                'active_tab' => $request->input('tab', 'arsip'),
            ]
        ]);
    }

    // --- CRUD ARSIP ---
    public function storeArsip(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|in:sop,modul,manual_alat,dokumen,lainnya',
            'file' => 'required|file|mimes:pdf,docx,doc,zip|max:10240',
        ]);

        $filePath = $request->file('file')->store('arsip_files', 'public');

        Arsip::create([
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'file' => $filePath,
            'upload_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Arsip berhasil ditambahkan.');
    }

    public function updateArsip(Request $request, $id)
    {
        $arsip = Arsip::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|in:sop,modul,manual_alat,dokumen,lainnya',
            'file' => 'nullable|file|mimes:pdf,docx,doc,zip|max:10240',
        ]);

        $filePath = $arsip->file;
        if ($request->hasFile('file')) {
            if (Storage::disk('public')->exists($arsip->file)) {
                Storage::disk('public')->delete($arsip->file);
            }
            $filePath = $request->file('file')->store('arsip_files', 'public');
        }

        $arsip->update([
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'file' => $filePath,
        ]);

        return redirect()->back()->with('success', 'Arsip berhasil diperbarui.');
    }

    public function destroyArsip($id)
    {
        $arsip = Arsip::findOrFail($id);
        if (Storage::disk('public')->exists($arsip->file)) {
            Storage::disk('public')->delete($arsip->file);
        }
        $arsip->delete();

        return redirect()->back()->with('success', 'Arsip berhasil dihapus.');
    }

    // --- CRUD SOP ---
    public function storeSop(Request $request)
    {
        $request->validate([
            'kode_sop' => 'required|string|unique:sops,kode_sop',
            'judul_sop' => 'required|string|max:255',
            'kategori' => 'required|in:penggunaan_alat,keselamatan_kerja,penggunaan_ruangan,peminjaman_alat,lainnya',
            'versi' => 'required|string',
            'file_sop' => 'required|file|mimes:pdf|max:10240',
            'deskripsi' => 'nullable|string',
        ]);

        $filePath = $request->file('file_sop')->store('sop_files', 'public');

        Sop::create([
            'kode_sop' => $request->kode_sop,
            'judul_sop' => $request->judul_sop,
            'kategori' => $request->kategori,
            'versi' => $request->versi,
            'file_sop' => $filePath,
            'deskripsi' => $request->deskripsi,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'SOP berhasil ditambahkan.');
    }

    public function updateSop(Request $request, $id)
    {
        $sop = Sop::findOrFail($id);

        $request->validate([
            'kode_sop' => 'required|string|unique:sops,kode_sop,' . $id,
            'judul_sop' => 'required|string|max:255',
            'kategori' => 'required|in:penggunaan_alat,keselamatan_kerja,penggunaan_ruangan,peminjaman_alat,lainnya',
            'versi' => 'required|string',
            'file_sop' => 'nullable|file|mimes:pdf|max:10240',
            'deskripsi' => 'nullable|string',
        ]);

        $filePath = $sop->file_sop;
        if ($request->hasFile('file_sop')) {
            if (Storage::disk('public')->exists($sop->file_sop)) {
                Storage::disk('public')->delete($sop->file_sop);
            }
            $filePath = $request->file('file_sop')->store('sop_files', 'public');
        }

        $sop->update([
            'kode_sop' => $request->kode_sop,
            'judul_sop' => $request->judul_sop,
            'kategori' => $request->kategori,
            'versi' => $request->versi,
            'file_sop' => $filePath,
            'deskripsi' => $request->deskripsi,
        ]);

        return redirect()->back()->with('success', 'SOP berhasil diperbarui.');
    }

    public function destroySop($id)
    {
        $sop = Sop::findOrFail($id);
        if (Storage::disk('public')->exists($sop->file_sop)) {
            Storage::disk('public')->delete($sop->file_sop);
        }
        $sop->delete();

        return redirect()->back()->with('success', 'SOP berhasil dihapus.');
    }
}