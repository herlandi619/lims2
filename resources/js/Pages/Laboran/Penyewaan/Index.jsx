import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import Swal from 'sweetalert2';

export default function Index({ penyewaan, rekap, filters }) {
    const { flash } = usePage().props;
    
    // States untuk Tabs & Search
    const [activeTab, setActiveTab] = useState('sewa');
    const [searchSewa, setSearchSewa] = useState(filters.search_sewa || '');
    const [searchRekap, setSearchRekap] = useState(filters.search_rekap || '');

    // State & Form Modal Buat Tagihan
    const [modalTagihan, setModalTagihan] = useState(false);
    const [selectedSewa, setSelectedSewa] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        total_tagihan: ''
    });

    // Flash Message
    useEffect(() => {
        if (flash.success) Swal.fire({ icon: 'success', title: 'Berhasil', text: flash.success, timer: 2000 });
        if (flash.error) Swal.fire({ icon: 'error', title: 'Gagal', text: flash.error });
    }, [flash]);

    // Handlers Search
    const handleSearchSewa = (e) => {
        e.preventDefault();
        router.get(route('laboran.penyewaan.index'), { ...filters, search_sewa: searchSewa }, { preserveState: true, replace: true });
    };

    const handleSearchRekap = (e) => {
        e.preventDefault();
        router.get(route('laboran.penyewaan.index'), { ...filters, search_rekap: searchRekap }, { preserveState: true, replace: true });
    };

    // Handler Approve (SweetAlert)
    const handleApprove = (id) => {
        Swal.fire({
            title: 'Setujui Penyewaan?',
            text: 'Setelah disetujui, Anda perlu membuatkan tagihan biaya untuk mahasiswa.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Setujui'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('laboran.penyewaan.approve', id), {}, { preserveScroll: true });
            }
        });
    };

    // Handler Buka Modal & Submit Tagihan
    const openModalTagihan = (item) => {
        setSelectedSewa(item);
        setModalTagihan(true);
    };

    const submitTagihan = (e) => {
        e.preventDefault();
        post(route('laboran.penyewaan.tagihan', selectedSewa.id), {
            onSuccess: () => {
                setModalTagihan(false);
                reset();
            }
        });
    };

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);

    return (
        <LaboranLayout>
            <Head title="Kelola Sewa & Tagihan Penelitian" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    
                    {/* Header & Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pengelolaan Sewa Penelitian</h2>
                        <nav className="-mb-px flex space-x-8">
                            <button onClick={() => setActiveTab('sewa')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sewa' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Persetujuan Sewa & Tagihan
                            </button>
                            <button onClick={() => setActiveTab('rekap')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'rekap' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Rekap Seluruh Tagihan
                            </button>
                        </nav>
                    </div>

                    {/* ================= TAB 1: PERSETUJUAN SEWA ================= */}
                    {activeTab === 'sewa' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearchSewa} className="flex w-full md:w-1/3">
                                    <input type="text" placeholder="Cari Mahasiswa / Judul..." value={searchSewa} onChange={(e) => setSearchSewa(e.target.value)} className="border border-gray-300 rounded-l px-3 py-2 text-sm w-full focus:ring focus:ring-indigo-200" />
                                    <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700">Cari</button>
                                </form>
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Mahasiswa</th>
                                            <th className="px-4 py-3 max-w-xs">Judul & Periode</th>
                                            <th className="px-4 py-3">Detail Alat</th>
                                            <th className="px-4 py-3 text-center">Status Sewa</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {penyewaan.data.length > 0 ? penyewaan.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-800">{item.mahasiswa?.name}</td>
                                                <td className="px-4 py-3">
                                                    <div className="truncate w-48 font-medium text-gray-700">{item.surat?.judul_penelitian}</div>
                                                    <div className="text-xs text-gray-500">{item.tanggal_mulai} s/d {item.tanggal_selesai}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ul className="list-disc pl-4 text-xs">
                                                        {item.details.map(d => (
                                                            <li key={d.id}>{d.alat?.nama_alat} ({d.jumlah})</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'menunggu_laboran' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {item.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center space-y-1">
                                                    {item.status === 'menunggu_laboran' && (
                                                        <button onClick={() => handleApprove(item.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 w-full block">
                                                            Setujui Sewa
                                                        </button>
                                                    )}
                                                    {item.status === 'disetujui' && !item.tagihan && (
                                                        <button onClick={() => openModalTagihan(item)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700 w-full block">
                                                            Buat Tagihan
                                                        </button>
                                                    )}
                                                    {item.tagihan && (
                                                        <span className="text-xs text-gray-500 italic block">Tagihan Dibuat</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="5" className="text-center py-4">Data tidak ditemukan.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                {penyewaan.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 border mx-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'} ${!link.url && 'opacity-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveState />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 2: REKAP TAGIHAN ================= */}
                    {activeTab === 'rekap' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearchRekap} className="flex w-full md:w-1/3">
                                    <input type="text" placeholder="Cari No. Nota / Mahasiswa..." value={searchRekap} onChange={(e) => setSearchRekap(e.target.value)} className="border border-gray-300 rounded-l px-3 py-2 text-sm w-full focus:ring focus:ring-indigo-200" />
                                    <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700">Cari</button>
                                </form>
                                
                                {/* Tombol Ekspor PDF */}
                                <a href={route('laboran.tagihan.export')} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 font-semibold shadow flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                    Cetak PDF Rekap
                                </a>
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">No. Nota</th>
                                            <th className="px-4 py-3">Mahasiswa</th>
                                            <th className="px-4 py-3">Judul Penelitian</th>
                                            <th className="px-4 py-3">Total Tagihan</th>
                                            <th className="px-4 py-3 text-center">Status Pembayaran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {rekap.data.length > 0 ? rekap.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold">{item.nomor_nota}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800">{item.mahasiswa?.name}</td>
                                                <td className="px-4 py-3 truncate max-w-xs">{item.penyewaan?.surat?.judul_penelitian}</td>
                                                <td className="px-4 py-3 font-semibold text-red-600">{formatRupiah(item.total_tagihan)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status_tagihan === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.status_tagihan.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="5" className="text-center py-4">Data rekap tidak ditemukan.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                {rekap.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 border mx-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'} ${!link.url && 'opacity-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveState />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Input Biaya Tagihan */}
            {modalTagihan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Buat Tagihan Biaya</h3>
                            <button onClick={() => setModalTagihan(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={submitTagihan} className="px-6 py-4">
                            
                            <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                                <p><strong>Mahasiswa:</strong> {selectedSewa?.mahasiswa?.name}</p>
                                <p><strong>Alat Disewa:</strong> {selectedSewa?.details.length} Item</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Biaya Sewa (Rp)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full border-gray-300 rounded focus:ring-indigo-200"
                                    value={data.total_tagihan}
                                    onChange={(e) => setData('total_tagihan', e.target.value)}
                                    placeholder="Contoh: 150000"
                                    required
                                />
                                {errors.total_tagihan && <span className="text-red-500 text-xs">{errors.total_tagihan}</span>}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setModalTagihan(false)} className="bg-gray-300 px-4 py-2 rounded text-sm mr-2 hover:bg-gray-400">Batal</button>
                                <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                                    {processing ? 'Memproses...' : 'Kirim ke Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LaboranLayout>
    );
}