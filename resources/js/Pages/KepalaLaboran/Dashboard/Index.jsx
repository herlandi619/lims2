import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import KepalaLayout from '@/Layouts/KepalaLayout';
import Swal from 'sweetalert2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardIndex({ auth, summary, topPinjam, topRusak, labSibuk, riwayat, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);

    // Live search handling
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('kepala.dashboard'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    // Modal Detail Statistik Pemicu
    const handleOpenDetailModal = (title, dataList, labelKey, valueKey) => {
        setSelectedMetric({ title, dataList, labelKey, valueKey });
        setIsModalOpen(true);
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('kepala.dashboard'), {}, { preserveState: true, replace: true });
    };

    // Data Chart 1: Alat Sering Dipinjam (Bar Chart)
    const barDataPinjam = {
        labels: topPinjam.map((item) => item.nama_alat),
        datasets: [
            {
                label: 'Jumlah Peminjaman',
                data: topPinjam.map((item) => item.total_dipinjam),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Data Chart 2: Lab Paling Sibuk (Pie Chart)
    const pieDataLab = {
        labels: labSibuk.map((item) => item.nama_ruangan),
        datasets: [
            {
                label: 'Total Booking',
                data: labSibuk.map((item) => item.total_booking),
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                ],
            },
        ],
    };

    return (
        <KepalaLayout user={auth.user} header="Dashboard & Analitik Laboratorium">
            <Head title="Dashboard Kepala Laboran" />

            <div className="space-y-6">
                {/* --- 1. RINGKASAN CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Total Inventaris</span>
                        <span className="text-2xl font-bold text-gray-800 mt-2">{summary.total_inventaris} Unit</span>
                        <span className="text-xs text-green-600 font-medium mt-1">Tersedia di Lab</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Peminjaman Aktif</span>
                        <span className="text-2xl font-bold text-blue-600 mt-2">{summary.total_peminjaman} Transaksi</span>
                        <span className="text-xs text-gray-400 mt-1">Pending/Dipinjam</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Booking Ruangan</span>
                        <span className="text-2xl font-bold text-emerald-600 mt-2">{summary.total_booking} Jadwal</span>
                        <span className="text-xs text-gray-400 mt-1">Reservasi Aktif</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Maintenance</span>
                        <span className="text-2xl font-bold text-amber-600 mt-2">{summary.total_maintenance} Alat</span>
                        <span className="text-xs text-amber-600 font-medium mt-1">Dalam Proses</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Total Kalibrasi</span>
                        <span className="text-2xl font-bold text-purple-600 mt-2">{summary.total_kalibrasi} Terdata</span>
                        <span className="text-xs text-gray-400 mt-1">Sertifikasi Alat</span>
                    </div>
                </div>

                {/* --- 2. GRAFIK & ANALITIK --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Graph 1: Top Dipinjam */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Alat Paling Sering Dipinjam</h3>
                            <button
                                onClick={() => handleOpenDetailModal('Top 5 Alat Sering Dipinjam', topPinjam, 'nama_alat', 'total_dipinjam')}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Lihat Detail
                            </button>
                        </div>
                        {topPinjam.length > 0 ? (
                            <div className="h-64">
                                <Bar data={barDataPinjam} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-10">Belum ada data peminjaman.</p>
                        )}
                    </div>

                    {/* Graph 2: Lab Sibuk */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Laboratorium Paling Sibuk</h3>
                            <button
                                onClick={() => handleOpenDetailModal('Top 5 Ruangan Lab Sibuk', labSibuk, 'nama_ruangan', 'total_booking')}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Lihat Detail
                            </button>
                        </div>
                        {labSibuk.length > 0 ? (
                            <div className="h-64 flex justify-center">
                                <Pie data={pieDataLab} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-10">Belum ada data booking ruangan.</p>
                        )}
                    </div>
                </div>

                {/* --- 3. TABEL AUDIT MONITORING RIWAYAT ALAT --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Audit & Log Aktivitas Alat</h3>
                            <p className="text-xs text-gray-500">Monitoring rekam jejak aktivitas penggunaan dan perubahan kondisi alat.</p>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <input
                                type="text"
                                className="px-3 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cari aktivitas/alat/user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                            >
                                Cari
                            </button>
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Waktu</th>
                                    <th className="px-6 py-3">Nama Alat</th>
                                    <th className="px-6 py-3">Aktivitas</th>
                                    <th className="px-6 py-3">Pengguna</th>
                                    <th className="px-6 py-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {riwayat.data.length > 0 ? (
                                    riwayat.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {new Date(item.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {item.alat ? item.alat.nama_alat : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                    {item.aktivitas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{item.user ? item.user.name : 'Sistem'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{item.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                            Tidak ada riwayat aktivitas ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginate 5 */}
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                            Menampilkan {riwayat.from || 0} - {riwayat.to || 0} dari {riwayat.total} data
                        </span>
                        <div className="flex gap-1">
                            {riwayat.links.map((link, idx) => (
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
                </div>
            </div>

            {/* --- MODAL BOX DETAIL STATISTIK --- */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{selectedMetric.title}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 max-h-80 overflow-y-auto">
                            <ul className="divide-y divide-gray-100">
                                {selectedMetric.dataList.map((row, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-700">{row[selectedMetric.labelKey]}</span>
                                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-800 font-bold">
                                            {row[selectedMetric.valueKey]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-gray-50 text-right border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
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