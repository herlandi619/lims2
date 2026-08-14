<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\KategoriAlat;
use App\Models\LokasiAlat;
use App\Models\Notifikasi;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LaboranAlatController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $alat = Alat::with(['kategori', 'supplier', 'lokasi'])
            ->when($search, function ($q) use ($search) {
                $q->where('nama_alat', 'like', "%{$search}%")
                  ->orWhere('kode_alat', 'like', "%{$search}%")
                  ->orWhere('merk', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Laboran/Alat/Index', [
            'alat' => $alat,
            'kategori' => KategoriAlat::all(),
            'supplier' => Supplier::all(),
            'lokasi' => LokasiAlat::all(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategori_alat,id',
            'supplier_id' => 'nullable|exists:supplier,id',
            'lokasi_id' => 'required|exists:lokasi_alat,id',
            'nama_alat' => 'required|string|max:255',
            'merk' => 'nullable|string|max:255',
            'spesifikasi' => 'nullable|string',
            'jumlah_stok' => 'required|integer|min:1',
            'kondisi' => 'required|in:baik,cukup,rusak',
            'status' => 'required|in:tersedia,dipinjam,maintenance,rusak,hilang',
            'tanggal_pembelian' => 'nullable|date',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'keterangan' => 'nullable|string',
        ]);

        // Auto Generate Kode Alat & QR Code Unik
        $validated['kode_alat'] = 'ALT-' . strtoupper(Str::random(6));
        $validated['qr_code'] = 'QR-' . strtoupper(Str::random(10));
        $validated['stok_tersedia'] = $validated['jumlah_stok'];

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('alat', 'public');
        }

        DB::transaction(function () use ($validated, $request) {
            // 1. STORE ALAT
            $alat = Alat::create($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan alat baru: {$alat->nama_alat} ({$alat->kode_alat})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI (Kirim ke user yang sedang login)
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Tambah Alat Berhasil',
                'isi'         => "Alat '{$alat->nama_alat}' dengan kode {$alat->kode_alat} berhasil ditambahkan ke inventaris.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data alat berhasil ditambahkan!');
    }

    public function update(Request $request, Alat $alat)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategori_alat,id',
            'supplier_id' => 'nullable|exists:supplier,id',
            'lokasi_id' => 'required|exists:lokasi_alat,id',
            'nama_alat' => 'required|string|max:255',
            'merk' => 'nullable|string|max:255',
            'spesifikasi' => 'nullable|string',
            'jumlah_stok' => 'required|integer|min:0',
            'stok_tersedia' => 'required|integer|min:0',
            'kondisi' => 'required|in:baik,cukup,rusak',
            'status' => 'required|in:tersedia,dipinjam,maintenance,rusak,hilang',
            'tanggal_pembelian' => 'nullable|date',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'keterangan' => 'nullable|string',
        ]);

        // OLAH FOTO: HANYA UBAH JIKA ADA FILE BARU
        if ($request->hasFile('foto')) {
            if ($alat->foto && Storage::disk('public')->exists($alat->foto)) {
                Storage::disk('public')->delete($alat->foto);
            }
            $validated['foto'] = $request->file('foto')->store('alat', 'public');
        } else {
            unset($validated['foto']);
        }

        DB::transaction(function () use ($alat, $validated, $request) {
            // 1. UPDATE ALAT
            $alat->update($validated);

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui data alat: {$alat->nama_alat} ({$alat->kode_alat})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Perbaruan Alat Berhasil',
                'isi'         => "Data alat '{$alat->nama_alat}' ({$alat->kode_alat}) telah berhasil diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data alat berhasil diperbarui!');
    }

    public function destroy(Request $request, Alat $alat)
    {
        DB::transaction(function () use ($alat, $request) {
            $namaAlat = $alat->nama_alat;
            $kodeAlat = $alat->kode_alat;

            // Hapus foto jika ada
            if ($alat->foto && Storage::disk('public')->exists($alat->foto)) {
                Storage::disk('public')->delete($alat->foto);
            }

            // 1. DELETE ALAT
            $alat->delete();

            // 2. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus data alat: {$namaAlat} ({$kodeAlat})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 3. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Penghapusan Alat Berhasil',
                'isi'         => "Data alat '{$namaAlat}' ({$kodeAlat}) telah dihapus dari sistem.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data alat berhasil dihapus!');
    }
}