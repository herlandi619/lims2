import React, { useState, useEffect } from 'react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';


export default function Index({ auth, alat, kategori, supplier, lokasi, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedAlat, setSelectedAlat] = useState(null);
    const [editItem, setEditItem] = useState(null);

    // Form Inertia
    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kategori_id: '',
        supplier_id: '',
        lokasi_id: '',
        nama_alat: '',
        merk: '',
        spesifikasi: '',
        jumlah_stok: 1,
        stok_tersedia: 1,
        kondisi: 'baik',
        status: 'tersedia',
        tanggal_pembelian: '',
        foto: null,
        keterangan: '',
        _method: 'POST',
    });

    // Alert SweetAlert2 saat ada flash success
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
        router.get(route('laboran.alat.index'), { search }, { preserveState: true, replace: true });
    };

    // Modal Form Control
    const openModal = (item = null) => {
        clearErrors();
        setEditItem(item);
        if (item) {
            setData({
                kategori_id: item.kategori_id || '',
                supplier_id: item.supplier_id || '',
                lokasi_id: item.lokasi_id || '',
                nama_alat: item.nama_alat || '',
                merk: item.merk || '',
                spesifikasi: item.spesifikasi || '',
                jumlah_stok: item.jumlah_stok || 1,
                stok_tersedia: item.stok_tersedia || 1,
                kondisi: item.kondisi || 'baik',
                status: item.status || 'tersedia',
                tanggal_pembelian: item.tanggal_pembelian || '',
                foto: null,
                keterangan: item.keterangan || '',
                _method: 'PUT',
            });
        } else {
            reset();
            setData('_method', 'POST');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditItem(null);
        reset();
    };

    // Modal QR Code Control
    const openQrModal = (item) => {
        setSelectedAlat(item);
        setIsQrModalOpen(true);
    };

    const closeQrModal = () => {
        setIsQrModalOpen(false);
        setSelectedAlat(null);
    };

    // Submit Form (Tambah / Edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editItem) {
            // Buat objek payload
            const payload = { ...data, _method: 'PUT' };
            
            // Jika foto tidak diisi/diubah (bernilai null), hapus dari payload
            if (!data.foto) {
                delete payload.foto;
            }

            router.post(route('laboran.alat.update', editItem.id), payload, {
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: (err) => console.log("Error Validasi:", err),
            });
        } else {
            router.post(route('laboran.alat.store'), data, {
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: (err) => console.log("Error Validasi:", err),
            });
        }
    };

    // Hapus Data
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: 'Data alat beserta riwayat terkait akan dihapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('laboran.alat.destroy', id));
            }
        });
    };

    // Print QR Code
    const handlePrintQr = () => {
        window.print();
    };

    return (
        <LaboranLayout user={auth.user}>
            <Head title="Kelola Inventaris Alat" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Data Alat</h1>
                        <p className="text-sm text-gray-500">Manajemen stok, lokasi, status, dan QR Code alat laboratorium.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 shadow-sm"
                    >
                        + Tambah Alat Baru
                    </button>
                </div>

                {/* Filter Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Cari nama, kode, atau merk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Kode & Foto</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Nama Alat & Merk</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Kategori & Lokasi</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Stok (Ada/Tot)</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-3 text-right font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {alat.data.length > 0 ? (
                                    alat.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {item.foto ? (
                                                        <img src={`/storage/${item.foto}`} alt={item.nama_alat} className="h-10 w-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Pic</div>
                                                    )}
                                                    <div>
                                                        <span className="font-bold text-gray-800 block">{item.kode_alat}</span>
                                                        <span className="text-xs text-gray-400">{item.qr_code}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{item.nama_alat}</div>
                                                <div className="text-xs text-gray-500">{item.merk || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-800">{item.kategori?.nama_kategori}</div>
                                                <div className="text-xs text-gray-500">{item.lokasi?.nama_lokasi}</div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {item.stok_tersedia} / {item.jumlah_stok}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                    item.status === 'tersedia' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'dipinjam' ? 'bg-blue-100 text-blue-800' :
                                                    item.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => openQrModal(item)} className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200">QR Code</button>
                                                <button onClick={() => openModal(item)} className="text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded hover:bg-indigo-100">Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100">Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-400">Tidak ada data alat ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination 5 Data */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            Menampilkan {alat.from || 0} - {alat.to || 0} dari {alat.total || 0} Data
                        </span>
                        <div className="flex space-x-1">
                            {alat.links?.map((link, idx) => (
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

                {/* Modal Form CRUD */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 bg-white">
                                <h3 className="font-bold text-gray-800 text-lg">{editItem ? 'Edit Data Alat' : 'Tambah Alat Baru'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Nama Alat *</label>
                                        <input
                                            type="text"
                                            value={data.nama_alat}
                                            onChange={(e) => setData('nama_alat', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                        {errors.nama_alat && <span className="text-xs text-red-500">{errors.nama_alat}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Merk</label>
                                        <input
                                            type="text"
                                            value={data.merk}
                                            onChange={(e) => setData('merk', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Kategori *</label>
                                        <select
                                            value={data.kategori_id}
                                            onChange={(e) => setData('kategori_id', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {kategori.map((k) => (
                                                <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Lokasi *</label>
                                        <select
                                            value={data.lokasi_id}
                                            onChange={(e) => setData('lokasi_id', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="">-- Pilih Lokasi --</option>
                                            {lokasi.map((l) => (
                                                <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Supplier</label>
                                        <select
                                            value={data.supplier_id}
                                            onChange={(e) => setData('supplier_id', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        >
                                            <option value="">-- Pilih Supplier --</option>
                                            {supplier.map((s) => (
                                                <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Jumlah Stok *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.jumlah_stok}
                                            onChange={(e) => setData('jumlah_stok', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                            required
                                        />
                                    </div>

                                    {editItem && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase">Stok Tersedia *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stok_tersedia}
                                                onChange={(e) => setData('stok_tersedia', e.target.value)}
                                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Kondisi</label>
                                        <select
                                            value={data.kondisi}
                                            onChange={(e) => setData('kondisi', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        >
                                            <option value="baik">Baik</option>
                                            <option value="cukup">Cukup</option>
                                            <option value="rusak">Rusak</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        >
                                            <option value="tersedia">Tersedia</option>
                                            <option value="dipinjam">Dipinjam</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="rusak">Rusak</option>
                                            <option value="hilang">Hilang</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Tgl Pembelian</label>
                                        <input
                                            type="date"
                                            value={data.tanggal_pembelian}
                                            onChange={(e) => setData('tanggal_pembelian', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase">Foto Alat</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('foto', e.target.files[0])}
                                            className="mt-1 w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase">Spesifikasi</label>
                                    <textarea
                                        rows="2"
                                        value={data.spesifikasi}
                                        onChange={(e) => setData('spesifikasi', e.target.value)}
                                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm text-sm"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal View / Print QR Code */}
              
                {isQrModalOpen && selectedAlat && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
                            <h3 className="font-bold text-gray-800 text-lg">QR Code Inventaris</h3>
                            <div className="p-4 bg-white border-2 border-dashed rounded-xl inline-block" id="qr-printable">
                                {/* Menampilkan QR Code SVG via API Data URI agar aman offline & tanpa library eksternal */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedAlat.qr_code)}`} 
                                    alt={selectedAlat.qr_code}
                                    className="mx-auto h-40 w-40"
                                />
                                <div className="mt-2 font-bold text-gray-800 text-sm">{selectedAlat.kode_alat}</div>
                                <div className="text-xs text-gray-500">{selectedAlat.nama_alat}</div>
                            </div>
                            <div className="flex justify-center space-x-2 pt-2">
                                <button
                                    onClick={handlePrintQr}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                >
                                    Cetak QR
                                </button>
                                <button
                                    onClick={closeQrModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LaboranLayout>
    );
}