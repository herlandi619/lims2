<?php


use App\Http\Controllers\Admin\AdminActivityLogController;
use App\Http\Controllers\Admin\AdminBackupController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminMasterDataController;
use App\Http\Controllers\Admin\AdminTicketController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\PengaturanDendaController;
use App\Http\Controllers\Dosen\DosenAbsensiController;
use App\Http\Controllers\Dosen\DosenBookingRuanganController;
use App\Http\Controllers\Dosen\DosenDashboardController;
use App\Http\Controllers\Dosen\DosenDokumenSopController;
use App\Http\Controllers\Dosen\DosenInventarisController;
use App\Http\Controllers\Dosen\DosenJadwalLaboratoriumController;
use App\Http\Controllers\Dosen\DosenPeminjamanController;
use App\Http\Controllers\Dosen\DosenProfilController;
use App\Http\Controllers\Kepala\KepalaDashboardStatistikController;
use App\Http\Controllers\Kepala\KepalaLaporanController;
use App\Http\Controllers\Kepala\KepalaMonitoringController;
use App\Http\Controllers\Kepala\KepalaPersetujuanController;
use App\Http\Controllers\Kepala\KepalaTicketController;
use App\Http\Controllers\Laboran\LaboranAbsensiController;
use App\Http\Controllers\Laboran\LaboranAlatController;
use App\Http\Controllers\Laboran\LaboranArsipSopController;
use App\Http\Controllers\Laboran\LaboranDashboardController;
use App\Http\Controllers\Laboran\LaboranLaporanController;
use App\Http\Controllers\Laboran\LaboranManajemenRuanganController;
use App\Http\Controllers\Laboran\LaboranPeminjamanSirkulasiController;
use App\Http\Controllers\Laboran\LaboranPerawatanAlatController;
use App\Http\Controllers\Laboran\LaboranTicketController;
use App\Http\Controllers\Mahasiswa\MahasiswaAbsensiController;
use App\Http\Controllers\Mahasiswa\MahasiswaBookingRuanganController;
use App\Http\Controllers\Mahasiswa\MahasiswaDashboardController;
use App\Http\Controllers\Mahasiswa\MahasiswaDokumenSopController;
use App\Http\Controllers\Mahasiswa\MahasiswaInventarisController;
use App\Http\Controllers\Mahasiswa\MahasiswaJadwalLaboratoriumController;
use App\Http\Controllers\Mahasiswa\MahasiswaPeminjamanController;
use App\Http\Controllers\Mahasiswa\MahasiswaPeminjamanPengembalianController;
use App\Http\Controllers\Mahasiswa\MahasiswaPengembalianController;
use App\Http\Controllers\Mahasiswa\MahasiswaProfilController;
use App\Http\Controllers\Mahasiswa\MahasiswaTicketController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });


Route::middleware(['auth'])->group(function () {
    Route::patch('/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead'])->name('notifikasi.mark-as-read');
    Route::post('/notifikasi/mark-all-read', [NotifikasiController::class, 'markAllRead'])->name('notifikasi.mark-all-read');
});

