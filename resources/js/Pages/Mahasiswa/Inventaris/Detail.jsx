import React from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Link } from '@inertiajs/react';

export default function Detail({ alat, riwayat, maintenanceTerakhir, kalibrasiTerakhir }) {
    return (
        <MahasiswaLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Detail Alat: {alat.nama_alat}</h2>}>
            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Informasi Utama Alat */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Foto Alat */}
                        <div className="flex flex-col items-center">
                            <img
                                src={alat.foto ? `/storage/${alat.foto}` : '/images/placeholder-alat.png'}
                                alt={alat.nama_alat}
                                className="w-full h-64 object-cover rounded-lg border shadow-sm"
                            />
                            <div className="mt-4 w-full">
                                <Link
                                    href={route('mahasiswa.peminjaman.index')}
                                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium text-sm hover:bg-indigo-700"
                                >
                                    Pinjam Alat Ini
                                </Link>
                            </div>
                        </div>

                        {/* Rincian Informasi */}
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex justify-between items-start border-b pb-2">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{alat.nama_alat}</h3>
                                    <p className="text-sm text-gray-500">Kode: {alat.kode_alat} | QR: {alat.qr_code}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    alat.status === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {alat.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Kategori:</span>
                                    <span className="font-medium text-gray-800">{alat.kategori?.nama_kategori || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Lokasi Penyimpanan:</span>
                                    <span className="font-medium text-gray-800">{alat.lokasi?.nama_lokasi || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Merk:</span>
                                    <span className="font-medium text-gray-800">{alat.merk || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Kondisi Saat Ini:</span>
                                    <span className="font-medium capitalize text-gray-800">{alat.kondisi}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Total Stok:</span>
                                    <span className="font-medium text-gray-800">{alat.jumlah_stok} Unit</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Stok Tersedia:</span>
                                    <span className="font-medium text-indigo-600">{alat.stok_tersedia} Unit</span>
                                </div>
                            </div>

                            <div className="border-t pt-2">
                                <span className="text-gray-500 block text-xs">Spesifikasi:</span>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{alat.spesifikasi || 'Tidak ada informasi spesifikasi.'}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Status Maintenance & Kalibrasi Terakhir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            🛠️ Maintenance Terakhir
                        </h4>
                        {maintenanceTerakhir ? (
                            <div className="text-sm space-y-1 text-gray-600">
                                <p><span className="font-semibold">Tanggal:</span> {maintenanceTerakhir.tanggal_maintenance}</p>
                                <p><span className="font-semibold">Jenis:</span> {maintenanceTerakhir.jenis}</p>
                                <p><span className="font-semibold">Status:</span> {maintenanceTerakhir.status}</p>
                                <p><span className="font-semibold">Keterangan:</span> {maintenanceTerakhir.keterangan || '-'}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Belum ada catatan maintenance.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            ⚖️ Kalibrasi Terakhir
                        </h4>
                        {kalibrasiTerakhir ? (
                            <div className="text-sm space-y-1 text-gray-600">
                                <p><span className="font-semibold">Tanggal:</span> {kalibrasiTerakhir.tanggal_kalibrasi}</p>
                                <p><span className="font-semibold">Hasil:</span> {kalibrasiTerakhir.hasil}</p>
                                <p><span className="font-semibold">Kalibrasi Berikutnya:</span> {kalibrasiTerakhir.kalibrasi_berikutnya}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Belum ada catatan kalibrasi.</p>
                        )}
                    </div>
                </div>

                {/* Tabel Riwayat Penggunaan Alat */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">📋 Riwayat Penggunaan / Aktivitas Alat</h4>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Waktu</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Pengguna</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Aktivitas</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {riwayat.data.length > 0 ? (
                                    riwayat.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 text-gray-500 text-xs">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-2 font-medium">{item.user?.name || 'Sistem'}</td>
                                            <td className="px-4 py-2">{item.aktivitas}</td>
                                            <td className="px-4 py-2 text-gray-500">{item.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-400">
                                            Belum ada riwayat aktivitas untuk alat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Riwayat (5 data per halaman) */}
                    <div className="mt-4 flex justify-between items-center text-xs">
                        <div className="text-gray-500">Total {riwayat.total} riwayat</div>
                        <div className="flex gap-1">
                            {riwayat.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2 py-1 border rounded ${
                                        link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                {/* Tombol Kembali Ke Daftar Inventaris */}
                    <div className="mb-4">
                        <Link
                            href={route('mahasiswa.inventaris.index')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 transition"
                        >
                            ← Kembali ke Inventaris
                        </Link>
                    </div>

            </div>
        </MahasiswaLayout>
    );
}