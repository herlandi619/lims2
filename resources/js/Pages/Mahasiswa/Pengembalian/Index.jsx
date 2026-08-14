import React, { useState, useEffect, useRef } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';

export default function Index({ peminjamanAktif, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    // State Modals & Scanner
    const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const html5QrCodeRef = useRef(null);

    // Form Pengembalian Inertia (Upload Foto + Kondisi)
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        foto_pengembalian: null,
        kondisi_sesudah: 'baik',
        catatan: '',
    });

    // Handle SweetAlert Flash Messages
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#4F46E5',
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'Gagal!',
                text: flash.error,
                icon: 'error',
                confirmButtonColor: '#EF4444',
            });
        }
    }, [flash]);

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mahasiswa.pengembalian.index'), { search }, { preserveState: true, replace: true });
    };

    // Open Modal Pengembalian
    const handleOpenForm = (peminjaman) => {
        reset();
        clearErrors();
        setSelectedPeminjaman(peminjaman);
    };

    // Submit Pengembalian
    const handleSubmitPengembalian = (e) => {
        e.preventDefault();
        post(route('mahasiswa.pengembalian.store', selectedPeminjaman.id), {
            onSuccess: () => {
                setSelectedPeminjaman(null);
                reset();
            },
        });
    };

    // Start Scanner Kamera QR Code
    const startScanner = async () => {
        setIsScannerOpen(true);
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader-qr-pengembalian");
                html5QrCodeRef.current = html5QrCode;
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        html5QrCode.stop().then(() => {
                            setIsScannerOpen(false);
                            // Otomatis cari peminjaman berstatus 'dipinjam' yang cocok dengan Kode QR
                            const match = peminjamanAktif.data.find(
                                (p) => p.status === 'dipinjam' && (
                                    p.kode_peminjaman === decodedText ||
                                    p.details.some(d => d.alat?.qr_code === decodedText || d.alat?.kode_alat === decodedText)
                                )
                            );

                            if (match) {
                                handleOpenForm(match);
                            } else {
                                Swal.fire({
                                    title: 'Tidak Ditemukan',
                                    text: `Tidak ada peminjaman aktif yang cocok dengan kode/QR "${decodedText}".`,
                                    icon: 'error',
                                    confirmButtonColor: '#4F46E5',
                                });
                            }
                        });
                    },
                    () => {}
                );
            } catch (err) {
                Swal.fire('Error Kamera', 'Gagal membuka kamera perangkat Anda.', 'error');
                setIsScannerOpen(false);
            }
        }, 300);
    };

    // Stop Scanner Kamera
    const stopScanner = () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => setIsScannerOpen(false));
        } else {
            setIsScannerOpen(false);
        }
    };

    return (
        <MahasiswaLayout header={<h2 className="font-semibold text-xl text-gray-800">Pengembalian Alat Laboratorium</h2>}>
            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header & Tombol Utama */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4 bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Form Pengembalian Alat</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Scan QR code alat/peminjaman atau pilih alat dari daftar di bawah</p>
                    </div>

                    <button
                        onClick={startScanner}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition shadow-sm"
                    >
                        📷 Scan QR Pengembalian
                    </button>
                </div>

                {/* Section Table & Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari Kode Peminjaman / Nama Alat..."
                            className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                            Cari
                        </button>
                    </form>

                    {/* Table Transaksi Aktif */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode Peminjaman</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Detail Alat</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tgl Pinjam</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {peminjamanAktif.data.length > 0 ? (
                                    peminjamanAktif.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">{item.kode_peminjaman}</td>
                                            <td className="px-4 py-3">
                                                <ul className="list-disc list-inside text-xs space-y-0.5">
                                                    {item.details?.map((d) => (
                                                        <li key={d.id}>
                                                            <span className="font-medium">{d.alat?.nama_alat}</span> ({d.jumlah} unit)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-4 py-3 text-xs whitespace-nowrap">{item.tanggal_pinjam}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    item.status === 'dipinjam' ? 'bg-indigo-100 text-indigo-800' :
                                                    item.status === 'menunggu_verifikasi_kembali' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {item.status === 'dipinjam' ? 'Sedang Dipinjam' :
                                                     item.status === 'menunggu_verifikasi_kembali' ? 'Menunggu Verifikasi Laboran' : 'Dikembalikan'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {item.status === 'dipinjam' ? (
                                                    <button
                                                        onClick={() => handleOpenForm(item)}
                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition"
                                                    >
                                                        Proses Pengembalian
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Tidak ada aksi</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">
                                            Tidak ada data alat yang sedang dipinjam atau dikembalikan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination 5 Data */}
                    <div className="flex flex-col sm:flex-row justify-between items-center text-sm pt-2 gap-2">
                        <span className="text-gray-600">
                            Menampilkan {peminjamanAktif.from ?? 0} - {peminjamanAktif.to ?? 0} dari {peminjamanAktif.total} data
                        </span>
                        <div className="flex gap-1">
                            {peminjamanAktif.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 border rounded-md text-xs font-medium transition ${
                                        link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL 1: Scanner Kamera QR Code */}
            {isScannerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800">Scan QR Code Alat / Pinjaman</h3>
                        <div id="reader-qr-pengembalian" className="w-full bg-black rounded-lg overflow-hidden min-h-[250px]"></div>
                        <button onClick={stopScanner} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">
                            Tutup Kamera
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 2: Modal Box Form Pengembalian (Upload Foto & Pilih Kondisi) */}
            {selectedPeminjaman && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Pengembalian Alat</h3>
                                <p className="text-xs text-indigo-600 font-semibold">{selectedPeminjaman.kode_peminjaman}</p>
                            </div>
                            <button onClick={() => setSelectedPeminjaman(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmitPengembalian} className="space-y-4">
                            {/* Form Step 1: Upload Foto */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    1. Upload Foto Bukti Pengembalian / Kondisi Alat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full text-sm border border-gray-300 rounded-lg p-1.5 focus:ring-indigo-500"
                                    onChange={(e) => setData('foto_pengembalian', e.target.files[0])}
                                />
                                {errors.foto_pengembalian && <span className="text-xs text-red-500">{errors.foto_pengembalian}</span>}
                            </div>

                            {/* Form Step 2: Pilih Kondisi */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    2. Kondisi Alat Saat Ini <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    value={data.kondisi_sesudah}
                                    onChange={(e) => setData('kondisi_sesudah', e.target.value)}
                                >
                                    <option value="baik">Baik (Lengkap & Berfungsi)</option>
                                    <option value="cukup">Cukup (Kotor / Tergores Sedikit)</option>
                                    <option value="rusak">Rusak / Tidak Berfungsi</option>
                                </select>
                                {errors.kondisi_sesudah && <span className="text-xs text-red-500">{errors.kondisi_sesudah}</span>}
                            </div>

                            {/* Form Step 3: Catatan */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    3. Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    rows="3"
                                    placeholder="Contoh: Alat dikembalikan dalam wadah aslinya."
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPeminjaman(null)}
                                    className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Pengembalian'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}