import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, peminjaman, filters, flash, pengaturanDenda }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'detail', 'approve', 'reject', 'verifikasi'

    // Form Inertia untuk Reject & Approve
    const { data: actionData, setData: setActionData, post: postAction, processing: actionProcessing, reset: resetAction } = useForm({
        catatan_laboran: '',
    });

    // Form Inertia untuk Verifikasi Pengembalian
    const { data: returnData, setData: setReturnData, post: postReturn, processing: returnProcessing, errors: returnErrors, reset: resetReturn } = useForm({
        items: [],
        catatan_laboran: '',
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

    // Handle Filter & Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboran.sirkulasi.index'), { search, status: statusFilter }, { preserveState: true, replace: true });
    };

    // Helper Hitung Hari Terlambat
    const getDaysOverdue = (targetDate) => {
        if (!targetDate) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const planDate = new Date(targetDate);
        planDate.setHours(0, 0, 0, 0);
        
        const diffTime = today - planDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Modal Handlers
    const openModal = (item, mode) => {
        setSelectedPeminjaman(item);
        setModalMode(mode);

        if (mode === 'approve' || mode === 'reject') {
            resetAction();
            setActionData('catatan_laboran', item.catatan_laboran || '');
        }

        if (mode === 'verifikasi') {
            resetReturn();
            const formattedItems = item.details.map((d) => ({
                id: d.id,
                alat_nama: d.alat?.nama_alat,
                jumlah: d.jumlah,
                kondisi_sebelum: d.kondisi_sebelum,
                kondisi_sesudah: d.kondisi_sesudah || 'baik',
                denda_kerusakan: 0,
                foto_pengembalian: null,
            }));
            setReturnData({
                items: formattedItems,
                catatan_laboran: item.catatan_laboran || '',
            });
        }
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedPeminjaman(null);
        resetAction();
        resetReturn();
    };

    // Aksi Approve
    const handleApproveSubmit = (e) => {
        e.preventDefault();
        postAction(route('laboran.sirkulasi.approve', selectedPeminjaman.id), {
            onSuccess: () => closeModal(),
        });
    };

    // Aksi Reject
    const handleRejectSubmit = (e) => {
        e.preventDefault();
        postAction(route('laboran.sirkulasi.reject', selectedPeminjaman.id), {
            onSuccess: () => closeModal(),
        });
    };

    // Aksi Serahkan Alat
    const handleSerahkan = (id) => {
        Swal.fire({
            title: 'Serahkan Alat?',
            text: 'Stok alat akan dikurangi sesuai jumlah yang dipinjam!',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Ya, Serahkan!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('laboran.sirkulasi.serahkan', id));
            }
        });
    };

    // Aksi Bayar Denda (Konfirmasi Pelunasan)
    const handleBayarDenda = (item) => {
        Swal.fire({
            title: 'Konfirmasi Pembayaran Denda',
            text: `Tandai denda sebesar Rp ${Number(item.total_denda).toLocaleString('id-ID')} sebagai LUNAS?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Ya, Tandai Lunas',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('laboran.sirkulasi.bayar-denda', item.id));
            }
        });
    };

    // Aksi Submit Verifikasi Pengembalian
    const handleReturnSubmit = (e) => {
        e.preventDefault();
        postReturn(route('laboran.sirkulasi.verifikasi-kembali', selectedPeminjaman.id), {
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    // Helper Badge Status Peminjaman
    const getStatusBadge = (status) => {
        switch (status) {
            case 'menunggu': return 'bg-yellow-100 text-yellow-800';
            case 'disetujui': return 'bg-blue-100 text-blue-800';
            case 'dipinjam': return 'bg-purple-100 text-purple-800';
            case 'dikembalikan': return 'bg-green-100 text-green-800';
            case 'ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper Badge Status Denda
    const getStatusDendaBadge = (status) => {
        switch (status) {
            case 'lunas': return 'bg-green-100 text-green-700 border border-green-200';
            case 'belum_dibayar': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // --- Kalkulasi Estimasi Denda di Modal Verifikasi ---
    const daysOverdue = selectedPeminjaman ? getDaysOverdue(selectedPeminjaman.tanggal_rencana_kembali) : 0;
    const dendaPerHari = pengaturanDenda?.denda_per_hari ?? 5000;
    const dendaRusakRingan = pengaturanDenda?.denda_rusak_ringan ?? 25000;
    const dendaRusakBerat = pengaturanDenda?.denda_rusak_berat ?? 50000;

    const estDendaTerlambat = daysOverdue > 0 ? daysOverdue * dendaPerHari : 0;

    const estDendaKerusakan = returnData.items.reduce((total, item) => {
        if (item.denda_kerusakan && !isNaN(item.denda_kerusakan) && parseFloat(item.denda_kerusakan) > 0) {
            return total + parseFloat(item.denda_kerusakan);
        }
        
        let dendaItem = 0;
        if (item.kondisi_sesudah === 'rusak_ringan') {
            dendaItem = dendaRusakRingan;
        } else if (item.kondisi_sesudah === 'rusak_berat') {
            dendaItem = dendaRusakBerat;
        }

        return total + (dendaItem * (item.jumlah || 1));
    }, 0);

    const totalEstDenda = estDendaTerlambat + estDendaKerusakan;

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Sirkulasi & Peminjaman Alat" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Persetujuan & Verifikasi Peminjaman</h1>
                    <p className="text-sm text-gray-500">Kelola persetujuan, penyerahan, serta verifikasi pengembalian alat laboratorium.</p>
                </div>

                {/* Filter & Search Form */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Cari kode/peminjam..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Semua Status --</option>
                            <option value="menunggu">Menunggu</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="dipinjam">Dipinjam</option>
                            <option value="dikembalikan">Dikembalikan</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                            Filter
                        </button>
                    </form>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Kode & Peminjam</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl Pinjam</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Rencana Kembali</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Denda</th>
                                    <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {peminjaman.data.length > 0 ? (
                                    peminjaman.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.kode_peminjaman}</div>
                                                <div className="text-xs text-gray-500">{item.user?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{item.tanggal_pinjam}</td>
                                            <td className="px-6 py-4 text-gray-700">{item.tanggal_rencana_kembali}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.total_denda > 0 ? (
                                                    <div>
                                                        <span className="font-semibold text-red-600 text-xs block">
                                                            Rp {Number(item.total_denda).toLocaleString('id-ID')}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusDendaBadge(item.status_denda)}`}>
                                                            {item.status_denda?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-1.5">
                                                <button onClick={() => openModal(item, 'detail')} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200">
                                                    Detail
                                                </button>

                                                {item.status_denda === 'belum_dibayar' && (
                                                    <button 
                                                        onClick={() => handleBayarDenda(item)} 
                                                        className="text-xs px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 shadow-sm"
                                                    >
                                                        Bayar Denda
                                                    </button>
                                                )}

                                                {item.status === 'menunggu' && (
                                                    <>
                                                        <button onClick={() => openModal(item, 'approve')} className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 font-semibold rounded hover:bg-emerald-100">
                                                            Setujui
                                                        </button>
                                                        <button onClick={() => openModal(item, 'reject')} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}

                                                {item.status === 'disetujui' && (
                                                    <button onClick={() => handleSerahkan(item.id)} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 font-semibold rounded hover:bg-indigo-100">
                                                        Serahkan Alat
                                                    </button>
                                                )}

                                                {item.status === 'dipinjam' && (
                                                    <button onClick={() => openModal(item, 'verifikasi')} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 font-semibold rounded hover:bg-purple-100">
                                                        Verifikasi Pengembalian
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-400">Tidak ada transaksi peminjaman ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            Menampilkan {peminjaman.from || 0} - {peminjaman.to || 0} dari {peminjaman.total || 0} Data
                        </span>
                        <div className="flex space-x-1">
                            {peminjaman.links?.map((link, idx) => (
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

                {/* MODAL 1: Detail Peminjaman */}
                {modalMode === 'detail' && selectedPeminjaman && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">Detail Peminjaman #{selectedPeminjaman.kode_peminjaman}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <div className="p-6 space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Peminjam</span>
                                        <p className="font-semibold text-gray-800">{selectedPeminjaman.user?.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block">Status</span>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(selectedPeminjaman.status)}`}>
                                            {selectedPeminjaman.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedPeminjaman.total_denda > 0 && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-red-700 font-bold">Total Denda:</span>
                                            <span className="text-sm font-bold text-red-600">Rp {Number(selectedPeminjaman.total_denda).toLocaleString('id-ID')}</span>
                                        </div>
                                        {selectedPeminjaman.catatan_denda && (
                                            <p className="text-xs text-red-600 italic">{selectedPeminjaman.catatan_denda}</p>
                                        )}
                                    </div>
                                )}

                                <div className="border-t pt-3">
                                    <h4 className="font-semibold text-gray-700 mb-2">Daftar Alat Dipinjam:</h4>
                                    <div className="space-y-2">
                                        {selectedPeminjaman.details?.map((d) => (
                                            <div key={d.id} className="p-2.5 bg-gray-50 rounded-lg border flex justify-between items-center text-xs">
                                                <div>
                                                    <p className="font-bold text-gray-800">{d.alat?.nama_alat}</p>
                                                    <p className="text-gray-500">Kondisi Awal: <span className="font-semibold capitalize">{d.kondisi_sebelum}</span></p>
                                                    {d.kondisi_sesudah && (
                                                        <p className="text-gray-500">Kondisi Akhir: <span className="font-semibold capitalize text-indigo-600">{d.kondisi_sesudah}</span></p>
                                                    )}
                                                </div>
                                                <span className="font-bold bg-white px-2 py-1 border rounded">{d.jumlah} Unit</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t text-right">
                                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300">
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Setujui / Tolak */}
                {(modalMode === 'approve' || modalMode === 'reject') && selectedPeminjaman && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {modalMode === 'approve' ? 'Setujui Peminjaman' : 'Tolak Peminjaman'} #{selectedPeminjaman.kode_peminjaman}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={modalMode === 'approve' ? handleApproveSubmit : handleRejectSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        Catatan Laboran {modalMode === 'reject' && '*'}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={actionData.catatan_laboran}
                                        onChange={(e) => setActionData('catatan_laboran', e.target.value)}
                                        placeholder={modalMode === 'reject' ? 'Berikan alasan penolakan...' : 'Catatan opsional...'}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required={modalMode === 'reject'}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionProcessing}
                                        className={`px-4 py-2 text-white text-xs font-semibold rounded-lg ${
                                            modalMode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        {actionProcessing ? 'Proses...' : modalMode === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Verifikasi Pengembalian */}
                {modalMode === 'verifikasi' && selectedPeminjaman && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                                <h3 className="font-bold text-gray-800 text-base">
                                    Verifikasi Pengembalian #{selectedPeminjaman.kode_peminjaman}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100">
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
                                <p className="text-xs text-gray-500">
                                    Periksa kondisi akhir setiap alat yang dikembalikan. Sistem akan menghitung denda secara otomatis, atau Anda dapat menentukan nilai override denda kerusakan secara manual.
                                </p>

                                {/* Banner Summary Estimasi Denda */}
                                {totalEstDenda > 0 && (
                                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                                        <div className="font-bold text-amber-900 flex justify-between text-sm">
                                            <span>Estimasi Total Denda:</span>
                                            <span>Rp {totalEstDenda.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="space-y-0.5 border-t border-amber-200/60 pt-1.5">
                                            {daysOverdue > 0 && (
                                                <p className="text-amber-800 flex justify-between">
                                                    <span>• Terlambat {daysOverdue} hari:</span>
                                                    <span className="font-medium">Rp {estDendaTerlambat.toLocaleString('id-ID')}</span>
                                                </p>
                                            )}
                                            {estDendaKerusakan > 0 && (
                                                <p className="text-amber-800 flex justify-between">
                                                    <span>• Denda Kerusakan/Kondisi Alat:</span>
                                                    <span className="font-medium">Rp {estDendaKerusakan.toLocaleString('id-ID')}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* List Items Peminjaman */}
                                <div className="space-y-4">
                                    {returnData.items.map((item, index) => (
                                        <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <h4 className="font-bold text-gray-800 text-sm">{item.alat_nama}</h4>
                                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                                                    {item.jumlah} Unit
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                {/* Kondisi Akhir */}
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">
                                                        Kondisi Akhir <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={item.kondisi_sesudah}
                                                        onChange={(e) => {
                                                            const newItems = [...returnData.items];
                                                            newItems[index].kondisi_sesudah = e.target.value;
                                                            setReturnData('items', newItems);
                                                        }}
                                                        className="w-full rounded-lg border-gray-300 shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="baik">Baik</option>
                                                        <option value="rusak_ringan">Rusak Ringan</option>
                                                        <option value="rusak_berat">Rusak Berat</option>
                                                    </select>
                                                </div>

                                                {/* Override Denda Kerusakan */}
                                                <div>
                                                    <label className="block font-semibold text-gray-700 mb-1">
                                                        Override Denda Kerusakan (Rp)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Opsional (0 = Otomatis)"
                                                        value={item.denda_kerusakan}
                                                        onChange={(e) => {
                                                            const newItems = [...returnData.items];
                                                            newItems[index].denda_kerusakan = e.target.value;
                                                            setReturnData('items', newItems);
                                                        }}
                                                        className="w-full rounded-lg border-gray-300 shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Catatan Laboran */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        Catatan Pengembalian / Verifikasi
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={returnData.catatan_laboran}
                                        onChange={(e) => setReturnData('catatan_laboran', e.target.value)}
                                        placeholder="Catatan tambahan hasil pengecekan alat..."
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 pt-2 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={returnProcessing}
                                        className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700"
                                    >
                                        {returnProcessing ? 'Memproses...' : 'Simpan & Selesaikan Peminjaman'}
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