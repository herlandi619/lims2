import React, { useState, useEffect } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';

export default function Index({ alat, kategori, detailAlat, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriId, setKategoriId] = useState(filters.kategori_id || '');
    const [showQrModal, setShowQrModal] = useState(false);

    // Filter & Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/mahasiswa/inventaris', { 
            search, 
            kategori_id: kategoriId 
        }, { preserveState: true, preserveScroll: true });
    };

    // Ambil Detail Alat menggunakan Inertia (Tanpa Fetch API)
    const handleShowDetail = (id) => {
        router.get('/mahasiswa/inventaris', {
            ...filters,
            detail_id: id,
        }, { preserveState: true, preserveScroll: true });
    };

    // Tutup Modal Detail
    const handleCloseDetail = () => {
        const queryParams = { ...filters };
        delete queryParams.detail_id;
        delete queryParams.scan_qr;

        router.get('/mahasiswa/inventaris', queryParams, { preserveState: true, preserveScroll: true });
    };

    // Camera Scanner Integrasi untuk QR Code menggunakan Inertia
    useEffect(() => {
        let scanner;
        if (showQrModal) {
            scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    setShowQrModal(false);
                    
                    // Mengirimkan QR Code ke server via Inertia Router
                    router.get('/mahasiswa/inventaris', {
                        ...filters,
                        scan_qr: decodedText
                    }, {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: 'QR Code Terdeteksi!',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    });
                },
                (error) => {}
            );
        }
        return () => {
            if (scanner) {
                scanner.clear().catch(() => {});
            }
        };
    }, [showQrModal]);

    return (
        <MahasiswaLayout>
            <Head title="Inventaris Laboratorium" />
            
            <div className="p-6 bg-white rounded-lg shadow-md">
                {/* Header & Tombol Scan QR */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                {/* Judul & Deskripsi Halaman */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Katalog Alat & Inventaris</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Cari, filter, dan scan QR code alat laboratorium</p>
                </div>

                {/* Group Tombol Aksi */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Tombol Riwayat Peminjaman (Sekunder / Outline) */}
                    <Link
                        href={route('mahasiswa.peminjaman.index')}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition shadow-sm"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Riwayat Peminjaman
                    </Link>

                    {/* Tombol Scan QR Code (Utama) */}
                    <button
                        onClick={() => setShowQrModal(true)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm whitespace-nowrap"
                    >
                        📷 Scan QR Code Alat
                    </button>
                </div>
            </div>

                {/* Form Filter & Search */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama, merk, atau kode alat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <select
                        value={kategoriId}
                        onChange={(e) => setKategoriId(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="">Semua Kategori</option>
                        {kategori.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium">
                        Cari
                    </button>
                </form>

                {/* Tabel Data Alat */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Foto</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Alat</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Kategori</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Lokasi</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Stok</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Kondisi</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {alat.data.length > 0 ? (
                                alat.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            {item.foto ? (
                                                <img src={`/storage/${item.foto}`} alt={item.nama_alat} className="w-12 h-12 object-cover rounded-md border" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Image</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-indigo-600">{item.kode_alat}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {item.nama_alat}
                                            {item.merk && <span className="block text-xs text-gray-500">Merk: {item.merk}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{item.kategori?.nama_kategori}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.lokasi?.nama_lokasi}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                                {item.stok_tersedia} / {item.jumlah_stok}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                item.kondisi === 'baik' ? 'bg-blue-100 text-blue-800' :
                                                item.kondisi === 'cukup' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.kondisi}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleShowDetail(item.id)}
                                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-md font-semibold text-xs transition"
                                            >
                                                Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500">Data alat tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (5 Data per Halaman) */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600">
                        Menampilkan <span className="font-semibold">{alat.from || 0}</span> - <span className="font-semibold">{alat.to || 0}</span> dari <span className="font-semibold">{alat.total}</span> data
                    </span>
                    <div className="flex gap-1">
                        {alat.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-xs border rounded-md transition ${
                                    link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Detail Alat */}
            {detailAlat && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{detailAlat.nama_alat}</h3>
                                <p className="text-xs text-gray-500">Kode Alat: {detailAlat.kode_alat} | QR: {detailAlat.qr_code}</p>
                            </div>
                            <button onClick={handleCloseDetail} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gambar Alat */}
                            <div className="md:col-span-1">
                                {detailAlat.foto ? (
                                    <img src={`/storage/${detailAlat.foto}`} alt={detailAlat.nama_alat} className="w-full h-48 object-cover rounded-lg border" />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">Tidak ada gambar</div>
                                )}
                            </div>

                            {/* Informasi Detail */}
                            <div className="md:col-span-2 space-y-2 text-sm text-gray-700">
                                <p><strong>Merk:</strong> {detailAlat.merk || '-'}</p>
                                <p><strong>Kategori:</strong> {detailAlat.kategori?.nama_kategori}</p>
                                <p><strong>Lokasi Ruangan:</strong> {detailAlat.lokasi?.nama_lokasi}</p>
                                <p><strong>Supplier:</strong> {detailAlat.supplier?.nama_supplier || '-'}</p>
                                <p><strong>Kondisi:</strong> <span className="capitalize font-semibold">{detailAlat.kondisi}</span></p>
                                <p><strong>Stok Tersedia:</strong> <span className="font-bold text-green-600">{detailAlat.stok_tersedia}</span> / {detailAlat.jumlah_stok}</p>
                                <p><strong>Spesifikasi:</strong></p>
                                <div className="bg-gray-50 p-2.5 rounded-md border text-xs text-gray-600">{detailAlat.spesifikasi || 'Tidak ada spesifikasi khusus'}</div>
                            </div>
                        </div>

                        {/* Maintenance & Kalibrasi */}
                        <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-1">🛠️ Maintenance Terakhir</h4>
                                {detailAlat.maintenance_alat && detailAlat.maintenance_alat.length > 0 ? (
                                    <div>
                                        <p>Tanggal: {detailAlat.maintenance_alat[0].tanggal_maintenance}</p>
                                        <p>Jenis: {detailAlat.maintenance_alat[0].jenis}</p>
                                        <p>Status: {detailAlat.maintenance_alat[0].status}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Belum ada riwayat maintenance</p>
                                )}
                            </div>

                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <h4 className="font-bold text-green-900 mb-1">⚖️ Kalibrasi Terakhir</h4>
                                {detailAlat.kalibrasi_alat && detailAlat.kalibrasi_alat.length > 0 ? (
                                    <div>
                                        <p>Tanggal: {detailAlat.kalibrasi_alat[0].tanggal_kalibrasi}</p>
                                        <p>Hasil: <strong className="capitalize">{detailAlat.kalibrasi_alat[0].hasil}</strong></p>
                                        <p>Next: {detailAlat.kalibrasi_alat[0].kalibrasi_berikutnya}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Belum ada riwayat kalibrasi</p>
                                )}
                            </div>
                        </div>

                        {/* Riwayat Penggunaan */}
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-800 mb-2">📜 Riwayat Penggunaan Terakhir</h4>
                            {detailAlat.riwayat_alat && detailAlat.riwayat_alat.length > 0 ? (
                                <ul className="space-y-1 text-xs text-gray-600 divide-y">
                                    {detailAlat.riwayat_alat.map((r) => (
                                        <li key={r.id} className="pt-1 flex justify-between">
                                            <span><strong>{r.user?.name || 'Sistem'}:</strong> {r.aktivitas}</span>
                                            <span className="text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">Belum ada catatan aktivitas penggunaan.</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium text-sm transition"
                            >
                                Tutup
                            </button>
                            {detailAlat.stok_tersedia > 0 && detailAlat.status === 'tersedia' && (
                                <button
                                    onClick={() => {
                                        router.get('/mahasiswa/peminjaman', { alat_id: detailAlat.id });
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition"
                                >
                                    Ajukan Pinjam Alat
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Scan QR Code */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-2 text-center text-gray-800">Scan QR Code Alat</h3>
                        <p className="text-xs text-gray-500 text-center mb-4">Arahkan kamera HP / Webcam ke QR Code alat laboratorium</p>
                        
                        <div id="reader" className="w-full overflow-hidden rounded-lg border"></div>

                        <button
                            onClick={() => setShowQrModal(false)}
                            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                        >
                            Batal / Tutup Camera
                        </button>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}