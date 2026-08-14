import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, peminjamanTerbaru, bookingHariIni, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Alert SweetAlert2 jika ada flash message
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    // Handle Pencarian Tabel Peminjaman (Inertia router.get)
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboran.dashboard'), { search }, { preserveState: true, replace: true });
    };

    // Open Modal Detail
    const openDetailModal = (item) => {
        setSelectedPeminjaman(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPeminjaman(null);
    };

    // Helper Badge Warna Status
    const getStatusBadge = (status) => {
        switch (status) {
            case 'menunggu': return 'bg-yellow-100 text-yellow-800';
            case 'disetujui': return 'bg-blue-100 text-blue-800';
            case 'dipinjam': return 'bg-indigo-100 text-indigo-800';
            case 'dikembalikan': return 'bg-green-100 text-green-800';
            case 'ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Dashboard Laboran" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Laboran</h1>
                    <p className="text-sm text-gray-500">Ringkasan status inventaris dan aktivitas laboratorium hari ini.</p>
                </div>

                {/* 1. Grid Cards Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Alat</p>
                            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.total_alat}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg font-bold">📦</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alat Rusak</p>
                            <h3 className="text-2xl font-extrabold text-red-600 mt-1">{stats.alat_rusak}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg font-bold">⚠️</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Maintenance Aktif</p>
                            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.maintenance}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg font-bold">🛠️</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jadwal Kalibrasi</p>
                            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{stats.kalibrasi}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg font-bold">🔬</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Hari Ini</p>
                            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.booking_hari_ini}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg font-bold">📅</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Peminjaman Aktif</p>
                            <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{stats.peminjaman_aktif}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg font-bold">📋</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Tabel Aktivitas Peminjaman Terbaru (2 Kolom Layout) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-800">Peminjaman Alat Terbaru</h2>
                            
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari kode/peminjam..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="px-3 py-1.5 border rounded-lg text-sm w-full sm:w-48 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Kode</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Peminjam</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Tgl Pinjam</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {peminjamanTerbaru.data.length > 0 ? (
                                        peminjamanTerbaru.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{item.kode_peminjaman}</td>
                                                <td className="px-4 py-3 text-gray-700">{item.user?.name || '-'}</td>
                                                <td className="px-4 py-3 text-gray-500">{item.tanggal_pinjam}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => openDetailModal(item)}
                                                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded-md hover:bg-indigo-100"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada transaksi peminjaman ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination 5 Data */}
                        <div className="flex justify-between items-center pt-3 border-t">
                            <span className="text-xs text-gray-500">
                                Menampilkan {peminjamanTerbaru.from || 0} - {peminjamanTerbaru.to || 0} dari {peminjamanTerbaru.total || 0} data
                            </span>
                            <div className="flex space-x-1">
                                {peminjamanTerbaru.links?.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded text-xs ${
                                            link.active
                                                ? 'bg-indigo-600 text-white font-bold'
                                                : 'bg-white border text-gray-600 hover:bg-gray-50'
                                        } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Panel Ringkas Booking Ruangan Hari Ini (1 Kolom Layout) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Booking Ruangan Hari Ini</h2>
                        <div className="space-y-3">
                            {bookingHariIni.length > 0 ? (
                                bookingHariIni.map((booking) => (
                                    <div key={booking.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1">
                                        <div className="flex justify-between font-bold text-gray-800">
                                            <span>{booking.ruangan?.nama_ruangan}</span>
                                            <span className="capitalize text-indigo-600">{booking.status}</span>
                                        </div>
                                        <p className="text-gray-600">Pemohon: {booking.user?.name}</p>
                                        <p className="text-gray-500">Jam: {booking.jam_mulai} - {booking.jam_selesai}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-xs text-gray-400">Tidak ada jadwal booking ruangan untuk hari ini.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Detail Peminjaman */}
                {isModalOpen && selectedPeminjaman && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">Detail Peminjaman #{selectedPeminjaman.kode_peminjaman}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <div className="p-6 space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Nama Peminjam</span>
                                        <p className="font-semibold text-gray-800">{selectedPeminjaman.user?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block">Status</span>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${getStatusBadge(selectedPeminjaman.status)}`}>
                                            {selectedPeminjaman.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block">Tanggal Pinjam</span>
                                        <p className="font-medium text-gray-700">{selectedPeminjaman.tanggal_pinjam}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block">Rencana Kembali</span>
                                        <p className="font-medium text-gray-700">{selectedPeminjaman.tanggal_rencana_kembali}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <span className="text-xs text-gray-400 block">Keperluan</span>
                                    <p className="text-gray-700 mt-0.5">{selectedPeminjaman.keperluan || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block">Catatan Laboran</span>
                                    <p className="text-gray-700 mt-0.5">{selectedPeminjaman.catatan_laboran || '-'}</p>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t text-right">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LaboranLayout>
    );
}