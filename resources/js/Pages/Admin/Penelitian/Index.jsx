import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function Index({ penelitian, tagihan, filters }) {
    const { flash } = usePage().props;
    
    // States untuk Tabs & Search
    const [activeTab, setActiveTab] = useState('surat');
    const [searchSurat, setSearchSurat] = useState(filters.search_surat || '');
    const [searchTagihan, setSearchTagihan] = useState(filters.search_tagihan || '');

    // State untuk Modal Bukti Pembayaran
    const [modalBukti, setModalBukti] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Tangkap Flash Message
    useEffect(() => {
        if (flash.success) Swal.fire({ icon: 'success', title: 'Berhasil', text: flash.success, timer: 2000 });
        if (flash.error) Swal.fire({ icon: 'error', title: 'Gagal', text: flash.error });
    }, [flash]);

    // Handle Pencarian
    const handleSearchSurat = (e) => {
        e.preventDefault();
        router.get(route('admin.penelitian.index'), { ...filters, search_surat: searchSurat }, { preserveState: true, replace: true });
    };

    const handleSearchTagihan = (e) => {
        e.preventDefault();
        router.get(route('admin.penelitian.index'), { ...filters, search_tagihan: searchTagihan }, { preserveState: true, replace: true });
    };

    // Aksi Konfirmasi dengan SweetAlert
    const confirmAction = (title, text, routeName, id) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Lanjutkan'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route(routeName, id), {}, { preserveScroll: true });
            }
        });
    };

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);

    return (
        <AdminLayout>
            <Head title="Validasi Penelitian & Tagihan" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    
                    {/* Header & Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Administrasi Sewa Penelitian</h2>
                        <nav className="-mb-px flex space-x-8">
                            <button onClick={() => setActiveTab('surat')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'surat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Validasi Dokumen Surat
                            </button>
                            <button onClick={() => setActiveTab('tagihan')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tagihan' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Validasi & Rilis Tagihan
                            </button>
                        </nav>
                    </div>

                    {/* ================= TAB 1: SURAT PENELITIAN ================= */}
                    {activeTab === 'surat' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearchSurat} className="flex w-full md:w-1/3">
                                    <input type="text" placeholder="Cari Nama / Judul Penelitian..." value={searchSurat} onChange={(e) => setSearchSurat(e.target.value)} className="border border-gray-300 rounded-l px-3 py-2 text-sm w-full focus:ring focus:ring-indigo-200" />
                                    <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700">Cari</button>
                                </form>
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">Mahasiswa</th>
                                            <th className="px-4 py-3 max-w-xs">Judul Penelitian</th>
                                            <th className="px-4 py-3">Unduh Form</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {penelitian.data.length > 0 ? penelitian.data.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{penelitian.from + index}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800">{item.mahasiswa?.name}</td>
                                                <td className="px-4 py-3">{item.judul_penelitian}</td>
                                                <td className="px-4 py-3 space-x-2">
                                                    <a href={`/storage/${item.file_form_a}`} target="_blank" className="text-blue-600 hover:underline">Form A</a>|
                                                    <a href={`/storage/${item.file_form_b}`} target="_blank" className="text-blue-600 hover:underline">Form B</a>|
                                                    <a href={`/storage/${item.file_form_c}`} target="_blank" className="text-blue-600 hover:underline">Form C</a>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'menunggu_admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {item.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.status === 'menunggu_admin' && (
                                                        <button onClick={() => confirmAction('Teruskan Dokumen?', 'Dokumen sudah lengkap? Teruskan ke Laboran.', 'admin.penelitian.teruskan', item.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700">
                                                            Teruskan ke Laboran
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="text-center py-4">Data tidak ditemukan.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                {penelitian.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 border mx-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'} ${!link.url && 'opacity-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveState />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 2: TAGIHAN PENELITIAN ================= */}
                    {activeTab === 'tagihan' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearchTagihan} className="flex w-full md:w-1/3">
                                    <input type="text" placeholder="Cari No. Nota / Mahasiswa..." value={searchTagihan} onChange={(e) => setSearchTagihan(e.target.value)} className="border border-gray-300 rounded-l px-3 py-2 text-sm w-full focus:ring focus:ring-indigo-200" />
                                    <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700">Cari</button>
                                </form>
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">No. Nota</th>
                                            <th className="px-4 py-3">Mahasiswa</th>
                                            <th className="px-4 py-3">Total Tagihan</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-center">Bukti Bayar</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {tagihan.data.length > 0 ? tagihan.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold">{item.nomor_nota}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-800">{item.mahasiswa?.name}</div>
                                                    <div className="text-xs text-gray-500">Judul: {item.penyewaan?.surat?.judul_penelitian}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-red-600">{formatRupiah(item.total_tagihan)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status_tagihan === 'draft_laboran' ? 'bg-gray-100 text-gray-700' : item.status_tagihan === 'menunggu_pembayaran' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {item.status_tagihan.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.bukti_pembayaran ? (
                                                        <button onClick={() => { setSelectedImage(`/storage/${item.bukti_pembayaran}`); setModalBukti(true); }} className="text-blue-600 hover:underline">
                                                            Lihat Bukti
                                                        </button>
                                                    ) : <span className="text-gray-400 italic">Belum Ada</span>}
                                                </td>
                                                <td className="px-4 py-3 text-center space-y-1">
                                                    {item.status_tagihan === 'draft_laboran' && (
                                                        <button onClick={() => confirmAction('Rilis Tagihan?', 'Kirim tagihan ini agar mahasiswa bisa membayar.', 'admin.tagihan.rilis', item.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700 w-full">
                                                            Rilis Tagihan
                                                        </button>
                                                    )}
                                                    {item.status_tagihan === 'menunggu_pembayaran' && item.bukti_pembayaran && (
                                                        <button onClick={() => confirmAction('Verifikasi Pembayaran?', 'Apakah nominal yang ditransfer sesuai?', 'admin.tagihan.lunas', item.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 w-full">
                                                            Verifikasi Lunas
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="text-center py-4">Data tidak ditemukan.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                {tagihan.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 border mx-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'} ${!link.url && 'opacity-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveState />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Modal Bukti Pembayaran */}
            {modalBukti && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Bukti Pembayaran</h3>
                            <button onClick={() => setModalBukti(false)} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
                        </div>
                        <div className="flex justify-center">
                            <img src={selectedImage} alt="Bukti Transfer" className="max-h-[70vh] rounded object-contain border" />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setModalBukti(false)} className="bg-gray-800 text-white px-4 py-2 rounded text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}