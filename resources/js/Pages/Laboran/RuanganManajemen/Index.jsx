import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ 
    auth, 
    bookingList = { data: [], links: [], total: 0 }, 
    jadwalList = { data: [], links: [], total: 0 }, 
    ruanganList = [], 
    kelasPraktikumList = [], 
    filters = {}, 
    flash = {} 
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'booking');
    const [searchBooking, setSearchBooking] = useState(filters.search_booking || '');
    const [searchJadwal, setSearchJadwal] = useState(filters.search_jadwal || '');

    // State Modal
    const [bookingModal, setBookingModal] = useState({ open: false, item: null, action: 'approve' });
    const [jadwalModal, setJadwalModal] = useState({ open: false, item: null });

    // Form Inertia untuk Booking Approval
    const { data: bookingData, setData: setBookingData, post: postBooking, processing: bookingProcessing, reset: resetBooking } = useForm({
        catatan: '',
    });

    // Form Inertia untuk CRUD Jadwal
    const { data: jadwalData, setData: setJadwalData, post: postJadwal, processing: jadwalProcessing, errors: jadwalErrors, reset: resetJadwal } = useForm({
        _method: 'POST',
        ruangan_id: '',
        kelas_praktikum_id: '',
        hari: 'senin',
        jam_mulai: '',
        jam_selesai: '',
    });

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('laboran.ruangan-manajemen.index'),
            { tab: activeTab, search_booking: searchBooking, search_jadwal: searchJadwal },
            { preserveState: true, replace: true }
        );
    };

    // Open Modal Booking Approval / Reject
    const openBookingModal = (item, action) => {
        setBookingModal({ open: true, item, action });
        resetBooking();
        setBookingData('catatan', item.catatan || '');
    };

    const submitBookingAction = (e) => {
        e.preventDefault();
        const routeName = bookingModal.action === 'approve' ? 'laboran.booking.approve' : 'laboran.booking.reject';
        postBooking(route(routeName, bookingModal.item.id), {
            onSuccess: () => setBookingModal({ open: false, item: null, action: 'approve' }),
        });
    };

    const handleFinishBooking = (id) => {
        Swal.fire({
            title: 'Tandai Selesai?',
            text: 'Penggunaan ruangan akan diselesaikan.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Selesai',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(route('laboran.booking.finish', id));
            }
        });
    };

    // Open Modal Jadwal (Create / Edit)
    const openJadwalModal = (item = null) => {
        if (item) {
            setJadwalModal({ open: true, item });
            setJadwalData({
                _method: 'PUT',
                ruangan_id: item.ruangan_id || '',
                kelas_praktikum_id: item.kelas_praktikum_id || '',
                hari: item.hari || 'senin',
                jam_mulai: item.jam_mulai || '',
                jam_selesai: item.jam_selesai || '',
            });
        } else {
            setJadwalModal({ open: true, item: null });
            resetJadwal();
            setJadwalData('_method', 'POST');
        }
    };

    const submitJadwal = (e) => {
        e.preventDefault();
        if (jadwalModal.item) {
            postJadwal(route('laboran.jadwal.update', jadwalModal.item.id), {
                onSuccess: () => setJadwalModal({ open: false, item: null }),
            });
        } else {
            postJadwal(route('laboran.jadwal.store'), {
                onSuccess: () => setJadwalModal({ open: false, item: null }),
            });
        }
    };

    const handleDeleteJadwal = (id) => {
        Swal.fire({
            title: 'Hapus Jadwal?',
            text: 'Jadwal yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('laboran.jadwal.destroy', id));
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'menunggu': return 'bg-yellow-100 text-yellow-800';
            case 'disetujui': return 'bg-blue-100 text-blue-800';
            case 'selesai': return 'bg-green-100 text-green-800';
            case 'ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Manajemen Booking & Jadwal Lab" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Ruangan & Jadwal Lab</h1>
                    <p className="text-sm text-gray-500">Persetujuan pemakaian ruangan dan pengelolaan jadwal tetap laboratorium.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 space-x-4">
                    <button
                        onClick={() => setActiveTab('booking')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'booking'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Approval Booking Ruangan
                    </button>
                    <button
                        onClick={() => setActiveTab('jadwal')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'jadwal'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Jadwal Laboratorium (CRUD)
                    </button>
                </div>

                {/* TAB 1: BOOKING RUANGAN */}
                {activeTab === 'booking' && (
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Cari ruangan, peminjam, atau keperluan..."
                                value={searchBooking}
                                onChange={(e) => setSearchBooking(e.target.value)}
                                className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                Cari
                            </button>
                        </form>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Peminjam & Ruangan</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tanggal & Waktu</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Keperluan</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {bookingList?.data?.length > 0 ? (
                                            bookingList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.ruangan?.nama_ruangan}</div>
                                                        <div className="text-xs text-gray-500">{item.user?.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-700">
                                                        <p className="font-medium">{item.tanggal}</p>
                                                        <p className="text-gray-500">{item.jam_mulai} - {item.jam_selesai}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">{item.keperluan || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        {item.status === 'menunggu' && (
                                                            <>
                                                                <button onClick={() => openBookingModal(item, 'approve')} className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 font-semibold rounded hover:bg-emerald-100">
                                                                    Setujui
                                                                </button>
                                                                <button onClick={() => openBookingModal(item, 'reject')} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status === 'disetujui' && (
                                                            <button onClick={() => handleFinishBooking(item.id)} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 font-semibold rounded hover:bg-blue-100">
                                                                Selesai
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada pengajuan booking.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Booking */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {bookingList?.total || 0} Data</span>
                                <div className="flex space-x-1">
                                    {bookingList?.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: JADWAL LABORATORIUM */}
                {activeTab === 'jadwal' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari matkul, kelas, ruangan..."
                                    value={searchJadwal}
                                    onChange={(e) => setSearchJadwal(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button onClick={() => openJadwalModal()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                                + Tambah Jadwal Lab
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Mata Kuliah & Kelas</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Ruangan</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Dosen Pengampu</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Hari & Jam</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {jadwalList?.data?.length > 0 ? (
                                            jadwalList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.kelas_praktikum?.nama_praktikum || item.mata_kuliah}</div>
                                                        <div className="text-xs text-gray-500">Kelas: {item.kelas_praktikum?.nama_kelas || item.kelas}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{item.ruangan?.nama_ruangan}</td>
                                                    <td className="px-6 py-4 text-gray-600 text-xs">
                                                        {item.kelas_praktikum?.dosen?.name || item.dosen?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-700">
                                                        <span className="font-semibold capitalize text-indigo-600 block">{item.hari}</span>
                                                        <span>{item.jam_mulai} - {item.jam_selesai}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        <button onClick={() => openJadwalModal(item)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded hover:bg-amber-100">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteJadwal(item.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data jadwal laboratorium.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Jadwal */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {jadwalList?.total || 0} Data</span>
                                <div className="flex space-x-1">
                                    {jadwalList?.links?.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL BOOKING APPROVAL / REJECT */}
                {bookingModal.open && bookingModal.item && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {bookingModal.action === 'approve' ? 'Setujui' : 'Tolak'} Booking Ruangan
                                </h3>
                                <button onClick={() => setBookingModal({ open: false, item: null, action: 'approve' })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitBookingAction} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        Catatan {bookingModal.action === 'reject' && '*'}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={bookingData.catatan}
                                        onChange={(e) => setBookingData('catatan', e.target.value)}
                                        placeholder={bookingModal.action === 'reject' ? 'Berikan alasan penolakan...' : 'Catatan opsi persetujuan...'}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required={bookingModal.action === 'reject'}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setBookingModal({ open: false, item: null, action: 'approve' })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={bookingProcessing}
                                        className={`px-4 py-2 text-white text-xs font-semibold rounded-lg ${
                                            bookingModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        {bookingProcessing ? 'Memproses...' : bookingModal.action === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL FORM CRUD JADWAL LAB */}
                {jadwalModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {jadwalModal.item ? 'Edit Jadwal Laboratorium' : 'Tambah Jadwal Laboratorium'}
                                </h3>
                                <button onClick={() => setJadwalModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitJadwal} className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Ruangan *</label>
                                    <select
                                        value={jadwalData.ruangan_id}
                                        onChange={(e) => setJadwalData('ruangan_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Ruangan --</option>
                                        {ruanganList?.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nama_ruangan} ({r.kode_ruangan})</option>
                                        ))}
                                    </select>
                                    {jadwalErrors.ruangan_id && <p className="text-xs text-red-500 mt-1">{jadwalErrors.ruangan_id}</p>}
                                </div>

                                {/* Menggunakan Kelas Praktikum (yang menyatu dengan Dosen) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kelas Praktikum & Dosen *</label>
                                    <select
                                        value={jadwalData.kelas_praktikum_id}
                                        onChange={(e) => setJadwalData('kelas_praktikum_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Kelas Praktikum / Dosen --</option>
                                        {kelasPraktikumList?.map((kp) => (
                                            <option key={kp.id} value={kp.id}>
                                                {kp.nama_praktikum} - {kp.nama_kelas} ({kp.dosen?.name || 'Dosen TBD'})
                                            </option>
                                        ))}
                                    </select>
                                    {jadwalErrors.kelas_praktikum_id && <p className="text-xs text-red-500 mt-1">{jadwalErrors.kelas_praktikum_id}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hari *</label>
                                        <select
                                            value={jadwalData.hari}
                                            onChange={(e) => setJadwalData('hari', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="senin">Senin</option>
                                            <option value="selasa">Selasa</option>
                                            <option value="rabu">Rabu</option>
                                            <option value="kamis">Kamis</option>
                                            <option value="jumat">Jumat</option>
                                            <option value="sabtu">Sabtu</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jam Mulai *</label>
                                        <input
                                            type="time"
                                            value={jadwalData.jam_mulai}
                                            onChange={(e) => setJadwalData('jam_mulai', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jam Selesai *</label>
                                        <input
                                            type="time"
                                            value={jadwalData.jam_selesai}
                                            onChange={(e) => setJadwalData('jam_selesai', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setJadwalModal({ open: false, item: null })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={jadwalProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {jadwalProcessing ? 'Memproses...' : jadwalModal.item ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LaboranLayout>
    );
}