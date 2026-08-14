import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, arsipList, sopList, filters, flash }) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'arsip');
    const [searchArsip, setSearchArsip] = useState(filters.search_arsip || '');
    const [searchSop, setSearchSop] = useState(filters.search_sop || '');

    // State Modals
    const [arsipModal, setArsipModal] = useState({ open: false, item: null });
    const [sopModal, setSopModal] = useState({ open: false, item: null });

    // Form Inertia - Arsip
    const {
        data: arsipData,
        setData: setArsipData,
        post: postArsip,
        processing: arsipProcessing,
        errors: arsipErrors,
        reset: resetArsip,
    } = useForm({
        judul: '',
        kategori: 'modul',
        file: null,
    });

    // Form Inertia - SOP
    const {
        data: sopData,
        setData: setSopData,
        post: postSop,
        processing: sopProcessing,
        errors: sopErrors,
        reset: resetSop,
    } = useForm({
        kode_sop: '',
        judul_sop: '',
        kategori: 'penggunaan_alat',
        versi: '1.0',
        file_sop: null,
        deskripsi: '',
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
            route('laboran.arsip-sop.index'),
            { tab: activeTab, search_arsip: searchArsip, search_sop: searchSop },
            { preserveState: true, replace: true }
        );
    };

    // Modal Handler: Arsip
    const openArsipModal = (item = null) => {
        if (item) {
            setArsipModal({ open: true, item });
            setArsipData({
                judul: item.judul || '',
                kategori: item.kategori || 'modul',
                file: null,
            });
        } else {
            setArsipModal({ open: true, item: null });
            resetArsip();
        }
    };

    const submitArsip = (e) => {
        e.preventDefault();
        if (arsipModal.item) {
            postArsip(route('laboran.arsip.update', arsipModal.item.id), {
                onSuccess: () => setArsipModal({ open: false, item: null }),
            });
        } else {
            postArsip(route('laboran.arsip.store'), {
                onSuccess: () => setArsipModal({ open: false, item: null }),
            });
        }
    };

    const handleDeleteArsip = (id) => {
        Swal.fire({
            title: 'Hapus File Arsip?',
            text: 'File yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('laboran.arsip.destroy', id));
            }
        });
    };

    // Modal Handler: SOP
    const openSopModal = (item = null) => {
        if (item) {
            setSopModal({ open: true, item });
            setSopData({
                kode_sop: item.kode_sop || '',
                judul_sop: item.judul_sop || '',
                kategori: item.kategori || 'penggunaan_alat',
                versi: item.versi || '1.0',
                file_sop: null,
                deskripsi: item.deskripsi || '',
            });
        } else {
            setSopModal({ open: true, item: null });
            resetSop();
        }
    };

    const submitSop = (e) => {
        e.preventDefault();
        if (sopModal.item) {
            postSop(route('laboran.sop.update', sopModal.item.id), {
                onSuccess: () => setSopModal({ open: false, item: null }),
            });
        } else {
            postSop(route('laboran.sop.store'), {
                onSuccess: () => setSopModal({ open: false, item: null }),
            });
        }
    };

    const handleDeleteSop = (id) => {
        Swal.fire({
            title: 'Hapus Dokumen SOP?',
            text: 'Dokumen SOP beserta filenya akan dihapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('laboran.sop.destroy', id));
            }
        });
    };

    const formatKategoriLabel = (text) => {
        return text ? text.replace(/_/g, ' ').toUpperCase() : '-';
    };

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Manajemen Arsip & SOP" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Arsip & SOP Laboratorium</h1>
                    <p className="text-sm text-gray-500">Kelola dan upload file modul, panduan, manual alat, dan Standar Operasional Prosedur (SOP).</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 space-x-4">
                    <button
                        onClick={() => setActiveTab('arsip')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'arsip'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Arsip Dokumen & Modul
                    </button>
                    <button
                        onClick={() => setActiveTab('sop')}
                        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'sop'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        SOP Laboratorium
                    </button>
                </div>

                {/* TAB 1: ARSIP DOKUMEN */}
                {activeTab === 'arsip' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari judul arsip..."
                                    value={searchArsip}
                                    onChange={(e) => setSearchArsip(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button onClick={() => openArsipModal()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                                + Upload Arsip / Modul
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Judul Arsip</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Kategori</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Uploader</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">File</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {arsipList.data.length > 0 ? (
                                            arsipList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{item.judul}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                            {formatKategoriLabel(item.kategori)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-600">{item.user?.name || 'Sistem'}</td>
                                                    <td className="px-6 py-4">
                                                        {item.file && (
                                                            <a
                                                                href={`/storage/${item.file}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1"
                                                            >
                                                                📄 Unduh File
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        <button onClick={() => openArsipModal(item)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded hover:bg-amber-100">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteArsip(item.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data arsip.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Arsip */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {arsipList.total} Data</span>
                                <div className="flex space-x-1">
                                    {arsipList.links?.map((link, idx) => (
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

                {/* TAB 2: SOP LABORATORIUM */}
                {activeTab === 'sop' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari kode, judul, kategori SOP..."
                                    value={searchSop}
                                    onChange={(e) => setSearchSop(e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm w-full max-w-xs focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                                    Cari
                                </button>
                            </form>
                            <button onClick={() => openSopModal()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                                + Tambah Dokumen SOP
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Kode & Judul SOP</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Kategori</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Versi</th>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-600">File SOP</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {sopList.data.length > 0 ? (
                                            sopList.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono font-bold text-indigo-600 block">{item.kode_sop}</span>
                                                        <span className="font-bold text-gray-900">{item.judul_sop}</span>
                                                        <p className="text-xs text-gray-500">{item.deskripsi || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                            {formatKategoriLabel(item.kategori)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-700">v{item.versi}</td>
                                                    <td className="px-6 py-4">
                                                        {item.file_sop && (
                                                            <a
                                                                href={`/storage/${item.file_sop}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1"
                                                            >
                                                                📄 Buka SOP
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1.5">
                                                        <button onClick={() => openSopModal(item)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded hover:bg-amber-100">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteSop(item.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400">Tidak ada data SOP.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination SOP */}
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total: {sopList.total} Data</span>
                                <div className="flex space-x-1">
                                    {sopList.links?.map((link, idx) => (
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

                {/* MODAL UPLOAD / EDIT ARSIP */}
                {arsipModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {arsipModal.item ? 'Edit Arsip Dokumen' : 'Upload Arsip Dokumen Baru'}
                                </h3>
                                <button onClick={() => setArsipModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitArsip} className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Judul Dokumen / Arsip *</label>
                                    <input
                                        type="text"
                                        value={arsipData.judul}
                                        onChange={(e) => setArsipData('judul', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        placeholder="Contoh: Modul Praktikum Pemrograman Web 2026"
                                        required
                                    />
                                    {arsipErrors.judul && <p className="text-xs text-red-500 mt-1">{arsipErrors.judul}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kategori *</label>
                                    <select
                                        value={arsipData.kategori}
                                        onChange={(e) => setArsipData('kategori', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="sop">SOP</option>
                                        <option value="modul">Modul Praktikum</option>
                                        <option value="manual_alat">Manual Alat</option>
                                        <option value="dokumen">Dokumen Umum</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        Upload File {arsipModal.item ? '(Kosongkan jika tidak diubah)' : '*'}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setArsipData('file', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required={!arsipModal.item}
                                    />
                                    {arsipErrors.file && <p className="text-xs text-red-500 mt-1">{arsipErrors.file}</p>}
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setArsipModal({ open: false, item: null })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={arsipProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {arsipProcessing ? 'Memproses...' : 'Simpan Arsip'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL UPLOAD / EDIT SOP */}
                {sopModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-base">
                                    {sopModal.item ? 'Edit Dokumen SOP' : 'Tambah SOP Laboratorium Baru'}
                                </h3>
                                <button onClick={() => setSopModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>
                            <form onSubmit={submitSop} className="p-6 space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kode SOP *</label>
                                        <input
                                            type="text"
                                            value={sopData.kode_sop}
                                            onChange={(e) => setSopData('kode_sop', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            placeholder="SOP-LAB-001"
                                            required
                                        />
                                        {sopErrors.kode_sop && <p className="text-xs text-red-500 mt-1">{sopErrors.kode_sop}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Versi *</label>
                                        <input
                                            type="text"
                                            value={sopData.versi}
                                            onChange={(e) => setSopData('versi', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            placeholder="1.0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Judul SOP *</label>
                                    <input
                                        type="text"
                                        value={sopData.judul_sop}
                                        onChange={(e) => setSopData('judul_sop', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        placeholder="SOP Penggunaan Mikroskop Digital"
                                        required
                                    />
                                    {sopErrors.judul_sop && <p className="text-xs text-red-500 mt-1">{sopErrors.judul_sop}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kategori *</label>
                                    <select
                                        value={sopData.kategori}
                                        onChange={(e) => setSopData('kategori', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        required
                                    >
                                        <option value="penggunaan_alat">Penggunaan Alat</option>
                                        <option value="keselamatan_kerja">Keselamatan Kerja (K3)</option>
                                        <option value="penggunaan_ruangan">Penggunaan Ruangan</option>
                                        <option value="peminjaman_alat">Peminjaman Alat</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        File Dokumen SOP {sopModal.item ? '(Kosongkan jika tidak diubah)' : '*'}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setSopData('file_sop', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required={!sopModal.item}
                                    />
                                    {sopErrors.file_sop && <p className="text-xs text-red-500 mt-1">{sopErrors.file_sop}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Deskripsi Singkat</label>
                                    <textarea
                                        rows="2"
                                        value={sopData.deskripsi}
                                        onChange={(e) => setSopData('deskripsi', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setSopModal({ open: false, item: null })}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sopProcessing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {sopProcessing ? 'Memproses...' : 'Simpan SOP'}
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