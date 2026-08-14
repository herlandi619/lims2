import React, { useState, useEffect } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ bookingList, ruanganList, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        ruangan_id: '',
        tanggal: '',
        jam_mulai: '',
        jam_selesai: '',
        keperluan: '',
        catatan: '',
    });

    // Menampilkan Flash Message bawaan dari Inertia (Success / Error)
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
        router.get(route('dosen.booking-ruangan.index'), { search }, { preserveState: true, replace: true });
    };

    const handleOpenModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dosen.booking-ruangan.store'), {
            onSuccess: (page) => {
                // Jika tidak ada error di flash message
                if (page.props.flash?.success) {
                    setIsModalOpen(false);
                    reset();
                }
            },
            onError: (err) => {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terdapat kesalahan input pada form. Periksa kembali data Anda.',
                    icon: 'error',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    const handleCancel = (id) => {
        Swal.fire({
            title: 'Batalkan Pengajuan?',
            text: 'Apakah Anda yakin ingin membatalkan booking ruangan ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('dosen.booking-ruangan.cancel', id));
            }
        });
    };

    return (
        <DosenLayout header={<h2 className="font-semibold text-xl text-gray-800">Booking Ruangan</h2>}>
            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4 bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Booking Ruangan Laboratorium</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola dan ajukan pemesanan ruangan laboratorium</p>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm"
                    >
                        + Ajukan Booking Ruangan
                    </button>
                </div>

                {/* Card Table & Filter */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari Ruangan / Keperluan / Status..."
                            className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                            Cari
                        </button>
                    </form>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Ruangan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal & Waktu</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Keperluan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Catatan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookingList.data.length > 0 ? (
                                    bookingList.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{item.ruangan?.nama_ruangan}</div>
                                                <div className="text-xs text-gray-500">{item.ruangan?.kode_ruangan} - Lokasi: {item.ruangan?.lokasi || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                <div className="font-medium text-gray-800">{item.tanggal}</div>
                                                <div className="text-gray-500">{item.jam_mulai} - {item.jam_selesai}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs max-w-xs truncate">{item.keperluan || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 italic max-w-xs truncate">{item.catatan || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    item.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'ditolak' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {item.status === 'menunggu' ? 'Menunggu Verifikasi' : item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {item.status === 'menunggu' ? (
                                                    <button
                                                        onClick={() => handleCancel(item.id)}
                                                        className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold transition"
                                                    >
                                                        Batalkan
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-500">
                                            Belum ada data booking ruangan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination 5 Data */}
                    <div className="flex flex-col sm:flex-row justify-between items-center text-sm pt-2 gap-2">
                        <span className="text-gray-600">
                            Menampilkan {bookingList.from ?? 0} - {bookingList.to ?? 0} dari {bookingList.total} data
                        </span>
                        <div className="flex gap-1">
                            {bookingList.links.map((link, idx) => (
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

            {/* MODAL FORM BOX: Ajukan Booking */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Form Booking Ruangan</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pilih Ruangan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    value={data.ruangan_id}
                                    onChange={(e) => setData('ruangan_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Ruangan --</option>
                                    {ruanganList.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.nama_ruangan} ({r.kode_ruangan}) - Kapasitas: {r.kapasitas || '-'} orang
                                        </option>
                                    ))}
                                </select>
                                {errors.ruangan_id && <span className="text-xs text-red-500">{errors.ruangan_id}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Tanggal Booking <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                />
                                {errors.tanggal && <span className="text-xs text-red-500">{errors.tanggal}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Jam Mulai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                        value={data.jam_mulai}
                                        onChange={(e) => setData('jam_mulai', e.target.value)}
                                    />
                                    {errors.jam_mulai && <span className="text-xs text-red-500">{errors.jam_mulai}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Jam Selesai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                        value={data.jam_selesai}
                                        onChange={(e) => setData('jam_selesai', e.target.value)}
                                    />
                                    {errors.jam_selesai && <span className="text-xs text-red-500">{errors.jam_selesai}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Keperluan / Alasan Pemesanan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    rows="2"
                                    placeholder="Contoh: Praktikum Mandiri Mata Kuliah Jaringan Komputer"
                                    value={data.keperluan}
                                    onChange={(e) => setData('keperluan', e.target.value)}
                                ></textarea>
                                {errors.keperluan && <span className="text-xs text-red-500">{errors.keperluan}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                    rows="2"
                                    placeholder="Contoh: Membutuhkan proyektor dan koneksi kabel LAN tambahan."
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                ></textarea>
                                {errors.catatan && <span className="text-xs text-red-500">{errors.catatan}</span>}
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}