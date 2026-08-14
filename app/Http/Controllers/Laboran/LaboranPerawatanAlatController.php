<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\KalibrasiAlat;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\RiwayatAlat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LaboranPerawatanAlatController extends Controller
{
    public function index(Request $request)
    {
        $searchMaintenance = $request->input('search_maintenance');
        $searchKalibrasi = $request->input('search_kalibrasi');
        $activeTab = $request->input('tab', 'maintenance');

        // Data Maintenance Alat (Paginate 5)
        $maintenance = MaintenanceAlat::with('alat')
            ->when($searchMaintenance, function ($q) use ($searchMaintenance) {
                $q->whereHas('alat', fn($a) => $a->where('nama_alat', 'like', "%{$searchMaintenance}%"))
                  ->orWhere('teknisi', 'like', "%{$searchMaintenance}%")
                  ->orWhere('jenis', 'like', "%{$searchMaintenance}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'maint_page')
            ->withQueryString();

        // Data Kalibrasi Alat (Paginate 5)
        $kalibrasi = KalibrasiAlat::with('alat')
            ->when($searchKalibrasi, function ($q) use ($searchKalibrasi) {
                $q->whereHas('alat', fn($a) => $a->where('nama_alat', 'like', "%{$searchKalibrasi}%"))
                  ->orWhere('hasil', 'like', "%{$searchKalibrasi}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'kalib_page')
            ->withQueryString();

        // Master Data Alat untuk Dropdown
        $alatList = Alat::all();

        return Inertia::render('Laboran/PerawatanAlat/Index', [
            'maintenanceList' => $maintenance,
            'kalibrasiList' => $kalibrasi,
            'alatList' => $alatList,
            'filters' => [
                'search_maintenance' => $searchMaintenance,
                'search_kalibrasi' => $searchKalibrasi,
                'tab' => $activeTab,
            ],
        ]);
    }

    // ---------------- MAINTENANCE ACTIONS ----------------
    public function storeMaintenance(Request $request)
    {
        $validated = $request->validate([
            'alat_id'             => 'required|exists:alat,id',
            'tanggal_maintenance' => 'required|date',
            'jenis'               => 'required|in:preventif,korektif,darurat',
            'teknisi'             => 'nullable|string|max:255',
            'biaya'               => 'required|numeric|min:0',
            'status'              => 'required|in:proses,selesai',
            'keterangan'          => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // 1. STORE MAINTENANCE
            $maint = MaintenanceAlat::create($validated);
            $namaAlat = $maint->alat->nama_alat ?? 'Alat';

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $maint->alat_id,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Perawatan (Maintenance)',
                'keterangan' => "Pencatatan maintenance jenis {$maint->jenis} (Status: {$maint->status})",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan data maintenance untuk alat: {$namaAlat}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Maintenance Berhasil Ditambahkan',
                'isi'         => "Data maintenance alat {$namaAlat} jenis {$maint->jenis} telah berhasil dicatat.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data maintenance berhasil ditambahkan!');
    }

    public function updateMaintenance(Request $request, MaintenanceAlat $maintenance)
    {
        $validated = $request->validate([
            'alat_id'             => 'required|exists:alat,id',
            'tanggal_maintenance' => 'required|date',
            'jenis'               => 'required|in:preventif,korektif,darurat',
            'teknisi'             => 'nullable|string|max:255',
            'biaya'               => 'required|numeric|min:0',
            'status'              => 'required|in:proses,selesai',
            'keterangan'          => 'nullable|string',
        ]);

        DB::transaction(function () use ($maintenance, $validated, $request) {
            // 1. UPDATE MAINTENANCE
            $maintenance->update($validated);
            $namaAlat = $maintenance->alat->nama_alat ?? 'Alat';

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $maintenance->alat_id,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Update Maintenance',
                'keterangan' => "Memperbarui data maintenance jenis {$maintenance->jenis} (Status: {$maintenance->status})",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui data maintenance alat: {$namaAlat}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Maintenance Berhasil Diperbarui',
                'isi'         => "Data maintenance alat {$namaAlat} telah diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data maintenance berhasil diperbarui!');
    }

    public function destroyMaintenance(Request $request, MaintenanceAlat $maintenance)
    {
        DB::transaction(function () use ($maintenance, $request) {
            $namaAlat = $maintenance->alat->nama_alat ?? 'Alat';
            $alatId   = $maintenance->alat_id;

            // 1. DELETE MAINTENANCE
            $maintenance->delete();

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $alatId,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Hapus Maintenance',
                'keterangan' => "Menghapus catatan maintenance alat {$namaAlat}",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus data maintenance alat: {$namaAlat}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Maintenance Berhasil Dihapus',
                'isi'         => "Data maintenance alat {$namaAlat} telah dihapus.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data maintenance berhasil dihapus!');
    }

    // ---------------- KALIBRASI ACTIONS ----------------
    public function storeKalibrasi(Request $request)
    {
        $validated = $request->validate([
            'alat_id'              => 'required|exists:alat,id',
            'tanggal_kalibrasi'    => 'required|date',
            'kalibrasi_berikutnya' => 'required|date|after_or_equal:tanggal_kalibrasi',
            'hasil'                => 'required|in:lulus,tidak_lulus',
            'sertifikat'           => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'keterangan'           => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            if ($request->hasFile('sertifikat')) {
                $validated['sertifikat'] = $request->file('sertifikat')->store('sertifikat_kalibrasi', 'public');
            }

            // 1. STORE KALIBRASI
            $kalibrasi = KalibrasiAlat::create($validated);
            $namaAlat  = $kalibrasi->alat->nama_alat ?? 'Alat';

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $kalibrasi->alat_id,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Kalibrasi Alat',
                'keterangan' => "Hasil kalibrasi: {$kalibrasi->hasil}. Kalibrasi berikutnya: {$kalibrasi->kalibrasi_berikutnya}",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menambahkan data kalibrasi alat: {$namaAlat} (Hasil: {$kalibrasi->hasil})",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Kalibrasi Berhasil Ditambahkan',
                'isi'         => "Data kalibrasi alat {$namaAlat} (Hasil: {$kalibrasi->hasil}) telah disimpan.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data kalibrasi berhasil ditambahkan!');
    }

    public function updateKalibrasi(Request $request, KalibrasiAlat $kalibrasi)
    {
        $validated = $request->validate([
            'alat_id'              => 'required|exists:alat,id',
            'tanggal_kalibrasi'    => 'required|date',
            'kalibrasi_berikutnya' => 'required|date',
            'hasil'                => 'required|in:lulus,tidak_lulus',
            'sertifikat'           => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'keterangan'           => 'nullable|string',
        ]);

        DB::transaction(function () use ($kalibrasi, $validated, $request) {
            if ($request->hasFile('sertifikat')) {
                if ($kalibrasi->sertifikat) {
                    Storage::disk('public')->delete($kalibrasi->sertifikat);
                }
                $validated['sertifikat'] = $request->file('sertifikat')->store('sertifikat_kalibrasi', 'public');
            }

            // 1. UPDATE KALIBRASI
            $kalibrasi->update($validated);
            $namaAlat = $kalibrasi->alat->nama_alat ?? 'Alat';

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $kalibrasi->alat_id,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Update Kalibrasi',
                'keterangan' => "Memperbarui data kalibrasi alat (Hasil: {$kalibrasi->hasil})",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Memperbarui data kalibrasi alat: {$namaAlat}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Kalibrasi Berhasil Diperbarui',
                'isi'         => "Data kalibrasi alat {$namaAlat} telah diperbarui.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data kalibrasi berhasil diperbarui!');
    }

    public function destroyKalibrasi(Request $request, KalibrasiAlat $kalibrasi)
    {
        DB::transaction(function () use ($kalibrasi, $request) {
            $namaAlat = $kalibrasi->alat->nama_alat ?? 'Alat';
            $alatId   = $kalibrasi->alat_id;

            if ($kalibrasi->sertifikat) {
                Storage::disk('public')->delete($kalibrasi->sertifikat);
            }

            // 1. DELETE KALIBRASI
            $kalibrasi->delete();

            // 2. LOG RIWAYAT ALAT
            RiwayatAlat::create([
                'alat_id'    => $alatId,
                'user_id'    => auth()->id(),
                'aktivitas'  => 'Hapus Kalibrasi',
                'keterangan' => "Menghapus record kalibrasi alat {$namaAlat}",
            ]);

            // 3. STORE ACTIVITY LOG
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'aktivitas'  => "Menghapus data kalibrasi alat: {$namaAlat}",
                'ip_address' => $request->ip(),
                'browser'    => substr($request->userAgent() ?? '', 0, 255),
            ]);

            // 4. STORE NOTIFIKASI
            Notifikasi::create([
                'user_id'     => auth()->id(),
                'judul'       => 'Kalibrasi Berhasil Dihapus',
                'isi'         => "Data kalibrasi alat {$namaAlat} telah dihapus.",
                'sudah_dibaca' => false,
            ]);
        });

        return back()->with('success', 'Data kalibrasi berhasil dihapus!');
    }
}