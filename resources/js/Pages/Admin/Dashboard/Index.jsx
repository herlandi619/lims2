import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // Form Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.dashboard'),
            { search: search },
            { preserveState: true, replace: true }
        );
    };

    // Reset Filter Search
    const handleReset = () => {
        setSearch('');
        router.get(route('admin.dashboard'), {}, { preserveState: true, replace: true });
    };

    // Modal Box Detail Log dengan SweetAlert2
    const showDetailLog = (log) => {
        Swal.fire({
            title: '<strong>Detail Log Aktivitas</strong>',
            html: `
                <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                    <hr style="margin-bottom: 12px; border-top: 1px solid #e5e7eb;"/>
                    <p><strong>Pengguna:</strong> ${log.user ? log.user.name : 'Sistem / Anonim'}</p>
                    <p><strong>Email:</strong> ${log.user ? log.user.email : '-'}</p>
                    <p><strong>Aktivitas:</strong> ${log.aktivitas}</p>
                    <p><strong>IP Address:</strong> ${log.ip_address || '-'}</p>
                    <p><strong>Browser/User Agent:</strong> ${log.browser || '-'}</p>
                    <p><strong>Waktu:</strong> ${new Date(log.created_at).toLocaleString('id-ID')}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#3085d6',
        });
    };

    return (
        <AdminLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Administrator</h2>}>
            <Head title="Admin Dashboard" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* 1. Ringkasan Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-blue-500">
                        <div className="text-sm font-medium text-gray-500">Total Pengguna</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total_users}</div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-emerald-500">
                        <div className="text-sm font-medium text-gray-500">Total Inventaris Alat</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total_alat}</div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-amber-500">
                        <div className="text-sm font-medium text-gray-500">Peminjaman Menunggu</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{stats.peminjaman_pending}</div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-purple-500">
                        <div className="text-sm font-medium text-gray-500">Booking Ruangan Menunggu</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{stats.booking_pending}</div>
                    </div>
                </div>

                {/* 2. Tabel Activity Logs */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Log Aktivitas Sistem</h3>
                            <p className="text-sm text-gray-500">Audit riwayat aktivitas pengguna di dalam platform LIMS.</p>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                className="w-full md:w-64 rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cari Aktivitas, User, IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition"
                            >
                                Cari
                            </button>
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg font-medium transition"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pengguna</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aktivitas</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">
                                                    {log.user ? log.user.name : <span className="italic text-gray-400">Sistem</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">{log.user ? log.user.email : '-'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-700 font-medium">{log.aktivitas}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                                {log.ip_address || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => showDetailLog(log)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md font-medium text-xs transition"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                            Tidak ada riwayat aktivitas yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold">{logs.from || 0}</span> sampai{' '}
                                <span className="font-semibold">{logs.to || 0}</span> dari{' '}
                                <span className="font-semibold">{logs.total}</span> log
                            </div>
                            <div className="inline-flex space-x-1">
                                {logs.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-md border ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        }`}
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}