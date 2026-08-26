import React, { useState, useEffect } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Link, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ jadwalList, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Alert SweetAlert jika ada flash message
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', confirmButtonColor: '#4F46E5' });
        }
        if (flash?.error) {
            Swal.fire({ title: 'Gagal!', text: flash.error, icon: 'error', confirmButtonColor: '#EF4444' });
        }
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('dosen.jadwal-laboratorium.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    const handleOpenDetail = (item) => {
        setSelectedJadwal(item);
        setIsDetailModalOpen(true);
    };

    const getHariBadge = (hari) => {
        const formattedHari = hari ? hari.charAt(0).toUpperCase() + hari.slice(1).toLowerCase() : '';
        const colors = {
            Senin: 'bg-blue-100 text-blue-800',
            Selasa: 'bg-green-100 text-green-800',
            Rabu: 'bg-purple-100 text-purple-800',
            Kamis: 'bg-amber-100 text-amber-800',
            Jumat: 'bg-emerald-100 text-emerald-800',
            Sabtu: 'bg-rose-100 text-rose-800',
            Minggu: 'bg-gray-100 text-gray-800',
        };
        return colors[formattedHari] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DosenLayout header={<h2 className="font-semibold text-xl text-gray-800">Jadwal Laboratorium</h2>}>
            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header Action / Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4 bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Jadwal Praktikum Laboratorium</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Lihat daftar jadwal praktikum dan penggunaan laboratorium</p>
                    </div>
                </div>

                {/* Filter & Table Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari Praktikum, Kelas, Ruangan, atau Hari..."
                            className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Hari & Waktu</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Mata Kuliah / Kelas</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Ruangan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Dosen Pengampu</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {jadwalList.data.length > 0 ? (
                                    jadwalList.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getHariBadge(item.hari)}`}>
                                                    {item.hari}
                                                </span>
                                                <div className="text-xs text-gray-600 mt-1 font-medium">
                                                    {item.jam_mulai} - {item.jam_selesai} WIB
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-800">
                                                    {item.kelas_praktikum?.nama_praktikum || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Kelas: {item.kelas_praktikum?.nama_kelas || item.kelas_praktikum?.kode_kelas || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-medium text-gray-800">{item.ruangan?.nama_ruangan || '-'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.ruangan?.kode_ruangan ? `(${item.ruangan.kode_ruangan})` : ''} - {item.ruangan?.lokasi || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-gray-800 font-medium">
                                                    {item.kelas_praktikum?.dosen?.name || 'Dosen Tidak Terdaftar'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.kelas_praktikum?.dosen?.email || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => handleOpenDetail(item)}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold transition"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">
                                            Tidak ada jadwal laboratorium yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center text-sm pt-2 gap-2">
                        <span className="text-gray-600">
                            Menampilkan {jadwalList.from ?? 0} - {jadwalList.to ?? 0} dari {jadwalList.total} jadwal
                        </span>
                        <div className="flex gap-1">
                            {jadwalList.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 border rounded-md text-xs font-medium transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL JADWAL */}
            {isDetailModalOpen && selectedJadwal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Detail Jadwal Praktikum</h3>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-gray-600">Nama Praktikum</span>
                                <span className="col-span-2 text-gray-800 font-bold">
                                    {selectedJadwal.kelas_praktikum?.nama_praktikum || '-'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-gray-600">Kelas</span>
                                <span className="col-span-2 text-gray-800">
                                    {selectedJadwal.kelas_praktikum?.nama_kelas || selectedJadwal.kelas_praktikum?.kode_kelas || '-'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-gray-600">Hari & Waktu</span>
                                <span className="col-span-2 text-gray-800 capitalize">
                                    {selectedJadwal.hari}, {selectedJadwal.jam_mulai} - {selectedJadwal.jam_selesai} WIB
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-gray-600">Ruangan Lab</span>
                                <span className="col-span-2 text-gray-800">
                                    {selectedJadwal.ruangan?.nama_ruangan} ({selectedJadwal.ruangan?.kode_ruangan}) <br />
                                    <span className="text-xs text-gray-500">Lokasi: {selectedJadwal.ruangan?.lokasi || '-'}</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b pb-2">
                                <span className="font-semibold text-gray-600">Dosen Pengampu</span>
                                <span className="col-span-2 text-gray-800">
                                    {selectedJadwal.kelas_praktikum?.dosen?.name || '-'} <br />
                                    <span className="text-xs text-gray-500">{selectedJadwal.kelas_praktikum?.dosen?.email || '-'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}