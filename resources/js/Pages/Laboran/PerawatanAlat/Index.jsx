import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, maintenanceList, kalibrasiList, alatList, filters, flash }) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'maintenance');
    const [searchMaint, setSearchMaint] = useState(filters.search_maintenance || '');
    const [searchKalib, setSearchKalib] = useState(filters.search_kalibrasi || '');

    // State Modals
    const [maintModal, setMaintModal] = useState({ open: false, item: null });
    const [kalibModal, setKalibModal] = useState({ open: false, item: null });

    // Form Inertia - Maintenance
    const {
        data: maintData,
        setData: setMaintData,
        post: postMaint,
        processing: maintProcessing,
        errors: maintErrors,
        reset: resetMaint,
    } = useForm({
        alat_id: '',
        tanggal_maintenance: '',
        jenis: 'preventif',
        teknisi: '',
        biaya: '0',
        status: 'proses',
        keterangan: '',
    });

    // Form Inertia - Kalibrasi
    const {
        data: kalibData,
        setData: setKalibData,
        post: postKalib,
        processing: kalibProcessing,
        errors: kalibErrors,
        reset: resetKalib,
    } = useForm({
        alat_id: '',
        tanggal_kalibrasi: '',
        kalibrasi_berikutnya: '',
        hasil: 'lulus',
        sertifikat: null,
        keterangan: '',
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
            route('laboran.perawatan-alat.index'),
            { tab: activeTab, search_maintenance: searchMaint, search_kalibrasi: searchKalib },
            { preserveState: true, replace: true }
        );
    };

    // Modal Handler: Maintenance
    const openMaintModal = (item = null) => {
        if (item) {
            setMaintModal({ open: true, item });
            setMaintData({
                alat_id: item.alat_id || '',
                tanggal_maintenance: item.tanggal_maintenance || '',
                jenis: item.jenis || 'preventif',
                teknisi: item.teknisi || '',
                biaya: item.biaya || '0',
                status: item.status || 'proses',
                keterangan: item.keterangan || '',
            });
        } else {
            setMaintModal({ open: true, item: null });
            resetMaint();
        }
    };

    const submitMaint = (e) => {
        e.preventDefault();
        if (maintModal.item) {
            postMaint(route('laboran.maintenance.update', maintModal.item.id), {
                onSuccess: () => setMaintModal({ open: false, item: null }),
            });
        } else {
            postMaint(route('laboran.maintenance.store'), {
                onSuccess: () => setMaintModal({ open: false, item: null }),
            });
        }
    };

    const handleDeleteMaint = (id) => {
        Swal.fire({
            title: 'Hapus Maintenance?',
            text: 'Data yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('laboran.maintenance.destroy', id));
            }
        });
    };

    // Modal Handler: Kalibrasi
    const openKalibModal = (item = null) => {
        if (item) {
            setKalibModal({ open: true, item });
            setKalibData({
                alat_id: item.alat_id || '',
                tanggal_kalibrasi: item.tanggal_kalibrasi || '',
                kalibrasi_berikutnya: item.kalibrasi_berikutnya || '',
                hasil: item.hasil || 'lulus',
                sertifikat: null,
                keterangan: item.keterangan || '',
            });
        } else {
            setKalibModal({ open: true, item: null });
            resetKalib();
        }
    };

    const submitKalib = (e) => {
        e.preventDefault();
        if (kalibModal.item) {
            postKalib(route('laboran.kalibrasi.update', kalibModal.item.id), {
                onSuccess: () => setKalibModal({ open: false, item: null }),
            });
        } else {
            postKalib(route('laboran.kalibrasi.store'), {
                onSuccess: () => setKalibModal({ open: false, item: null }),
            });
        }
    };

    const handleDeleteKalib = (id) => {
        Swal.fire({
            title: 'Hapus Kalibrasi?',
            text: 'Data beserta sertifikat akan dihapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('laboran.kalibrasi.destroy', id));
            }
        });
    };

    // Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Maintenance & Kalibrasi Alat" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance & Kalibrasi Alat</h1>
                    <p className="text-sm text-gray-500">Kelola riwayat pemeliharaan berkala serta sertifikasi kalibrasi alat laboratorium.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 space-x-4">
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'maintenance'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Maintenance Alat
                    </button>
                    <button
                        onClick={() => setActiveTab('kalibrasi')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'kalibrasi'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Kalibrasi Alat
                    </button>
                </div>

                {/* TAB 1: MAINTENANCE ALAT */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari alat, teknisi, jenis..."
                                    value={searchMaint}
                                    onChange={(e) => setSearchMaint(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button onClick={() => openMaintModal()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                                + Tambah Maintenance
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Alat</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl & Jenis</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Teknisi & Biaya</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {maintenanceList.data.length > 0 ? (
                                            maintenanceList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.alat?.nama_alat || '-'}</div>
                                                        <div className="text-xs text-gray-500">{item.keterangan || 'Tanpa keterangan'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-700">
                                                        <span className="font-semibold block">{item.tanggal_maintenance}</span>
                                                        <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-600 inline-block mt-1">
                                                            {item.jenis}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-700">
                                                        <p className="font-medium">{item.teknisi || '-'}</p>
                                                        <p className="text-emerald-600 font-semibold">{formatRupiah(item.biaya)}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                                            item.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        <button onClick={() => openMaintModal(item)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded hover:bg-amber-100">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteMaint(item.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data maintenance.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Maintenance */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {maintenanceList.total} Data</span>
                                <div className="flex space-x-1">
                                    {maintenanceList.links?.map((link, idx) => (
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

                {/* TAB 2: KALIBRASI ALAT */}
                {activeTab === 'kalibrasi' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari alat atau hasil..."
                                    value={searchKalib}
                                    onChange={(e) => setSearchKalib(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button onClick={() => openKalibModal()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                                + Tambah Kalibrasi
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Alat</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Tgl Kalibrasi</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Jadwal Berikutnya</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Hasil & Sertifikat</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {kalibrasiList.data.length > 0 ? (
                                            kalibrasiList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.alat?.nama_alat || '-'}</div>
                                                        <div className="text-xs text-gray-500">{item.keterangan || 'Tanpa keterangan'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-700">{item.tanggal_kalibrasi}</td>
                                                    <td className="px-6 py-4 text-xs font-medium text-indigo-600">{item.kalibrasi_berikutnya}</td>
                                                    <td className="px-6 py-4 space-y-1">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                                            item.hasil === 'lulus' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {item.hasil === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                                                        </span>
                                                        {item.sertifikat && (
                                                            <div className="mt-1">
                                                                <a
                                                                    href={`/storage/${item.sertifikat}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-indigo-600 hover:underline font-medium"
                                                                >
                                                                    📄 Lihat Sertifikat
                                                                </a>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        <button onClick={() => openKalibModal(item)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded hover:bg-amber-100">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteKalib(item.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data kalibrasi.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Kalibrasi */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {kalibrasiList.total} Data</span>
                                <div className="flex space-x-1">
                                    {kalibrasiList.links?.map((link, idx) => (
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

                {/* MODAL MAINTENANCE ALAT */}
                {maintModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {maintModal.item ? 'Edit Maintenance Alat' : 'Tambah Maintenance Alat'}
                                </h3>
                                <button onClick={() => setMaintModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitMaint} className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Pilih Alat *</label>
                                    <select
                                        value={maintData.alat_id}
                                        onChange={(e) => setMaintData('alat_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Alat --</option>
                                        {alatList.map((a) => (
                                            <option key={a.id} value={a.id}>{a.nama_alat}</option>
                                        ))}
                                    </select>
                                    {maintErrors.alat_id && <p className="text-xs text-red-500 mt-1">{maintErrors.alat_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tgl Maintenance *</label>
                                        <input
                                            type="date"
                                            value={maintData.tanggal_maintenance}
                                            onChange={(e) => setMaintData('tanggal_maintenance', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jenis *</label>
                                        <select
                                            value={maintData.jenis}
                                            onChange={(e) => setMaintData('jenis', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="preventif">Preventif</option>
                                            <option value="korektif">Korektif</option>
                                            <option value="darurat">Darurat</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Teknisi</label>
                                        <input
                                            type="text"
                                            value={maintData.teknisi}
                                            onChange={(e) => setMaintData('teknisi', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            placeholder="Nama teknisi / vendor"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Biaya (Rp) *</label>
                                        <input
                                            type="number"
                                            value={maintData.biaya}
                                            onChange={(e) => setMaintData('biaya', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status *</label>
                                    <select
                                        value={maintData.status}
                                        onChange={(e) => setMaintData('status', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="proses">Proses</option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Keterangan</label>
                                    <textarea
                                        rows="2"
                                        value={maintData.keterangan}
                                        onChange={(e) => setMaintData('keterangan', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setMaintModal({ open: false, item: null })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={maintProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {maintProcessing ? 'Memproses...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL KALIBRASI ALAT */}
                {kalibModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {kalibModal.item ? 'Edit Kalibrasi Alat' : 'Tambah Kalibrasi Alat'}
                                </h3>
                                <button onClick={() => setKalibModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitKalib} className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Pilih Alat *</label>
                                    <select
                                        value={kalibData.alat_id}
                                        onChange={(e) => setKalibData('alat_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Alat --</option>
                                        {alatList.map((a) => (
                                            <option key={a.id} value={a.id}>{a.nama_alat}</option>
                                        ))}
                                    </select>
                                    {kalibErrors.alat_id && <p className="text-xs text-red-500 mt-1">{kalibErrors.alat_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tgl Kalibrasi *</label>
                                        <input
                                            type="date"
                                            value={kalibData.tanggal_kalibrasi}
                                            onChange={(e) => setKalibData('tanggal_kalibrasi', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jadwal Berikutnya *</label>
                                        <input
                                            type="date"
                                            value={kalibData.kalibrasi_berikutnya}
                                            onChange={(e) => setKalibData('kalibrasi_berikutnya', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hasil *</label>
                                    <select
                                        value={kalibData.hasil}
                                        onChange={(e) => setKalibData('hasil', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="lulus">Lulus</option>
                                        <option value="tidak_lulus">Tidak Lulus</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">File Sertifikat (PDF / Gambar)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setKalibData('sertifikat', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {kalibErrors.sertifikat && <p className="text-xs text-red-500 mt-1">{kalibErrors.sertifikat}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Keterangan</label>
                                    <textarea
                                        rows="2"
                                        value={kalibData.keterangan}
                                        onChange={(e) => setKalibData('keterangan', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setKalibModal({ open: false, item: null })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={kalibProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {kalibProcessing ? 'Memproses...' : 'Simpan Data'}
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