<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriAlat;
use App\Models\Supplier;
use App\Models\LokasiAlat;
use App\Models\Ruangan;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminMasterDataController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->get('tab', 'kategori');
        $search = $request->get('search', '');

        // 1. Kategori Query
        $kategoriQuery = KategoriAlat::query();
        if ($activeTab === 'kategori' && $search) {
            $kategoriQuery->where('nama_kategori', 'like', "%{$search}%")
                ->orWhere('deskripsi', 'like', "%{$search}%");
        }

        // 2. Supplier Query
        $supplierQuery = Supplier::query();
        if ($activeTab === 'supplier' && $search) {
            $supplierQuery->where('nama_supplier', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telepon', 'like', "%{$search}%");
        }

        // 3. Lokasi Query
        $lokasiQuery = LokasiAlat::query();
        if ($activeTab === 'lokasi' && $search) {
            $lokasiQuery->where('nama_lokasi', 'like', "%{$search}%")
                ->orWhere('deskripsi', 'like', "%{$search}%");
        }

        // 4. Ruangan Query
        $ruanganQuery = Ruangan::query();
        if ($activeTab === 'ruangan' && $search) {
            $ruanganQuery->where('kode_ruangan', 'like', "%{$search}%")
                ->orWhere('nama_ruangan', 'like', "%{$search}%");
        }

        return Inertia::render('Admin/MasterData/Index', [
            'kategori' => $kategoriQuery->latest()->paginate(5, ['*'], 'kategori_page')->withQueryString(),
            'supplier' => $supplierQuery->latest()->paginate(5, ['*'], 'supplier_page')->withQueryString(),
            'lokasi'   => $lokasiQuery->latest()->paginate(5, ['*'], 'lokasi_page')->withQueryString(),
            'ruangan'  => $ruanganQuery->latest()->paginate(5, ['*'], 'ruangan_page')->withQueryString(),
            'filters'  => [
                'tab'    => $activeTab,
                'search' => $search,
            ],
        ]);
    }

    // --- KATEGORI ALAT ---
    public function storeKategori(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategori_alat,nama_kategori',
            'deskripsi'     => 'nullable|string',
        ]);

        KategoriAlat::create($validated);
        $this->logActivity("Menambahkan kategori alat baru: {$request->nama_kategori}");

        return redirect()->back()->with('success', 'Kategori alat berhasil ditambahkan!');
    }

    public function updateKategori(Request $request, KategoriAlat $kategoriAlat)
    {
        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255', Rule::unique('kategori_alat')->ignore($kategoriAlat->id)],
            'deskripsi'     => 'nullable|string',
        ]);

        $kategoriAlat->update($validated);
        $this->logActivity("Mengubah kategori alat: {$kategoriAlat->nama_kategori}");

        return redirect()->back()->with('success', 'Kategori alat berhasil diperbarui!');
    }

    public function destroyKategori(KategoriAlat $kategoriAlat)
    {
        $nama = $kategoriAlat->nama_kategori;
        $kategoriAlat->delete();
        $this->logActivity("Menghapus kategori alat: {$nama}");

        return redirect()->back()->with('success', 'Kategori alat berhasil dihapus!');
    }

    // --- SUPPLIER ---
    public function storeSupplier(Request $request)
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'alamat'        => 'nullable|string',
            'telepon'       => 'nullable|string|max:20',
            'email'         => 'nullable|email|unique:supplier,email',
        ]);

        Supplier::create($validated);
        $this->logActivity("Menambahkan supplier baru: {$request->nama_supplier}");

        return redirect()->back()->with('success', 'Supplier berhasil ditambahkan!');
    }

    public function updateSupplier(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'alamat'        => 'nullable|string',
            'telepon'       => 'nullable|string|max:20',
            'email'         => ['nullable', 'email', Rule::unique('supplier')->ignore($supplier->id)],
        ]);

        $supplier->update($validated);
        $this->logActivity("Mengubah data supplier: {$supplier->nama_supplier}");

        return redirect()->back()->with('success', 'Supplier berhasil diperbarui!');
    }

    public function destroySupplier(Supplier $supplier)
    {
        $nama = $supplier->nama_supplier;
        $supplier->delete();
        $this->logActivity("Menghapus supplier: {$nama}");

        return redirect()->back()->with('success', 'Supplier berhasil dihapus!');
    }

    // --- LOKASI ALAT ---
    public function storeLokasi(Request $request)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);

        LokasiAlat::create($validated);
        $this->logActivity("Menambahkan lokasi alat baru: {$request->nama_lokasi}");

        return redirect()->back()->with('success', 'Lokasi alat berhasil ditambahkan!');
    }

    public function updateLokasi(Request $request, LokasiAlat $lokasiAlat)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);

        $lokasiAlat->update($validated);
        $this->logActivity("Mengubah lokasi alat: {$lokasiAlat->nama_lokasi}");

        return redirect()->back()->with('success', 'Lokasi alat berhasil diperbarui!');
    }

    public function destroyLokasi(LokasiAlat $lokasiAlat)
    {
        $nama = $lokasiAlat->nama_lokasi;
        $lokasiAlat->delete();
        $this->logActivity("Menghapus lokasi alat: {$nama}");

        return redirect()->back()->with('success', 'Lokasi alat berhasil dihapus!');
    }

    // --- RUANGAN ---
    public function storeRuangan(Request $request)
    {
        $validated = $request->validate([
            'kode_ruangan' => 'required|string|unique:ruangan,kode_ruangan|max:50',
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas'    => 'nullable|integer|min:0',
            'lokasi'       => 'nullable|string',
            'status'       => 'required|in:aktif,nonaktif',
        ]);

        Ruangan::create($validated);
        $this->logActivity("Menambahkan ruangan baru: {$request->nama_ruangan}");

        return redirect()->back()->with('success', 'Ruangan berhasil ditambahkan!');
    }

    public function updateRuangan(Request $request, Ruangan $ruangan)
    {
        $validated = $request->validate([
            'kode_ruangan' => ['required', 'string', 'max:50', Rule::unique('ruangan')->ignore($ruangan->id)],
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas'    => 'nullable|integer|min:0',
            'lokasi'       => 'nullable|string',
            'status'       => 'required|in:aktif,nonaktif',
        ]);

        $ruangan->update($validated);
        $this->logActivity("Mengubah data ruangan: {$ruangan->nama_ruangan}");

        return redirect()->back()->with('success', 'Ruangan berhasil diperbarui!');
    }

    public function destroyRuangan(Ruangan $ruangan)
    {
        $nama = $ruangan->nama_ruangan;
        $ruangan->delete();
        $this->logActivity("Menghapus ruangan: {$nama}");

        return redirect()->back()->with('success', 'Ruangan berhasil dihapus!');
    }

    private function logActivity($activity)
    {
        ActivityLog::create([
            'user_id'   => auth()->id(),
            'aktivitas' => $activity,
            'ip_address' => request()->ip(),
            'browser'    => request()->header('User-Agent'),
        ]);
    }
}