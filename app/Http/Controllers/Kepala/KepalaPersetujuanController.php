<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KepalaPersetujuanController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. Antrean Penghapusan Alat (Status Rusak / Hilang)
        $alatRusak = Alat::with(['kategori', 'lokasi'])
            ->whereIn('status', ['rusak', 'hilang'])
            ->when($search, function ($q) use ($search) {
                $q->where('nama_alat', 'like', "%{$search}%")
                  ->orWhere('kode_alat', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'page_alat')
            ->withQueryString();

        // 2. Antrean Maintenance Besar (Jenis Darurat/Korektif dalam status Proses)
        $maintenanceBesar = MaintenanceAlat::with('alat')
            ->where('status', 'proses')
            ->whereIn('jenis', ['korektif', 'darurat'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('alat', function ($sub) use ($search) {
                    $sub->where('nama_alat', 'like', "%{$search}%")
                        ->orWhere('kode_alat', 'like', "%{$search}%");
                })->orWhere('teknisi', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5, ['*'], 'page_maintenance')
            ->withQueryString();

        return Inertia::render('KepalaLaboran/Persetujuan/Index', [
            'alatRusak'        => $alatRusak,
            'maintenanceBesar' => $maintenanceBesar,
            'filters'          => ['search' => $search],
        ]);
    }

    // Persetujuan Penghapusan Alat
    public function approveDeleteAlat(Request $request, $id)
    {
        $request->validate(['catatan' => 'nullable|string']);

        $alat = Alat::findOrFail($id);
        $namaAlat = $alat->nama_alat;
        $kodeAlat = $alat->kode_alat;

        $alat->delete(); // Soft delete atau permanen sesuai konfigurasi model

        // 1. Catat Activity Log
        ActivityLog::create([
            'user_id'    => Auth::id(),
            'aktivitas'  => "Menyetujui penghapusan alat: {$namaAlat} ({$kodeAlat})",
            'ip_address' => $request->ip(),
            'browser'    => $request->header('User-Agent'),
        ]);

        // 2. Kirim Notifikasi ke Seluruh Laboran / Admin
        $laboranUsers = User::whereIn('role', ['laboran', 'admin'])->get();
        foreach ($laboranUsers as $user) {
            Notifikasi::create([
                'user_id'      => $user->id,
                'judul'        => 'Pengajuan Penghapusan Alat Disetujui',
                'isi'          => "Penghapusan alat {$namaAlat} ({$kodeAlat}) telah disetujui oleh Kepala Laboran." . ($request->catatan ? " Catatan: {$request->catatan}" : ''),
                'sudah_dibaca' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Penghapusan alat berhasil disetujui dan dihapus dari sistem.');
    }

    // Penolakan Penghapusan Alat (Kembalikan status ke tersedia)
    public function rejectDeleteAlat(Request $request, $id)
    {
        $request->validate(['catatan' => 'nullable|string']);

        $alat = Alat::findOrFail($id);
        $alat->update(['status' => 'tersedia']);

        // 1. Catat Activity Log
        ActivityLog::create([
            'user_id'    => Auth::id(),
            'aktivitas'  => "Menolak penghapusan alat: {$alat->nama_alat} ({$alat->kode_alat})",
            'ip_address' => $request->ip(),
            'browser'    => $request->header('User-Agent'),
        ]);

        // 2. Kirim Notifikasi ke Seluruh Laboran / Admin
        $laboranUsers = User::whereIn('role', ['laboran', 'admin'])->get();
        foreach ($laboranUsers as $user) {
            Notifikasi::create([
                'user_id'      => $user->id,
                'judul'        => 'Pengajuan Penghapusan Alat Ditolak',
                'isi'          => "Pengajuan penghapusan alat {$alat->nama_alat} ({$alat->kode_alat}) ditolak oleh Kepala Laboran. Status alat dikembalikan ke Tersedia." . ($request->catatan ? " Catatan: {$request->catatan}" : ''),
                'sudah_dibaca' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Pengajuan penghapusan alat ditolak, status alat dikembalikan ke Tersedia.');
    }

    // Persetujuan Maintenance
    public function approveMaintenance(Request $request, $id)
    {
        $request->validate(['catatan' => 'nullable|string']);

        $maintenance = MaintenanceAlat::with('alat')->findOrFail($id);
        
        $catatanInput = $request->catatan ? " | Catatan Tambahan: {$request->catatan}" : '';
        $maintenance->update([
            'keterangan' => ($maintenance->keterangan ? $maintenance->keterangan . ' | ' : '') . 'Disetujui oleh Kepala Laboran' . $catatanInput
        ]);

        // Update status alat terkait ke maintenance
        if ($maintenance->alat) {
            $maintenance->alat->update(['status' => 'maintenance']);
        }

        $namaAlat = $maintenance->alat->nama_alat ?? 'Alat';

        // 1. Catat Activity Log
        ActivityLog::create([
            'user_id'    => Auth::id(),
            'aktivitas'  => "Menyetujui maintenance besar untuk alat: {$namaAlat} (Jenis: {$maintenance->jenis})",
            'ip_address' => $request->ip(),
            'browser'    => $request->header('User-Agent'),
        ]);

        // 2. Kirim Notifikasi ke Seluruh Laboran / Admin
        $laboranUsers = User::whereIn('role', ['laboran', 'admin'])->get();
        foreach ($laboranUsers as $user) {
            Notifikasi::create([
                'user_id'      => $user->id,
                'judul'        => 'Pengajuan Maintenance Disetujui',
                'isi'          => "Pengajuan maintenance ({$maintenance->jenis}) untuk alat {$namaAlat} telah disetujui oleh Kepala Laboran.",
                'sudah_dibaca' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Pengajuan Maintenance Besar berhasil disetujui.');
    }

    // Penolakan Maintenance
    public function rejectMaintenance(Request $request, $id)
    {
        $request->validate(['catatan' => 'nullable|string']);

        $maintenance = MaintenanceAlat::with('alat')->findOrFail($id);
        $namaAlat = $maintenance->alat->nama_alat ?? 'Alat';
        $jenisMaintenance = $maintenance->jenis;

        $maintenance->delete();

        // 1. Catat Activity Log
        ActivityLog::create([
            'user_id'    => Auth::id(),
            'aktivitas'  => "Menolak/membatalkan maintenance besar untuk alat: {$namaAlat} (Jenis: {$jenisMaintenance})",
            'ip_address' => $request->ip(),
            'browser'    => $request->header('User-Agent'),
        ]);

        // 2. Kirim Notifikasi ke Seluruh Laboran / Admin
        $laboranUsers = User::whereIn('role', ['laboran', 'admin'])->get();
        foreach ($laboranUsers as $user) {
            Notifikasi::create([
                'user_id'      => $user->id,
                'judul'        => 'Pengajuan Maintenance Ditolak',
                'isi'          => "Pengajuan maintenance ({$jenisMaintenance}) untuk alat {$namaAlat} ditolak/dibatalkan oleh Kepala Laboran." . ($request->catatan ? " Catatan: {$request->catatan}" : ''),
                'sudah_dibaca' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Pengajuan maintenance dibatalkan/ditolak.');
    }
}