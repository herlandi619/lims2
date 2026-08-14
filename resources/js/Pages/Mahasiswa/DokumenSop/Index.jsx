import React, { useState } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Head, router, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ arsip, sop, filters }) {
    const [activeTab, setActiveTab] = useState(filters.active_tab || 'arsip');
    const [searchArsip, setSearchArsip] = useState(filters.search_arsip || '');
    const [searchSop, setSearchSop] = useState(filters.search_sop || '');

    // State Modal Box
    const [isArsipModalOpen, setIsArsipModalOpen] = useState(false);
    const [isSopModalOpen, setIsSopModalOpen] = useState(false);
    const [isEditArsip, setIsEditArsip] = useState(false);
    const [isEditSop, setIsEditSop] = useState(false);
    const [selectedArsipId, setSelectedArsipId] = useState(null);
    const [selectedSopId, setSelectedSopId] = useState(null);

    // Form Hooks Inertia - Arsip
    const formArsip = useForm({
        judul: '',
        kategori: 'modul',
        file: null,
    });

    // Form Hooks Inertia - SOP
    const formSop = useForm({
        kode_sop: '',
        judul_sop: '',
        kategori: 'penggunaan_alat',
        versi: '1.0',
        file_sop: null,
        deskripsi: '',
    });

    // --- Search Handler ---
    const handleSearchArsip = (e) => {
        e.preventDefault();
        router.get(
            route('mahasiswa.dokumen-sop.index'),
            { search_arsip: searchArsip, search_sop: searchSop, tab: 'arsip' },
            { preserveState: true }
        );
    };

    const handleSearchSop = (e) => {
        e.preventDefault();
        router.get(
            route('mahasiswa.dokumen-sop.index'),
            { search_arsip: searchArsip, search_sop: searchSop, tab: 'sop' },
            { preserveState: true }
        );
    };

    // --- Arsip Modal & Form Actions ---
    const openAddArsipModal = () => {
        setIsEditArsip(false);
        formArsip.reset();
        formArsip.clearErrors();
        setIsArsipModalOpen(true);
    };

    const openEditArsipModal = (item) => {
        setIsEditArsip(true);
        setSelectedArsipId(item.id);
        formArsip.setData({
            judul: item.judul,
            kategori: item.kategori,
            file: null,
        });
        formArsip.clearErrors();
        setIsArsipModalOpen(true);
    };

    const submitArsipForm = (e) => {
        e.preventDefault();
        if (isEditArsip) {
            formArsip.post(route('mahasiswa.dokumen-sop.arsip.update', selectedArsipId), {
                onSuccess: () => {
                    setIsArsipModalOpen(false);
                    Swal.fire('Berhasil!', 'Arsip berhasil diperbarui.', 'success');
                },
            });
        } else {
            formArsip.post(route('mahasiswa.dokumen-sop.arsip.store'), {
                onSuccess: () => {
                    setIsArsipModalOpen(false);
                    formArsip.reset();
                    Swal.fire('Berhasil!', 'Arsip berhasil ditambahkan.', 'success');
                },
            });
        }
    };

    const handleDeleteArsip = (id) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: 'Dokumen arsip akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('mahasiswa.dokumen-sop.arsip.destroy', id), {
                    onSuccess: () => Swal.fire('Dihapus!', 'Arsip berhasil dihapus.', 'success'),
                });
            }
        });
    };

    // --- SOP Modal & Form Actions ---
    const openAddSopModal = () => {
        setIsEditSop(false);
        formSop.reset();
        formSop.clearErrors();
        setIsSopModalOpen(true);
    };

    const openEditSopModal = (item) => {
        setIsEditSop(true);
        setSelectedSopId(item.id);
        formSop.setData({
            kode_sop: item.kode_sop,
            judul_sop: item.judul_sop,
            kategori: item.kategori,
            versi: item.versi,
            deskripsi: item.deskripsi || '',
            file_sop: null,
        });
        formSop.clearErrors();
        setIsSopModalOpen(true);
    };

    const submitSopForm = (e) => {
        e.preventDefault();
        if (isEditSop) {
            formSop.post(route('mahasiswa.dokumen-sop.sop.update', selectedSopId), {
                onSuccess: () => {
                    setIsSopModalOpen(false);
                    Swal.fire('Berhasil!', 'SOP berhasil diperbarui.', 'success');
                },
            });
        } else {
            formSop.post(route('mahasiswa.dokumen-sop.sop.store'), {
                onSuccess: () => {
                    setIsSopModalOpen(false);
                    formSop.reset();
                    Swal.fire('Berhasil!', 'SOP baru berhasil ditambahkan.', 'success');
                },
            });
        }
    };

    const handleDeleteSop = (id) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: 'Dokumen SOP akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('mahasiswa.dokumen-sop.sop.destroy', id), {
                    onSuccess: () => Swal.fire('Dihapus!', 'SOP berhasil dihapus.', 'success'),
                });
            }
        });
    };

    return (
        <MahasiswaLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dokumen Arsip & SOP Laboratorium</h2>}>
            <Head title="Dokumen & SOP" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Navigasi Tab */}
                <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-3">
                    <button
                        onClick={() => setActiveTab('arsip')}
                        className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors duration-150 ${
                            activeTab === 'arsip'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📁 Arsip Dokumen & Modul
                    </button>
                    <button
                        onClick={() => setActiveTab('sop')}
                        className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors duration-150 ${
                            activeTab === 'sop'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📋 Standard Operating Procedure (SOP)
                    </button>
                </div>

                {/* TAB 1: ARSIP DOKUMEN */}
                {activeTab === 'arsip' && (
                    <div className="bg-white p-6 shadow-sm rounded-b-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <form onSubmit={handleSearchArsip} className="flex gap-2 w-full md:w-1/3">
                                <input
                                    type="text"
                                    className="border border-gray-300 p-2 text-sm rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Cari judul/kategori arsip..."
                                    value={searchArsip}
                                    onChange={(e) => setSearchArsip(e.target.value)}
                                />
                                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm">Cari</button>
                            </form>
                            {/* <button
                                onClick={openAddArsipModal}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                + Tambah Arsip
                            </button> */}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Judul Dokumen</th>
                                        <th className="px-4 py-2 text-left">Kategori</th>
                                        <th className="px-4 py-2 text-left">Upload By</th>
                                        <th className="px-4 py-2 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {arsip.data.length > 0 ? arsip.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 font-semibold text-gray-800">{item.judul}</td>
                                            <td className="px-4 py-2">
                                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-semibold border border-blue-200 capitalize">
                                                    {item.kategori.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">{item.uploader?.name || 'Laboran'}</td>
                                            <td className="px-4 py-2 text-center space-x-2">
                                                <a
                                                    href={`/storage/${item.file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 rounded inline-block"
                                                >
                                                    Unduh
                                                </a>
                                                {/* <button
                                                    onClick={() => openEditArsipModal(item)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs py-1 px-3 rounded"
                                                >
                                                    Edit
                                                </button> */}
                                                {/* <button
                                                    onClick={() => handleDeleteArsip(item.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded"
                                                >
                                                    Hapus
                                                </button> */}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">Tidak ada data arsip.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Arsip */}
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-600">Menampilkan {arsip.from || 0} - {arsip.to || 0} dari {arsip.total} arsip</span>
                            <div className="flex gap-1">
                                {arsip.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded border text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: SOP LABORATORIUM */}
                {activeTab === 'sop' && (
                    <div className="bg-white p-6 shadow-sm rounded-b-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <form onSubmit={handleSearchSop} className="flex gap-2 w-full md:w-1/3">
                                <input
                                    type="text"
                                    className="border border-gray-300 p-2 text-sm rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Cari kode, judul, atau kategori SOP..."
                                    value={searchSop}
                                    onChange={(e) => setSearchSop(e.target.value)}
                                />
                                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm">Cari</button>
                            </form>
                            {/* <button
                                onClick={openAddSopModal}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                + Tambah SOP
                            </button> */}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Kode</th>
                                        <th className="px-4 py-2 text-left">Judul SOP</th>
                                        <th className="px-4 py-2 text-left">Kategori</th>
                                        <th className="px-4 py-2 text-center">Versi</th>
                                        <th className="px-4 py-2 text-left">Pembuat</th>
                                        <th className="px-4 py-2 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sop.data.length > 0 ? sop.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 font-mono font-bold text-indigo-600">{item.kode_sop}</td>
                                            <td className="px-4 py-2 font-medium text-gray-800">{item.judul_sop}</td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded font-semibold border border-emerald-200 capitalize">
                                                    {item.kategori.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center font-bold text-gray-700">v{item.versi}</td>
                                            <td className="px-4 py-2 text-gray-600">{item.pembuat?.name || 'Admin'}</td>
                                            <td className="px-4 py-2 text-center space-x-2">
                                                <a
                                                    href={`/storage/${item.file_sop}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 rounded inline-block"
                                                >
                                                    Unduh
                                                </a>
                                                {/* <button
                                                    onClick={() => openEditSopModal(item)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs py-1 px-3 rounded"
                                                >
                                                    Edit
                                                </button> */}
                                                {/* <button
                                                    onClick={() => handleDeleteSop(item.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded"
                                                >
                                                    Hapus
                                                </button> */}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-500">Tidak ada data SOP.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination SOP */}
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-600">Menampilkan {sop.from || 0} - {sop.to || 0} dari {sop.total} SOP</span>
                            <div className="flex gap-1">
                                {sop.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded border text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FORM ARSIP */}
            {isArsipModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">
                            {isEditArsip ? 'Edit Dokumen Arsip' : 'Tambah Dokumen Arsip'}
                        </h3>
                        <form onSubmit={submitArsipForm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Judul Dokumen</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    value={formArsip.data.judul}
                                    onChange={(e) => formArsip.setData('judul', e.target.value)}
                                    required
                                />
                                {formArsip.errors.judul && <div className="text-red-500 text-xs mt-1">{formArsip.errors.judul}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori Arsip</label>
                                <select
                                    className="w-full border border-gray-300 rounded p-2 text-sm capitalize"
                                    value={formArsip.data.kategori}
                                    onChange={(e) => formArsip.setData('kategori', e.target.value)}
                                >
                                    <option value="sop">SOP</option>
                                    <option value="modul">Modul</option>
                                    <option value="manual_alat">Manual Alat</option>
                                    <option value="dokumen">Dokumen</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    File Dokumen {isEditArsip && '(Kosongkan jika tidak diganti)'}
                                </label>
                                <input
                                    type="file"
                                    className="w-full border border-gray-300 rounded p-1.5 text-sm"
                                    onChange={(e) => formArsip.setData('file', e.target.files[0])}
                                    required={!isEditArsip}
                                />
                                {formArsip.errors.file && <div className="text-red-500 text-xs mt-1">{formArsip.errors.file}</div>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsArsipModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formArsip.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                >
                                    {formArsip.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FORM SOP */}
            {isSopModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-xl">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">
                            {isEditSop ? 'Edit Dokumen SOP' : 'Tambah Dokumen SOP Baru'}
                        </h3>
                        <form onSubmit={submitSopForm} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Kode SOP</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={formSop.data.kode_sop}
                                        onChange={(e) => formSop.setData('kode_sop', e.target.value)}
                                        placeholder="SOP-LAB-01"
                                        required
                                    />
                                    {formSop.errors.kode_sop && <div className="text-red-500 text-xs mt-1">{formSop.errors.kode_sop}</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Versi Dokumen</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={formSop.data.versi}
                                        onChange={(e) => formSop.setData('versi', e.target.value)}
                                        placeholder="1.0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Judul SOP</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    value={formSop.data.judul_sop}
                                    onChange={(e) => formSop.setData('judul_sop', e.target.value)}
                                    required
                                />
                                {formSop.errors.judul_sop && <div className="text-red-500 text-xs mt-1">{formSop.errors.judul_sop}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori SOP</label>
                                <select
                                    className="w-full border border-gray-300 rounded p-2 text-sm capitalize"
                                    value={formSop.data.kategori}
                                    onChange={(e) => formSop.setData('kategori', e.target.value)}
                                >
                                    <option value="penggunaan_alat">Penggunaan Alat</option>
                                    <option value="keselamatan_kerja">Keselamatan Kerja</option>
                                    <option value="penggunaan_ruangan">Penggunaan Ruangan</option>
                                    <option value="peminjaman_alat">Peminjaman Alat</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi/Keterangan</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm h-20"
                                    value={formSop.data.deskripsi}
                                    onChange={(e) => formSop.setData('deskripsi', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    File PDF SOP {isEditSop && '(Kosongkan jika tidak diganti)'}
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="w-full border border-gray-300 rounded p-1.5 text-sm"
                                    onChange={(e) => formSop.setData('file_sop', e.target.files[0])}
                                    required={!isEditSop}
                                />
                                {formSop.errors.file_sop && <div className="text-red-500 text-xs mt-1">{formSop.errors.file_sop}</div>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsSopModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSop.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                >
                                    {formSop.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}