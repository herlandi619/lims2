import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import Swal from 'sweetalert2';

export default function Index({ penelitian, alat, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal States
    const [modalSurat, setModalSurat] = useState(false);
    const [modalSewa, setModalSewa] = useState(false);
    const [modalUpload, setModalUpload] = useState(false);
    
    const [selectedSurat, setSelectedSurat] = useState(null);
    const [selectedTagihan, setSelectedTagihan] = useState(null);

    // Form: Ajukan Surat
    const formSurat = useForm({
        judul_penelitian: '',
        file_form_a: null,
        file_form_b: null,
        file_form_c: null,
    });

    // Form: Sewa Alat (Dinamis: minimal 2 alat)
    const formSewa = useForm({
        tanggal_mulai: '',
        tanggal_selesai: '',
        alat_ids: [],
        jumlah: {}, // Format: { alat_id: jumlah }
    });

    // Form: Upload Bukti
    const formUpload = useForm({
        bukti_pembayaran: null,
    });

    // Tangkap Flash Message untuk SweetAlert
    useEffect(() => {
        if (flash.success) Swal.fire({ icon: 'success', title: 'Berhasil', text: flash.success, timer: 2000 });
        if (flash.error) Swal.fire({ icon: 'error', title: 'Gagal', text: flash.error });
    }, [flash]);

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mahasiswa.penelitian.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Format Rupiah
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);

    // Submits
    const submitSurat = (e) => {
        e.preventDefault();
        formSurat.post(route('mahasiswa.penelitian.surat.store'), {
            forceFormData: true,
            onSuccess: () => { setModalSurat(false); formSurat.reset(); }
        });
    };

    const submitSewa = (e) => {
        e.preventDefault();
        formSewa.post(route('mahasiswa.penelitian.sewa.store', selectedSurat.id), {
            onSuccess: () => { setModalSewa(false); formSewa.reset(); }
        });
    };

    const submitUpload = (e) => {
        e.preventDefault();
        formUpload.post(route('mahasiswa.tagihan.upload', selectedTagihan.id), {
            forceFormData: true,
            onSuccess: () => { setModalUpload(false); formUpload.reset(); }
        });
    };

    // Handler Checkbox Alat (Sewa)
    const handleCheckAlat = (id, checked) => {
        let newIds = [...formSewa.data.alat_ids];
        let newJumlah = { ...formSewa.data.jumlah };
        if (checked) {
            newIds.push(id);
            newJumlah[id] = 1; // Default jumlah
        } else {
            newIds = newIds.filter(item => item !== id);
            delete newJumlah[id];
        }
        formSewa.setData({ ...formSewa.data, alat_ids: newIds, jumlah: newJumlah });
    };

    return (
        <MahasiswaLayout>
            <Head title="Penyewaan Penelitian" />
            
            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    
                    {/* Header & Search */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Surat & Penyewaan Penelitian</h2>
                        <div className="flex space-x-2">
                            <form onSubmit={handleSearch} className="flex">
                                <input
                                    type="text"
                                    placeholder="Cari Judul Penelitian..."
                                    className="border border-gray-300 rounded-l px-3 py-2 text-sm focus:ring focus:ring-blue-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700">Cari</button>
                            </form>
                            <button onClick={() => setModalSurat(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm shadow hover:bg-blue-700">
                                + Buat Surat
                            </button>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Judul Penelitian</th>
                                    <th className="px-4 py-3">Status Dokumen</th>
                                    <th className="px-4 py-3">Sewa & Tagihan</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penelitian.data.length > 0 ? (
                                    penelitian.data.map((item, index) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">{penelitian.from + index}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">{item.judul_penelitian}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'diteruskan_laboran' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {item.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {!item.penyewaan && <span className="text-gray-400 italic">Belum menyewa</span>}
                                                {item.penyewaan && (
                                                    <div className="text-xs space-y-1">
                                                        <div>Status Sewa: <b className="text-gray-800">{item.penyewaan.status.toUpperCase()}</b></div>
                                                        
                                                        {item.penyewaan.tagihan && item.penyewaan.tagihan.status_tagihan !== 'draft_laboran' ? (
                                                            <>
                                                                <div>Total Biaya: <b className="text-red-600">{formatRupiah(item.penyewaan.tagihan.total_tagihan)}</b></div>
                                                                <div>Status Tagihan: <b className={item.penyewaan.tagihan.status_tagihan === 'lunas' ? 'text-green-600' : 'text-yellow-600'}>
                                                                    {item.penyewaan.tagihan.status_tagihan.replace('_', ' ').toUpperCase()}
                                                                </b></div>
                                                            </>
                                                        ) : (
                                                            <div className="text-gray-500 italic mt-1">Menunggu Tagihan / Pembayaran</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center space-y-1">
                                                {/* Tombol Sewa: Muncul jika dokumen disetujui admin dan belum sewa */}
                                                {item.status === 'diteruskan_laboran' && !item.penyewaan && (
                                                    <button onClick={() => { setSelectedSurat(item); setModalSewa(true); }} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 block w-full mb-1">
                                                        Sewa Alat
                                                    </button>
                                                )}
                                                
                                                {/* Tombol Cetak Nota & Upload Bukti: Muncul jika tagihan sudah dirilis */}
                                                {item.penyewaan?.tagihan && item.penyewaan.tagihan.status_tagihan !== 'draft_laboran' && (
                                                    <>
                                                        <a href={route('mahasiswa.tagihan.cetak-nota', item.penyewaan.tagihan.id)} className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 block w-full mb-1 text-center">
                                                            Cetak Nota
                                                        </a>
                                                        {item.penyewaan.tagihan.status_tagihan === 'menunggu_pembayaran' && (
                                                            <button onClick={() => { setSelectedTagihan(item.penyewaan.tagihan); setModalUpload(true); }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 block w-full">
                                                                Upload Bukti
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">Belum ada pengajuan penelitian.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-end">
                        {penelitian.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'} className={`px-3 py-1 border mx-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveState />
                        ))}
                    </div>

                </div>
            </div>

            {/* --- MODAL BUAT SURAT --- */}
            {modalSurat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Buat Surat Penelitian</h3><button onClick={() => setModalSurat(false)}>&times;</button></div>
                        <form onSubmit={submitSurat} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Judul Penelitian</label>
                                <input type="text" className="w-full border-gray-300 rounded text-sm" value={formSurat.data.judul_penelitian} onChange={e => formSurat.setData('judul_penelitian', e.target.value)} required />
                                {formSurat.errors.judul_penelitian && <span className="text-red-500 text-xs">{formSurat.errors.judul_penelitian}</span>}
                            </div>
                            {['file_form_a', 'file_form_b', 'file_form_c'].map((formName, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm font-medium">Upload {formName.replace(/_/g, ' ').toUpperCase()} (PDF/Word)</label>
                                    <input type="file" className="w-full text-sm border-gray-300" onChange={e => formSurat.setData(formName, e.target.files[0])} required />
                                    {formSurat.errors[formName] && <span className="text-red-500 text-xs">{formSurat.errors[formName]}</span>}
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setModalSurat(false)} className="bg-gray-300 px-4 py-2 rounded text-sm mr-2">Batal</button>
                                <button type="submit" disabled={formSurat.processing} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Ajukan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL SEWA ALAT --- */}
            {modalSewa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Pilih Alat (Min 2 Alat)</h3><button onClick={() => setModalSewa(false)}>&times;</button></div>
                        <form onSubmit={submitSewa} className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium">Tanggal Mulai</label><input type="date" className="w-full border-gray-300 rounded text-sm" value={formSewa.data.tanggal_mulai} onChange={e => formSewa.setData('tanggal_mulai', e.target.value)} required /></div>
                                <div><label className="text-sm font-medium">Tanggal Selesai</label><input type="date" className="w-full border-gray-300 rounded text-sm" value={formSewa.data.tanggal_selesai} onChange={e => formSewa.setData('tanggal_selesai', e.target.value)} required /></div>
                            </div>
                            {formSewa.errors.alat_ids && <span className="text-red-500 text-xs block">{formSewa.errors.alat_ids}</span>}
                            
                            <div className="border border-gray-200 rounded p-4 max-h-60 overflow-y-auto">
                                {alat.map(item => (
                                    <div key={item.id} className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <input type="checkbox" className="mr-2" onChange={e => handleCheckAlat(item.id, e.target.checked)} />
                                            <span className="text-sm">{item.nama_alat} (Stok: {item.stok_tersedia})</span>
                                        </div>
                                        {formSewa.data.alat_ids.includes(item.id) && (
                                            <input type="number" min="1" max={item.stok_tersedia} className="w-20 border-gray-300 rounded text-sm" value={formSewa.data.jumlah[item.id] || 1} onChange={e => formSewa.setData('jumlah', {...formSewa.data.jumlah, [item.id]: e.target.value})} placeholder="Qty" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setModalSewa(false)} className="bg-gray-300 px-4 py-2 rounded text-sm mr-2">Batal</button>
                                <button type="submit" disabled={formSewa.processing} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Ajukan Sewa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL UPLOAD BUKTI --- */}
            {modalUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
                        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Upload Pembayaran</h3><button onClick={() => setModalUpload(false)}>&times;</button></div>
                        <form onSubmit={submitUpload} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Foto Struk / Bukti Transfer</label>
                                <input type="file" accept="image/*" className="w-full mt-2 text-sm" onChange={e => formUpload.setData('bukti_pembayaran', e.target.files[0])} required />
                                {formUpload.errors.bukti_pembayaran && <span className="text-red-500 text-xs">{formUpload.errors.bukti_pembayaran}</span>}
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setModalUpload(false)} className="bg-gray-300 px-4 py-2 rounded text-sm mr-2">Batal</button>
                                <button type="submit" disabled={formUpload.processing} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Upload Bukti</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}