// MAHASISWA
Route::middleware(['auth', 'verified'])->prefix('mahasiswa')->name('mahasiswa.')->group(function () {


    // 1. Dashboard
    Route::get('/mahasiswa-dashboard', [MahasiswaDashboardController::class, 'index'])->name('dashboard');

    // 2.Menggabungkan Katalog, Detail Alat, dan QR Scanner dalam 1 route & controller
    Route::get('/inventaris', [MahasiswaInventarisController::class, 'index'])->name('inventaris.index');

    // Route Peminjaman Alat
    Route::get('/peminjaman', [MahasiswaPeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::post('/peminjaman', [MahasiswaPeminjamanController::class, 'store'])->name('peminjaman.store');

    // 3 Pengembalian
    // Route::get('/pengembalian', [MahasiswaPengembalianController::class, 'index'])->name('pengembalian.index');
    // Route::post('/pengembalian/{id}', [MahasiswaPengembalianController::class, 'store'])->name('pengembalian.store');

    // Fitur 4: Booking Ruangan
    Route::get('/booking-ruangan', [MahasiswaBookingRuanganController::class, 'index'])->name('booking-ruangan.index');
    Route::post('/booking-ruangan', [MahasiswaBookingRuanganController::class, 'store'])->name('booking-ruangan.store');
    Route::post('/booking-ruangan/batal/{id}', [MahasiswaBookingRuanganController::class, 'cancel'])->name('booking-ruangan.cancel');

    // FITUR 5 : jadwal booking 
    Route::get('/jadwal-laboratorium', [MahasiswaJadwalLaboratoriumController::class, 'index'])->name('jadwal-laboratorium.index');

    // FITUR 6
    // Index Gabungan (Modul, Arsip, & SOP)
    Route::get('/dokumen-sop', [MahasiswaDokumenSopController::class, 'index'])->name('dokumen-sop.index');

    // Action CRUD Arsip
    Route::post('/dokumen-sop/arsip', [MahasiswaDokumenSopController::class, 'storeArsip'])->name('dokumen-sop.arsip.store');
    Route::post('/dokumen-sop/arsip/{id}', [MahasiswaDokumenSopController::class, 'updateArsip'])->name('dokumen-sop.arsip.update');
    Route::delete('/dokumen-sop/arsip/{id}', [MahasiswaDokumenSopController::class, 'destroyArsip'])->name('dokumen-sop.arsip.destroy');

    // Action CRUD SOP
    Route::post('/dokumen-sop/sop', [MahasiswaDokumenSopController::class, 'storeSop'])->name('dokumen-sop.sop.store');
    Route::post('/dokumen-sop/sop/{id}', [MahasiswaDokumenSopController::class, 'updateSop'])->name('dokumen-sop.sop.update');
    Route::delete('/dokumen-sop/sop/{id}', [MahasiswaDokumenSopController::class, 'destroySop'])->name('dokumen-sop.sop.destroy');

    // MONITORING ABSENSI
    Route::get('/absensi', [MahasiswaAbsensiController::class, 'index'])->name('absensi.index');
    Route::get('/absensi/kelas/{id}', [MahasiswaAbsensiController::class, 'showKelas'])->name('absensi.kelas');


    // FITUR 7 PROFILE
    // Index Tampilan Profil
    Route::get('/profil', [MahasiswaProfilController::class, 'index'])->name('profil.index');

    // Aksi Update Data Pribadi & Foto Profil
    Route::post('/profil/update', [MahasiswaProfilController::class, 'updateProfile'])->name('profil.update');

    // Aksi Update Password
    Route::post('/profil/password', [MahasiswaProfilController::class, 'updatePassword'])->name('profil.password.update');

    // FITUR TAMBAHAN TIcketing
    Route::get('/tickets', [MahasiswaTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets', [MahasiswaTicketController::class, 'store'])->name('tickets.store');
    Route::post('/tickets/{id}/reply', [MahasiswaTicketController::class, 'reply'])->name('tickets.reply');
    Route::put('/tickets/{id}/close', [MahasiswaTicketController::class, 'close'])->name('tickets.close');

});

Route::middleware(['auth', 'verified'])->prefix('dosen')->name('dosen.')->group(function () {


    // 1. Dashboard
    Route::get('/dosen-dashboard', [DosenDashboardController::class, 'index'])->name('dashboard');
    Route::post('/booking', [DosenDashboardController::class, 'storeBooking'])->name('booking.store');
    Route::put('/booking/{id}', [DosenDashboardController::class, 'updateBooking'])->name('booking.update');
    Route::delete('/booking/{id}', [DosenDashboardController::class, 'destroyBooking'])->name('booking.destroy');

     // 2.Menggabungkan Katalog, Detail Alat, dan QR Scanner dalam 1 route & controller
    Route::get('/inventaris', [DosenInventarisController::class, 'index'])->name('inventaris.index');

    // Route Peminjaman Alat
    Route::get('/peminjaman', [DosenPeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::post('/peminjaman', [DosenPeminjamanController::class, 'store'])->name('peminjaman.store');

    // 3 Pengembalian
    // Route::get('/pengembalian', [MahasiswaPengembalianController::class, 'index'])->name('pengembalian.index');
    // Route::post('/pengembalian/{id}', [MahasiswaPengembalianController::class, 'store'])->name('pengembalian.store');

    // Fitur 4: Booking Ruangan
    Route::get('/booking-ruangan', [DosenBookingRuanganController::class, 'index'])->name('booking-ruangan.index');
    Route::post('/booking-ruangan', [DosenBookingRuanganController::class, 'store'])->name('booking-ruangan.store');
    Route::post('/booking-ruangan/batal/{id}', [DosenBookingRuanganController::class, 'cancel'])->name('booking-ruangan.cancel');

    // FITUR 5 : jadwal booking 
    Route::get('/jadwal-laboratorium', [DosenJadwalLaboratoriumController::class, 'index'])->name('jadwal-laboratorium.index');

    // FITUR 6
    // Index Gabungan (Modul, Arsip, & SOP)
    Route::get('/dokumen-sop', [DosenDokumenSopController::class, 'index'])->name('dokumen-sop.index');

    // Action CRUD Arsip
    // Route::post('/dokumen-sop/arsip', [MahasiswaDokumenSopController::class, 'storeArsip'])->name('dokumen-sop.arsip.store');
    // Route::post('/dokumen-sop/arsip/{id}', [MahasiswaDokumenSopController::class, 'updateArsip'])->name('dokumen-sop.arsip.update');
    // Route::delete('/dokumen-sop/arsip/{id}', [MahasiswaDokumenSopController::class, 'destroyArsip'])->name('dokumen-sop.arsip.destroy');

    // Action CRUD SOP
    // Route::post('/dokumen-sop/sop', [MahasiswaDokumenSopController::class, 'storeSop'])->name('dokumen-sop.sop.store');
    // Route::post('/dokumen-sop/sop/{id}', [MahasiswaDokumenSopController::class, 'updateSop'])->name('dokumen-sop.sop.update');
    // Route::delete('/dokumen-sop/sop/{id}', [MahasiswaDokumenSopController::class, 'destroySop'])->name('dokumen-sop.sop.destroy');

    // Absensi Kelas Praktikum
    Route::get('/absensi', [DosenAbsensiController::class, 'index'])->name('absensi.index');
    Route::post('/absensi/kelas', [DosenAbsensiController::class, 'storeKelas'])->name('absensi.kelas.store');
    Route::get('/absensi/pertemuan/{id}', [DosenAbsensiController::class, 'showPertemuan'])->name('absensi.pertemuan.show');
    Route::post('/absensi/pertemuan/{id}/simpan', [DosenAbsensiController::class, 'simpanAbsensi'])->name('absensi.pertemuan.simpan');
    Route::post('/absensi/pertemuan/{id} /generate-qr', [DosenAbsensiController::class, 'generateQr'])->name('absensi.pertemuan.qr');


    // FITUR 7 PROFILE
    // Index Tampilan Profil
    Route::get('/profil', [DosenProfilController::class, 'index'])->name('profil.index');

    // Aksi Update Data Pribadi & Foto Profil
    Route::post('/profil/update', [DosenProfilController::class, 'updateProfile'])->name('profil.update');

    // Aksi Update Password
    Route::post('/profil/password', [DosenProfilController::class, 'updatePassword'])->name('profil.password.update');

});



Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // 1. Dashboard
    Route::get('/admin-dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // 2. Kelola User
    // Management User & Role Routes
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('users.toggle-status');

    // 3 Master Data
    // Master Data Main Page
    Route::get('/master-data', [AdminMasterDataController::class, 'index'])->name('master-data.index');

    // Kategori Alat
    Route::post('/master-data/kategori', [AdminMasterDataController::class, 'storeKategori'])->name('master-data.kategori.store');
    Route::put('/master-data/kategori/{kategoriAlat}', [AdminMasterDataController::class, 'updateKategori'])->name('master-data.kategori.update');
    Route::delete('/master-data/kategori/{kategoriAlat}', [AdminMasterDataController::class, 'destroyKategori'])->name('master-data.kategori.destroy');

    // Supplier
    Route::post('/master-data/supplier', [AdminMasterDataController::class, 'storeSupplier'])->name('master-data.supplier.store');
    Route::put('/master-data/supplier/{supplier}', [AdminMasterDataController::class, 'updateSupplier'])->name('master-data.supplier.update');
    Route::delete('/master-data/supplier/{supplier}', [AdminMasterDataController::class, 'destroySupplier'])->name('master-data.supplier.destroy');

    // Lokasi Alat
    Route::post('/master-data/lokasi', [AdminMasterDataController::class, 'storeLokasi'])->name('master-data.lokasi.store');
    Route::put('/master-data/lokasi/{lokasiAlat}', [AdminMasterDataController::class, 'updateLokasi'])->name('master-data.lokasi.update');
    Route::delete('/master-data/lokasi/{lokasiAlat}', [AdminMasterDataController::class, 'destroyLokasi'])->name('master-data.lokasi.destroy');

    // Ruangan
    Route::post('/master-data/ruangan', [AdminMasterDataController::class, 'storeRuangan'])->name('master-data.ruangan.store');
    Route::put('/master-data/ruangan/{ruangan}', [AdminMasterDataController::class, 'updateRuangan'])->name('master-data.ruangan.update');
    Route::delete('/master-data/ruangan/{ruangan}', [AdminMasterDataController::class, 'destroyRuangan'])->name('master-data.ruangan.destroy');

    // 4. Activity Log
    // Log Aktivitas
    Route::get('/activity-logs', [AdminActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::delete('/activity-logs/{activityLog}', [AdminActivityLogController::class, 'destroy'])->name('activity-logs.destroy');
    Route::delete('/activity-logs-clear-all', [AdminActivityLogController::class, 'clearAll'])->name('activity-logs.clear-all');

    // 5.
    // Backup & Restore Database
    Route::get('/backups', [AdminBackupController::class, 'index'])->name('backups.index');

    // Ganti Route post create menjadi GET jika mengunduh lewat window.location.href
    Route::get('/backups/create', [AdminBackupController::class, 'createBackup'])->name('backups.create');
    Route::post('/backups/restore', [AdminBackupController::class, 'restoreBackup'])->name('backups.restore');
    Route::get('/backups/download/{fileName}', [AdminBackupController::class, 'downloadBackup'])->name('backups.download');
  

    Route::delete('/backups/{fileName}', [AdminBackupController::class, 'destroyBackup'])->name('backups.destroy');

    // Denda
    Route::get('/pengaturan-denda', [PengaturanDendaController::class, 'index'])->name('pengaturan-denda.index');
    Route::put('/pengaturan-denda', [PengaturanDendaController::class, 'update'])->name('pengaturan-denda.update');


    // FITUR TAMBAHAN TICKETING
    Route::get('/tickets', [AdminTicketController::class, 'index'])->name('tickets.index');
    Route::put('/tickets/{id}', [AdminTicketController::class, 'update'])->name('tickets.update');
    Route::delete('/tickets/{id}', [AdminTicketController::class, 'destroy'])->name('tickets.destroy');

    // Pengaturan Integrasi Telegram Bot
    Route::post('/tickets/telegram-config', [AdminTicketController::class, 'updateTelegramConfig'])->name('tickets.telegram-config');

});


Route::middleware(['auth', 'verified'])->prefix('laboran')->name('laboran.')->group(function () {
    // 1. Dashboard
    Route::get('/laboran-dashboard', [LaboranDashboardController::class, 'index'])->name('dashboard');

    // 2. Inventory & QR code
    Route::get('/alat', [LaboranAlatController::class, 'index'])->name('alat.index');
    Route::post('/alat', [LaboranAlatController::class, 'store'])->name('alat.store');
    Route::match(['post', 'put'], '/alat/{alat}', [LaboranAlatController::class, 'update'])->name('alat.update'); // Menggunakan POST + _method PUT untuk upload file
    Route::delete('/alat/{alat}', [LaboranAlatController::class, 'destroy'])->name('alat.destroy');

    // 3. Peminjaman dan Pengembalian
    Route::get('/sirkulasi', [LaboranPeminjamanSirkulasiController::class, 'index'])->name('sirkulasi.index');
    Route::post('/sirkulasi/{peminjaman}/approve', [LaboranPeminjamanSirkulasiController::class, 'approve'])->name('sirkulasi.approve');
    Route::post('/sirkulasi/{peminjaman}/reject', [LaboranPeminjamanSirkulasiController::class, 'reject'])->name('sirkulasi.reject');
    Route::post('/sirkulasi/{peminjaman}/serahkan', [LaboranPeminjamanSirkulasiController::class, 'serahkan'])->name('sirkulasi.serahkan');
    Route::post('/sirkulasi/{peminjaman}/verifikasi-kembali', [LaboranPeminjamanSirkulasiController::class, 'verifikasiPengembalian'])->name('sirkulasi.verifikasi-kembali');

    // Route bayar denda oleh laboran
    Route::post('/sirkulasi/{peminjaman}/bayar-denda', [LaboranPeminjamanSirkulasiController::class, 'bayarDenda'])
        ->name('sirkulasi.bayar-denda');

    // 4. Jadwal Lab
    // Halaman Utama (Dua Tab: Booking & Jadwal)
    Route::get('/ruangan-manajemen', [LaboranManajemenRuanganController::class, 'index'])->name('ruangan-manajemen.index');

    // Route Booking Ruangan (Approve / Reject / Selesai)
    Route::post('/booking/{booking}/approve', [LaboranManajemenRuanganController::class, 'approveBooking'])->name('booking.approve');
    Route::post('/booking/{booking}/reject', [LaboranManajemenRuanganController::class, 'rejectBooking'])->name('booking.reject');
    Route::post('/booking/{booking}/finish', [LaboranManajemenRuanganController::class, 'finishBooking'])->name('booking.finish');

    // Route CRUD Jadwal Laboratorium
    Route::post('/jadwal-lab', [LaboranManajemenRuanganController::class, 'storeJadwal'])->name('jadwal.store');
    Route::post('/jadwal-lab/{jadwal}', [LaboranManajemenRuanganController::class, 'updateJadwal'])->name('jadwal.update');
    Route::delete('/jadwal-lab/{jadwal}', [LaboranManajemenRuanganController::class, 'destroyJadwal'])->name('jadwal.destroy');

    // 5. MT & Kalibrasi
    // Halaman Utama (Dua Tab: Maintenance & Kalibrasi)
    Route::get('/perawatan-alat', [LaboranPerawatanAlatController::class, 'index'])->name('perawatan-alat.index');

    // Route CRUD Maintenance Alat
    Route::post('/maintenance-alat', [LaboranPerawatanAlatController::class, 'storeMaintenance'])->name('maintenance.store');
    Route::post('/maintenance-alat/{maintenance}', [LaboranPerawatanAlatController::class, 'updateMaintenance'])->name('maintenance.update');
    Route::delete('/maintenance-alat/{maintenance}', [LaboranPerawatanAlatController::class, 'destroyMaintenance'])->name('maintenance.destroy');

    // Route CRUD Kalibrasi Alat
    Route::post('/kalibrasi-alat', [LaboranPerawatanAlatController::class, 'storeKalibrasi'])->name('kalibrasi.store');
    Route::post('/kalibrasi-alat/{kalibrasi}', [LaboranPerawatanAlatController::class, 'updateKalibrasi'])->name('kalibrasi.update');
    Route::delete('/kalibrasi-alat/{kalibrasi}', [LaboranPerawatanAlatController::class, 'destroyKalibrasi'])->name('kalibrasi.destroy');

    // 6. ARSIP & SOP
    // Halaman Utama (Dua Tab: Arsip Dokumen & SOP Laboratorium)
    Route::get('/arsip-sop', [LaboranArsipSopController::class, 'index'])->name('arsip-sop.index');

    // Route CRUD Arsip
    Route::post('/arsip', [LaboranArsipSopController::class, 'storeArsip'])->name('arsip.store');
    Route::post('/arsip/{arsip}', [LaboranArsipSopController::class, 'updateArsip'])->name('arsip.update');
    Route::delete('/arsip/{arsip}', [LaboranArsipSopController::class, 'destroyArsip'])->name('arsip.destroy');

    // Route CRUD SOP
    Route::post('/sop', [LaboranArsipSopController::class, 'storeSop'])->name('sop.store');
    Route::post('/sop/{sop}', [LaboranArsipSopController::class, 'updateSop'])->name('sop.update');
    Route::delete('/sop/{sop}', [LaboranArsipSopController::class, 'destroySop'])->name('sop.destroy');

    // Monitoring absensi
    Route::get('/absensi-monitoring', [LaboranAbsensiController::class, 'index'])->name('absensi.monitoring');
    Route::get('/absensi-monitoring/kelas/{id}', [LaboranAbsensiController::class, 'showKelas'])->name('absensi.monitoring.kelas');
    Route::get('/absensi-monitoring/pertemuan/{id}', [LaboranAbsensiController::class, 'showPertemuan'])->name('absensi.monitoring.pertemuan');

    // 7. LAPORAN
    // Halaman Utama Laporan & Rekapitulasi (Read-Only 4 Tab)
    Route::get('/laporan', [LaboranLaporanController::class, 'index'])->name('laporan.index');

    // Route Export PDF / Print Laporan
    Route::get('/laporan/export-pdf', [LaboranLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');


    // FITUR TAMBAHAN TICKETING
    Route::get('/tickets', [LaboranTicketController::class, 'index'])->name('tickets.index');
    Route::put('/tickets/{id}/status', [LaboranTicketController::class, 'updateStatus'])->name('tickets.update-status');
    Route::post('/tickets/{id}/reply', [LaboranTicketController::class, 'reply'])->name('tickets.reply');
    Route::post('/tickets/{id}/maintenance', [LaboranTicketController::class, 'createMaintenance'])->name('tickets.maintenance');

});

Route::middleware(['auth', 'verified'])->prefix('kepala')->name('kepala.')->group(function () {
    // 1. Dashboard
    Route::get('/kepala-dashboard', [KepalaDashboardStatistikController::class, 'index'])->name('dashboard');

    // 2. Persetujuna alat
    // Pusat Persetujuan (Approval Center)
    Route::get('/persetujuan', [KepalaPersetujuanController::class, 'index'])->name('persetujuan.index');
    
    // Action Penghapusan Alat
    Route::post('/persetujuan/alat/{id}/approve-delete', [KepalaPersetujuanController::class, 'approveDeleteAlat'])->name('persetujuan.alat.approve-delete');
    Route::post('/persetujuan/alat/{id}/reject-delete', [KepalaPersetujuanController::class, 'rejectDeleteAlat'])->name('persetujuan.alat.reject-delete');
    
    // Action Maintenance Besar
    Route::post('/persetujuan/maintenance/{id}/approve', [KepalaPersetujuanController::class, 'approveMaintenance'])->name('persetujuan.maintenance.approve');
    Route::post('/persetujuan/maintenance/{id}/reject', [KepalaPersetujuanController::class, 'rejectMaintenance'])->name('persetujuan.maintenance.reject');
   
    // 3.  Monitoring & Pengawasan
    Route::get('/monitoring', [KepalaMonitoringController::class, 'index'])->name('monitoring.index');

    // 4 Laporan
    // Halaman Utama Laporan & Rekapitulasi (Read-Only 4 Tab)
    Route::get('/laporan', [KepalaLaporanController::class, 'index'])->name('laporan.index');

    // Route Export PDF / Print Laporan
    Route::get('/laporan/export-pdf', [KepalaLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');

    // Tambahan fitur ticketing
    Route::get('/tickets', [KepalaTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets/{id}/escalate', [KepalaTicketController::class, 'escalate'])->name('tickets.escalate');
    Route::get('/tickets/export', [KepalaTicketController::class, 'exportReport'])->name('tickets.export');

});




require __DIR__.'/auth.php';
