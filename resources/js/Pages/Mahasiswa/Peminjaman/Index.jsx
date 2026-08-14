import React, { useState, useEffect } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ peminjaman, daftarAlat, selectedAlatId, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        alat_id: selectedAlatId || '',
        jumlah: 1,
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tanggal_rencana_kembali: '',
        keperluan: '',
    }); 

    useEffect(() => {
        if (selectedAlatId) {
            setData('alat_id', selectedAlatId);
            setShowModal(true);
        }
    }, [selectedAlatId]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/mahasiswa/peminjaman', { search }, { preserveState: true, preserveScroll: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/mahasiswa/peminjaman', {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                reset();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pengajuan peminjaman alat berhasil dikirim.',
                    icon: 'success',
                    confirmButtonColor: '#4F46E5',
                });
            },
        });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        clearErrors();
        reset();
    };

    // Helper untuk memformat angka ke Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(number);
    };

    return (
        <MahasiswaLayout>
            <Head title="Sewa Alat" />

            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                    {/* Judul & Deskripsi Halaman */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat & Pengajuan Sewa Alat</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola dan ajukan Sewa alat laboratorium</p>
                    </div>

                    {/* Group Tombol Aksi */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link
                            href={route('mahasiswa.inventaris.index')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali
                        </Link>

                        <button
                            onClick={() => {
                                reset();
                                setShowModal(true);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Sewa Alat Baru
                        </button>
                    </div>
                </div>

                {/* Form Search */}
                <form onSubmit={handleSearch} className="flex gap-4 mb-6 sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Cari kode TRX atau nama alat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                    <button type="submit" className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium">
                        Cari
                    </button>
                </form>

                {/* Tabel Peminjaman */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode TRX</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Detail Alat</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tgl Pinjam</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rencana Kembali</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Keperluan</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status Pinjam</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total Denda</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status Denda</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {peminjaman.data.length > 0 ? (
                                peminjaman.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-semibold text-indigo-600">{item.kode_peminjaman}</td>
                                        <td className="px-4 py-3">
                                            {item.details && item.details.length > 0 ? (
                                                item.details.map((dt) => (
                                                    <div key={dt.id} className="text-gray-900 font-medium">
                                                        {dt.alat?.nama_alat || '-'} <span className="text-gray-500 text-xs">({dt.jumlah} Unit)</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{item.tanggal_pinjam}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.tanggal_rencana_kembali}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.keperluan || '-'}</td>
                                        
                                        {/* Status Peminjaman */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                item.status === 'disetujui' || item.status === 'dipinjam' ? 'bg-green-100 text-green-800' :
                                                item.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                                                item.status === 'dikembalikan' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        {/* Nominal Total Denda */}
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {item.total_denda > 0 ? (
                                                <span className="text-red-600 font-semibold">{formatRupiah(item.total_denda)}</span>
                                            ) : (
                                                <span className="text-gray-400">Rp 0</span>
                                            )}
                                        </td>

                                        {/* Status Denda */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                item.status_denda === 'lunas' ? 'bg-green-100 text-green-800' :
                                                item.status_denda === 'belum_dibayar' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {item.status_denda === 'tidak_ada' ? 'Tidak Ada' : item.status_denda.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500">Belum ada riwayat Sewa Alat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600">
                        Menampilkan <span className="font-semibold">{peminjaman.from || 0}</span> - <span className="font-semibold">{peminjaman.to || 0}</span> dari <span className="font-semibold">{peminjaman.total}</span> data
                    </span>
                    <div className="flex gap-1">
                        {peminjaman.links.map((link, idx) => (
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

            {/* Modal Box */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Form Pengajuan Sewa Alat</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Pilih Alat Laboratorium</label>
                                <select
                                    value={data.alat_id}
                                    onChange={(e) => setData('alat_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                >
                                    <option value="">-- Pilih Alat --</option>
                                    {daftarAlat.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.kode_alat} - {a.nama_alat} (Stok: {a.stok_tersedia})
                                        </option>
                                    ))}
                                </select>
                                {errors.alat_id && <p className="text-red-500 text-xs mt-1">{erprors.alat_id}</p>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Jumlah Sewa Alat</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.jumlah}
                                    onChange={(e) => setData('jumlah', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                                {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Tanggal Sewa</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_pinjam}
                                        onChange={(e) => setData('tanggal_pinjam', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                    {errors.tanggal_pinjam && <p className="text-red-500 text-xs mt-1">{errors.tanggal_pinjam}</p>}
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Rencana Kembali</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_rencana_kembali}
                                        onChange={(e) => setData('tanggal_rencana_kembali', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                    {errors.tanggal_rencana_kembali && <p className="text-red-500 text-xs mt-1">{errors.tanggal_rencana_kembali}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Keperluan / Alasan</label>
                                <textarea
                                    value={data.keperluan}
                                    onChange={(e) => setData('keperluan', e.target.value)}
                                    rows="3"
                                    placeholder="Contoh: Untuk Praktikum / Penelitian Tugas Akhir"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                ></textarea>
                                {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                                >
                                    {processing ? 'Menyimpan...' : 'Kirim Pengajuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}