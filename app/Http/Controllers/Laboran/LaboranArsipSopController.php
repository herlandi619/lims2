<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Arsip;
use App\Models\Notifikasi;
use App\Models\Sop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LaboranArsipSopController extends Controller
{
    public function index(Request $request)
    {
        $searchArsip = $request->input('search_arsip');
        $searchSop = $request->input('search_sop');
        $activeTab = $request->input('tab', 'arsip');

        // Data Arsip (Paginate 5)
        $arsipList = Arsip::with('user')
            ->when($searchArsip, function ($q) use ($searchArsip) {
                $q->where('judul', 'like', "%{$searchArsip}%")
                  ->orWhere('kategori', 'like', "%{$searchArsip}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'arsip_page')
            ->withQueryString();

        // Data SOP (Paginate 5)
        $sopList = Sop::with('pembuat')
            ->when($searchSop, function ($q) use ($searchSop) {
                $q->where('judul_sop', 'like', "%{$searchSop}%")
                  ->orWhere('kode_sop', 'like', "%{$searchSop}%")
                  ->orWhere('kategori', 'like', "%{$searchSop}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'sop_page')
            ->withQueryString();

        return Inertia::render('Laboran/ArsipSop/Index', [
            'arsipList' => $arsipList,
            'sopList'   => $sopList,
            'filters'   => [
                'search_arsip' => $searchArsip,
                'search_sop'   => $searchSop,
                'tab'          => $activeTab,
            ],
        ]);
    }

    // ---------------- ARSIP ACTIONS ----------------
    public function storeArsip(Request $request)
    {
        $validated = $request->validate([
            'judul'    => 'required|string|max:255',
            'kategori' => 'required|in:sop,modul,manual_alat,dokumen,lainnya',
            'file'     => 'required|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar|max:5048',
        ]);

        DB::transaction(function () use ($validated, $request) {
            if ($request->hasFile('file')) {
                $validated['file'] = $request->file('file')->store('arsip_dokumen', 'public');
            }

            $validated['upload_by'] = auth()->id();

            // 1. STORE ARSIP
            $arsip = Arsip::create($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Mengunggah dokumen arsip baru: {$arsip->judul}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Arsip Berhasil Diunggah',
                'isi'         => "Dokumen arsip '{$arsip->judul}' telah berhasil diunggah ke sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'File arsip berhasil diupload!');
    }

    public function updateArsip(Request $request, Arsip $arsip)
    {
        $validated = $request->validate([
            'judul'    => 'required|string|max:255',
            'kategori' => 'required|in:sop,modul,manual_alat,dokumen,lainnya',
            'file'     => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar|max:5048',
        ]);

        DB::transaction(function () use ($arsip, $validated, $request) {
            // Cek jika user mengupload file baru
            if ($request->hasFile('file')) {
                if ($arsip->file && Storage::disk('public')->exists($arsip->file)) {
                    Storage::disk('public')->delete($arsip->file);
                }
                $validated['file'] = $request->file('file')->store('arsip_dokumen', 'public');
            } else {
                unset($validated['file']);
            }

            // 1. UPDATE ARSIP
            $arsip->update($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui dokumen arsip: {$arsip->judul}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Arsip Berhasil Diperbarui',
                'isi'         => "Dokumen arsip '{$arsip->judul}' telah berhasil diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data arsip berhasil diperbarui!');
    }

    public function destroyArsip(Request $request, Arsip $arsip)
    {
        DB::transaction(function () use ($arsip, $request) {
            $judulArsip = $arsip->judul;

            if ($arsip->file && Storage::disk('public')->exists($arsip->file)) {
                Storage::disk('public')->delete($arsip->file);
            }

            // 1. DELETE ARSIP
            $arsip->delete();

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus dokumen arsip: {$judulArsip}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Arsip Berhasil Dihapus',
                'isi'         => "Dokumen arsip '{$judulArsip}' telah dihapus dari sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'File arsip berhasil dihapus!');
    }

    // ---------------- SOP ACTIONS ----------------
    public function storeSop(Request $request)
    {
        $validated = $request->validate([
            'kode_sop'  => 'required|string|unique:sops,kode_sop|max:255',
            'judul_sop' => 'required|string|max:255',
            'kategori'  => 'required|in:penggunaan_alat,keselamatan_kerja,penggunaan_ruangan,peminjaman_alat,lainnya',
            'versi'     => 'required|string|max:50',
            'file_sop'  => 'required|file|mimes:pdf,doc,docx|max:5048',
            'deskripsi' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            if ($request->hasFile('file_sop')) {
                $validated['file_sop'] = $request->file('file_sop')->store('sop_dokumen', 'public');
            }

            $validated['created_by'] = auth()->id();

            // 1. STORE SOP
            $sop = Sop::create($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan SOP baru: {$sop->judul_sop} (Kode: {$sop->kode_sop})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'SOP Berhasil Ditambahkan',
                'isi'         => "Dokumen SOP '{$sop->judul_sop}' ({$sop->kode_sop}) telah berhasil ditambahkan.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Dokumen SOP berhasil ditambahkan!');
    }

    public function updateSop(Request $request, Sop $sop)
    {
        $validated = $request->validate([
            'kode_sop'  => 'required|string|max:255|unique:sops,kode_sop,' . $sop->id,
            'judul_sop' => 'required|string|max:255',
            'kategori'  => 'required|in:penggunaan_alat,keselamatan_kerja,penggunaan_ruangan,peminjaman_alat,lainnya',
            'versi'     => 'required|string|max:50',
            'file_sop'  => 'nullable|file|mimes:pdf,doc,docx|max:5048',
            'deskripsi' => 'nullable|string',
        ]);

        DB::transaction(function () use ($sop, $validated, $request) {
            if ($request->hasFile('file_sop')) {
                if ($sop->file_sop && Storage::disk('public')->exists($sop->file_sop)) {
                    Storage::disk('public')->delete($sop->file_sop);
                }
                $validated['file_sop'] = $request->file('file_sop')->store('sop_dokumen', 'public');
            } else {
                unset($validated['file_sop']);
            }

            // 1. UPDATE SOP
            $sop->update($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui dokumen SOP: {$sop->judul_sop} (Kode: {$sop->kode_sop})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'SOP Berhasil Diperbarui',
                'isi'         => "Dokumen SOP '{$sop->judul_sop}' telah berhasil diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Dokumen SOP berhasil diperbarui!');
    }

    public function destroySop(Request $request, Sop $sop)
    {
        DB::transaction(function () use ($sop, $request) {
            $judulSop = $sop->judul_sop;
            $kodeSop  = $sop->kode_sop;

            if ($sop->file_sop && Storage::disk('public')->exists($sop->file_sop)) {
                Storage::disk('public')->delete($sop->file_sop);
            }

            // 1. DELETE SOP
            $sop->delete();

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus dokumen SOP: {$judulSop} (Kode: {$kodeSop})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'SOP Berhasil Dihapus',
                'isi'         => "Dokumen SOP '{$judulSop}' ({$kodeSop}) telah dihapus dari sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Dokumen SOP berhasil dihapus!');
    }
}