import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import KepalaLayout from '@/Layouts/KepalaLayout';
import Swal from 'sweetalert2';

export default function MonitoringIndex({ auth, alat, peminjaman, booking, maintenance, kalibrasi, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState('inventaris'); // 'inventaris', 'peminjaman', 'booking', 'maintenance', 'kalibrasi'

    // Modal Box State untuk melihat detail item
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState('');

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('kepala.monitoring.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kepala.monitoring.index'), {}, { preserveState: true, replace: true });
    };

    // Fungsi Pembuka Modal Box Detail
    const handleOpenModal = (type, data) => {
        setModalType(type);
        setModalData(data);
        setIsModalOpen(true);
    };

    // Helper Paginasi
    const renderPagination = (paginationData) => (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-500">
                Menampilkan {paginationData.from || 0} - {paginationData.to || 0} dari {paginationData.total} data
            </span>
            <div className="flex gap-1">
                {paginationData.links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url || '#'}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`px-3 py-1.5 rounded-md border text-xs ${
                            link.active
                                ? 'bg-blue-600 text-white border-blue-600'
                                : link.url
                                ? 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <KepalaLayout user={auth.user} header="Pusat Monitoring Inventaris & Aktivitas">
            <Head title="Monitoring Laboratorium" />

            <div className="space-y-6">
                {/* --- TAB SWITCHER & SEARCH BAR --- */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1 bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('inventaris')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'inventaris' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Inventaris Alat ({alat.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('peminjaman')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'peminjaman' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Peminjaman ({peminjaman.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('booking')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'booking' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Booking Lab ({booking.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'maintenance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Maintenance ({maintenance.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('kalibrasi')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'kalibrasi' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Kalibrasi ({kalibrasi.total})
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            className="px-3 py-2 border rounded-lg text-xs w-full md:w-56 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cari data..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                            Cari
                        </button>
                        {filters.search && (
                            <button type="button" onClick={handleResetSearch} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300">
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* --- TAB 1: MONITORING INVENTARIS ALAT --- */}
                {activeTab === 'inventaris' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Monitoring Seluruh Alat Laboratorium</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">Kode / Alat</th>
                                        <th className="px-5 py-3">Kategori</th>
                                        <th className="px-5 py-3">Lokasi</th>
                                        <th className="px-5 py-3">Stok (Tersedia / Total)</th>
                                        <th className="px-5 py-3">Kondisi / Status</th>
                                        <th className="px-5 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {alat.data.length > 0 ? (
                                        alat.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-gray-800">
                                                    <div>{item.nama_alat}</div>
                                                    <div className="text-gray-400 font-mono text-[10px]">{item.kode_alat}</div>
                                                </td>
                                                <td className="px-5 py-3">{item.kategori?.nama_kategori || '-'}</td>
                                                <td className="px-5 py-3">{item.lokasi?.nama_lokasi || '-'}</td>
                                                <td className="px-5 py-3 font-bold">
                                                    <span className="text-blue-600">{item.stok_tersedia}</span> / {item.jumlah_stok}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                        item.status === 'tersedia' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'dipinjam' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenModal('inventaris', item)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-6 text-gray-400">Tidak ada data alat.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(alat)}
                    </div>
                )}

                {/* --- TAB 2: MONITORING PEMINJAMAN ALAT --- */}
                {activeTab === 'peminjaman' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Monitoring Aktivitas Peminjaman</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">Kode Transaksi</th>
                                        <th className="px-5 py-3">Peminjam</th>
                                        <th className="px-5 py-3">Tgl Pinjam / Kembali</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {peminjaman.data.length > 0 ? (
                                        peminjaman.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-mono font-bold text-blue-600">{item.kode_peminjaman}</td>
                                                <td className="px-5 py-3 font-medium text-gray-800">{item.user?.name || '-'}</td>
                                                <td className="px-5 py-3">
                                                    {item.tanggal_pinjam} s/d {item.tanggal_rencana_kembali}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 uppercase">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenModal('peminjaman', item)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data peminjaman.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(peminjaman)}
                    </div>
                )}

                {/* --- TAB 3: MONITORING BOOKING RUANGAN --- */}
                {activeTab === 'booking' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Monitoring Booking Ruangan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">Ruangan</th>
                                        <th className="px-5 py-3">Pemohon</th>
                                        <th className="px-5 py-3">Tanggal & Waktu</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {booking.data.length > 0 ? (
                                        booking.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-bold text-gray-800">{item.ruangan?.nama_ruangan || '-'}</td>
                                                <td className="px-5 py-3">{item.user?.name || '-'}</td>
                                                <td className="px-5 py-3">
                                                    {item.tanggal} ({item.jam_mulai} - {item.jam_selesai})
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 uppercase">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenModal('booking', item)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data booking.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(booking)}
                    </div>
                )}

                {/* --- TAB 4: MONITORING MAINTENANCE ALAT --- */}
                {activeTab === 'maintenance' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Monitoring Maintenance Alat</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">Nama Alat</th>
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3">Jenis</th>
                                        <th className="px-5 py-3">Biaya</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {maintenance.data.length > 0 ? (
                                        maintenance.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-bold text-gray-800">{item.alat?.nama_alat || '-'}</td>
                                                <td className="px-5 py-3">{item.tanggal_maintenance}</td>
                                                <td className="px-5 py-3 uppercase">{item.jenis}</td>
                                                <td className="px-5 py-3 font-mono font-semibold">Rp {Number(item.biaya).toLocaleString('id-ID')}</td>
                                                <td className="px-5 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 uppercase">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenModal('maintenance', item)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-6 text-gray-400">Tidak ada data maintenance.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(maintenance)}
                    </div>
                )}

                {/* --- TAB 5: MONITORING KALIBRASI ALAT --- */}
                {activeTab === 'kalibrasi' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Monitoring Kalibrasi Alat</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">Nama Alat</th>
                                        <th className="px-5 py-3">Tgl Kalibrasi</th>
                                        <th className="px-5 py-3">Kalibrasi Berikutnya</th>
                                        <th className="px-5 py-3">Hasil</th>
                                        <th className="px-5 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {kalibrasi.data.length > 0 ? (
                                        kalibrasi.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-bold text-gray-800">{item.alat?.nama_alat || '-'}</td>
                                                <td className="px-5 py-3">{item.tanggal_kalibrasi}</td>
                                                <td className="px-5 py-3 font-semibold text-blue-600">{item.kalibrasi_berikutnya}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                        item.hasil === 'lulus' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {item.hasil}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenModal('kalibrasi', item)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data kalibrasi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(kalibrasi)}
                    </div>
                )}
            </div>

            {/* --- MODAL BOX DETAIL INVENTARIS / AKTIVITAS --- */}
            {isModalOpen && modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-xs uppercase">
                                Detail Data: {modalType}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-3 text-xs text-gray-700">
                            {modalType === 'inventaris' && (
                                <>
                                    <p><strong>Nama Alat:</strong> {modalData.nama_alat}</p>
                                    <p><strong>Kode Alat:</strong> {modalData.kode_alat}</p>
                                    <p><strong>Merk:</strong> {modalData.merk || '-'}</p>
                                    <p><strong>Spesifikasi:</strong> {modalData.spesifikasi || '-'}</p>
                                    <p><strong>Keterangan:</strong> {modalData.keterangan || '-'}</p>
                                </>
                            )}
                            {modalType === 'peminjaman' && (
                                <>
                                    <p><strong>Kode Peminjaman:</strong> {modalData.kode_peminjaman}</p>
                                    <p><strong>Peminjam:</strong> {modalData.user?.name}</p>
                                    <p><strong>Keperluan:</strong> {modalData.keperluan || '-'}</p>
                                    <p><strong>Catatan Laboran:</strong> {modalData.catatan_laboran || '-'}</p>
                                </>
                            )}
                            {modalType === 'booking' && (
                                <>
                                    <p><strong>Ruangan:</strong> {modalData.ruangan?.nama_ruangan}</p>
                                    <p><strong>Pemohon:</strong> {modalData.user?.name}</p>
                                    <p><strong>Keperluan:</strong> {modalData.keperluan || '-'}</p>
                                    <p><strong>Catatan:</strong> {modalData.catatan || '-'}</p>
                                </>
                            )}
                            {modalType === 'maintenance' && (
                                <>
                                    <p><strong>Alat:</strong> {modalData.alat?.nama_alat}</p>
                                    <p><strong>Teknisi:</strong> {modalData.teknisi || '-'}</p>
                                    <p><strong>Biaya:</strong> Rp {Number(modalData.biaya).toLocaleString('id-ID')}</p>
                                    <p><strong>Keterangan:</strong> {modalData.keterangan || '-'}</p>
                                </>
                            )}
                            {modalType === 'kalibrasi' && (
                                <>
                                    <p><strong>Alat:</strong> {modalData.alat?.nama_alat}</p>
                                    <p><strong>Sertifikat:</strong> {modalData.sertifikat || '-'}</p>
                                    <p><strong>Hasil:</strong> {modalData.hasil}</p>
                                    <p><strong>Keterangan:</strong> {modalData.keterangan || '-'}</p>
                                </>
                            )}
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KepalaLayout>
    );
}