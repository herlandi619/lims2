import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout'; // Sesuaikan path jika berbeda (misal: '../../Layouts/MahasiswaLayout')

export default function Index({ jadwalList, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('mahasiswa.jadwal-laboratorium.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    return (
        <MahasiswaLayout>
            <Head title="Jadwal Praktikum Saya" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Laboratorium Saya</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Daftar jadwal praktikum yang Anda ikuti semester ini.
                    </p>
                </div>

                {/* Filter & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari mata kuliah, ruangan, atau dosen..."
                            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="px-6 py-3">Hari & Waktu</th>
                                    <th className="px-6 py-3">Mata Kuliah & Kelas</th>
                                    <th className="px-6 py-3">Ruangan</th>
                                    <th className="px-6 py-3">Dosen Pengampu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {jadwalList.data.length > 0 ? (
                                    jadwalList.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="capitalize font-semibold text-gray-800 block">
                                                    {item.hari}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {item.jam_mulai} - {item.jam_selesai} WIB
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {item.kelas_praktikum?.nama_praktikum || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Kode: {item.kelas_praktikum?.kode_kelas || '-'} ({item.kelas_praktikum?.nama_kelas || '-'})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {item.ruangan?.nama_ruangan || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.ruangan?.kode_ruangan} - {item.ruangan?.lokasi}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {item.kelas_praktikum?.dosen?.name || 'Belum ditentukan'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.kelas_praktikum?.dosen?.email || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada jadwal laboratorium yang ditemukan untuk kelas Anda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Link */}
                    {jadwalList.links && (
                        <div className="p-4 border-t flex justify-between items-center text-xs text-gray-500">
                            <div>
                                Menampilkan {jadwalList.from || 0} - {jadwalList.to || 0} dari {jadwalList.total} data
                            </div>
                            <div className="flex gap-1">
                                {jadwalList.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white font-medium'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MahasiswaLayout>
    );
}