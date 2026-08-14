import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Filter submit
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.activity-logs.index'),
            { search, date },
            { preserveState: true }
        );
    };

    // Reset filter
    const handleReset = () => {
        setSearch('');
        setDate('');
        router.get(route('admin.activity-logs.index'));
    };

    // Open detail modal
    const openDetailModal = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    // Hapus single log
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Log Aktivitas?',
            text: 'Data log ini akan dihapus permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#ef4444',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.activity-logs.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Log aktivitas telah dihapus.', 'success');
                    },
                });
            }
        });
    };

    // Bersihkan seluruh log
    const handleClearAll = () => {
        Swal.fire({
            title: 'Bersihkan Seluruh Log?',
            text: 'Tindakan ini akan menghapus SELURUH riwayat aktivitas di sistem dan tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#dc2626',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Bersihkan Semua!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.activity-logs.clear-all'), {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Seluruh log aktivitas telah dibersihkan.', 'success');
                    },
                });
            }
        });
    };

    // Helper untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const dateObj = new Date(dateString);
        return dateObj.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title="Log Aktivitas" />

            <div className="py-6 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas (Audit Log)</h1>
                        <p className="text-sm text-gray-600">Memantau rekam jejak dan aktivitas pengguna di dalam sistem LIMS.</p>
                    </div>
                    {logs.total > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2 self-start md:self-auto"
                        >
                            <span>🗑 Bersihkan Semua Log</span>
                        </button>
                    )}
                </div>

                {/* Filter Section */}
                <div className="bg-white p-4 rounded-t-xl border border-gray-200">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Cari user, aktivitas, IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                            />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-lg font-medium"
                            >
                                Cari
                            </button>
                            {(search || date) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 text-sm rounded-lg"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 self-end md:self-auto">
                            Total: <span className="font-bold text-gray-800">{logs.total}</span> Log
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Pengguna</th>
                                <th className="px-6 py-3">Aktivitas</th>
                                <th className="px-6 py-3">IP Address</th>
                                <th className="px-6 py-3">Waktu</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">
                                        Tidak ada log aktivitas ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div>
                                                    <div className="font-semibold text-gray-900">{log.user.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {log.user.email} • <span className="uppercase text-indigo-600 font-bold">{log.user.role}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Sistem / Tamu</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-800" title={log.aktivitas}>
                                            {log.aktivitas}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => openDetailModal(log)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-2.5 py-1 rounded-md"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                className="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 px-2.5 py-1 rounded-md"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination (5 Data Per Halaman) */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
                        <span>Menampilkan {logs.from || 0} - {logs.to || 0} dari {logs.total} data</span>
                        <div className="flex space-x-1">
                            {logs.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded ${
                                        link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Log */}
            {isDetailModalOpen && selectedLog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-sm uppercase">Detail Log Aktivitas</h3>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-sm text-gray-700">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">PENGGUNA</label>
                                {selectedLog.user ? (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="font-bold text-gray-900">{selectedLog.user.name}</p>
                                        <p className="text-xs text-gray-500">{selectedLog.user.email} ({selectedLog.user.role})</p>
                                    </div>
                                ) : (
                                    <p className="italic text-gray-500">Sistem / Tamu</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">DESKRIPSI AKTIVITAS</label>
                                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900 font-medium">
                                    {selectedLog.aktivitas}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 block mb-1">IP ADDRESS</label>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded text-gray-800">{selectedLog.ip_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 block mb-1">WAKTU</label>
                                    <p className="text-xs bg-gray-100 p-2 rounded text-gray-800">{formatDate(selectedLog.created_at)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">USER AGENT / BROWSER</label>
                                <p className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-600 break-words">
                                    {selectedLog.browser || 'Tidak tercatat'}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}