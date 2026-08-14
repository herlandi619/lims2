import React, { useState } from 'react';
import KepalaLayout from '@/Layouts/KepalaLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({
    auth,
    peminjamanList,
    bookingList,
    maintenanceList,
    kalibrasiList,
    filters,
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'peminjaman');

    // State Searches
    const [searchPeminjaman, setSearchPeminjaman] = useState(filters.search_peminjaman || '');
    const [searchBooking, setSearchBooking] = useState(filters.search_booking || '');
    const [searchMaintenance, setSearchMaintenance] = useState(filters.search_maintenance || '');
    const [searchKalibrasi, setSearchKalibrasi] = useState(filters.search_kalibrasi || '');

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('laboran.laporan.index'),
            {
                tab: activeTab,
                search_peminjaman: searchPeminjaman,
                search_booking: searchBooking,
                search_maintenance: searchMaintenance,
                search_kalibrasi: searchKalibrasi,
            },
            { preserveState: true, replace: true }
        );
    };

    // Handle Export PDF
    // Gantikan fungsi handleExportPdf dengan ini:
    const handleExportPdf = (type) => {
        // Membuka URL unduhan langsung
        window.location.href = route('laboran.laporan.export-pdf', { type });
    };

    // Helper Badge Status
    const renderStatusBadge = (status) => {
        const colors = {
            menunggu: 'bg-amber-100 text-amber-800',
            disetujui: 'bg-blue-100 text-blue-800',
            dipinjam: 'bg-indigo-100 text-indigo-800',
            dikembalikan: 'bg-green-100 text-green-800',
            ditolak: 'bg-red-100 text-red-800',
            selesai: 'bg-emerald-100 text-emerald-800',
            proses: 'bg-amber-100 text-amber-800',
            lulus: 'bg-green-100 text-green-800',
            tidak_lulus: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                {status ? status.replace('_', ' ') : '-'}
            </span>
        );
    };

    return (
        <KepalaLayout user={auth.user}>
            <Head title="Laporan & Rekapitulasi" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan & Rekapitulasi</h1>
                        <p className="text-sm text-gray-500">
                            Pusat pemantauan rekap data dan unduh laporan resmi laboratorium (PDF).
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 space-x-2 overflow-x-auto">
                    {[
                        { key: 'peminjaman', label: 'Laporan Peminjaman' },
                        { key: 'booking', label: 'Laporan Booking Ruangan' },
                        { key: 'maintenance', label: 'Laporan Maintenance' },
                        { key: 'kalibrasi', label: 'Laporan Kalibrasi' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: PEMINJAMAN ALAT */}
                {activeTab === 'peminjaman' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari kode, peminjam, status..."
                                    value={searchPeminjaman}
                                    onChange={(e) => setSearchPeminjaman(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button
                                onClick={() => handleExportPdf('peminjaman')}
                                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1.5"
                            >
                                📄 Unduh Rekap PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Kode & Peminjam</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Keperluan</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl Pinjam / Rencana</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl Kembali</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {peminjamanList.data.length > 0 ? (
                                            peminjamanList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono font-bold text-indigo-600 block">{item.kode_peminjaman}</span>
                                                        <span className="font-bold text-gray-900">{item.user?.name || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-600">{item.keperluan || '-'}</td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p className="font-medium text-gray-800">{item.tanggal_pinjam}</p>
                                                        <p className="text-gray-500">s/d {item.tanggal_rencana_kembali}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                                                        {item.tanggal_kembali || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{renderStatusBadge(item.status)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada rekap peminjaman.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {peminjamanList.total} Data</span>
                                <div className="flex space-x-1">
                                    {peminjamanList.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: BOOKING RUANGAN */}
                {activeTab === 'booking' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari pemohon, ruangan, keperluan..."
                                    value={searchBooking}
                                    onChange={(e) => setSearchBooking(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button
                                onClick={() => handleExportPdf('booking')}
                                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1.5"
                            >
                                📄 Unduh Rekap PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Ruangan & Pemohon</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tanggal & Jam</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Keperluan</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {bookingList.data.length > 0 ? (
                                            bookingList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-900 block">{item.ruangan?.nama_ruangan || '-'}</span>
                                                        <span className="text-xs text-gray-600">Pemohon: {item.user?.name || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p className="font-medium text-gray-800">{item.tanggal}</p>
                                                        <p className="text-gray-500">{item.jam_mulai} - {item.jam_selesai}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-700">{item.keperluan || '-'}</td>
                                                    <td className="px-6 py-4 text-center">{renderStatusBadge(item.status)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-6 text-gray-400">Tidak ada rekap booking ruangan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {bookingList.total} Data</span>
                                <div className="flex space-x-1">
                                    {bookingList.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: MAINTENANCE ALAT */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari alat, teknisi, jenis..."
                                    value={searchMaintenance}
                                    onChange={(e) => setSearchMaintenance(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button
                                onClick={() => handleExportPdf('maintenance')}
                                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1.5"
                            >
                                📄 Unduh Rekap PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Alat & Jenis</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tanggal & Teknisi</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Biaya Maintenance</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {maintenanceList.data.length > 0 ? (
                                            maintenanceList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-900 block">{item.alat?.nama_alat || '-'}</span>
                                                        <span className="text-xs uppercase font-semibold text-indigo-600">{item.jenis}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p className="font-medium text-gray-800">{item.tanggal_maintenance}</p>
                                                        <p className="text-gray-500">Teknisi: {item.teknisi || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-900">
                                                        Rp {Number(item.biaya || 0).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{renderStatusBadge(item.status)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-6 text-gray-400">Tidak ada rekap maintenance.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {maintenanceList.total} Data</span>
                                <div className="flex space-x-1">
                                    {maintenanceList.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: KALIBRASI ALAT */}
                {activeTab === 'kalibrasi' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari alat, keterangan..."
                                    value={searchKalibrasi}
                                    onChange={(e) => setSearchKalibrasi(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button
                                onClick={() => handleExportPdf('kalibrasi')}
                                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1.5"
                            >
                                📄 Unduh Rekap PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Alat</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl Kalibrasi / Berikutnya</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-600">Hasil</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Dokumen Sertifikat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {kalibrasiList.data.length > 0 ? (
                                            kalibrasiList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-900 block">{item.alat?.nama_alat || '-'}</span>
                                                        <p className="text-xs text-gray-500">{item.keterangan || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p className="font-medium text-gray-800">{item.tanggal_kalibrasi}</p>
                                                        <p className="text-gray-500">Next: {item.kalibrasi_berikutnya}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{renderStatusBadge(item.hasil)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {item.sertifikat ? (
                                                            <a
                                                                href={`/storage/${item.sertifikat}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs text-indigo-600 hover:underline font-semibold"
                                                            >
                                                                📄 Lihat Sertifikat
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-6 text-gray-400">Tidak ada rekap kalibrasi.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {kalibrasiList.total} Data</span>
                                <div className="flex space-x-1">
                                    {kalibrasiList.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </KepalaLayout>
    );
}