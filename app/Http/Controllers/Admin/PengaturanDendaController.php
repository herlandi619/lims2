<?php

// app/Http/Controllers/Admin/PengaturanDendaController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengaturanDenda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaturanDendaController extends Controller
{
    /**
     * Tampilkan halaman formulir pengaturan denda.
     */
    public function index()
    {
        // Ambil data pertama, jika tidak ada buat default-nya
        $pengaturan = PengaturanDenda::firstOrCreate(
            ['id' => 1],
            [
                'denda_per_hari'     => 5000,
                'denda_rusak_ringan' => 25000,
                'denda_rusak_berat'  => 50000,
            ]
        );

        return Inertia::render('Admin/PengaturanDenda/Index', [
            'pengaturan' => $pengaturan
        ]);
    }

    /**
     * Simpan / perbarui perubahan nominal denda.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'denda_per_hari'     => 'required|numeric|min:0',
            'denda_rusak_ringan' => 'required|numeric|min:0',
            'denda_rusak_berat'  => 'required|numeric|min:0',
        ]);

        $pengaturan = PengaturanDenda::firstOrCreate(['id' => 1]);
        $pengaturan->update($validated);

        return redirect()->back()->with('success', 'Pengaturan denda berhasil diperbarui!');
    }
}