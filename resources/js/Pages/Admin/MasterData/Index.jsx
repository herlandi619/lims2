import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ kategori, supplier, lokasi, ruangan, filters }) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'kategori');
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form Hooks Inertia
    const formKategori = useForm({ nama_kategori: '', deskripsi: '' });
    const formSupplier = useForm({ nama_supplier: '', alamat: '', telepon: '', email: '' });
    const formLokasi   = useForm({ nama_lokasi: '', deskripsi: '' });
    const formRuangan  = useForm({ kode_ruangan: '', nama_ruangan: '', kapasitas: '', lokasi: '', status: 'aktif' });

    // Switch Tab
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSearch('');
        router.get(route('admin.master-data.index'), { tab: tabName, search: '' }, { preserveState: true });
    };

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.master-data.index'), { tab: activeTab, search }, { preserveState: true });
    };

    // Open Modal Create/Edit
    const openModal = (item = null) => {
        setEditItem(item);
        if (activeTab === 'kategori') {
            formKategori.setData({
                nama_kategori: item ? item.nama_kategori : '',
                deskripsi: item ? item.deskripsi || '' : '',
            });
            formKategori.clearErrors();
        } else if (activeTab === 'supplier') {
            formSupplier.setData({
                nama_supplier: item ? item.nama_supplier : '',
                alamat: item ? item.alamat || '' : '',
                telepon: item ? item.telepon || '' : '',
                email: item ? item.email || '' : '',
            });
            formSupplier.clearErrors();
        } else if (activeTab === 'lokasi') {
            formLokasi.setData({
                nama_lokasi: item ? item.nama_lokasi : '',
                deskripsi: item ? item.deskripsi || '' : '',
            });
            formLokasi.clearErrors();
        } else if (activeTab === 'ruangan') {
            formRuangan.setData({
                kode_ruangan: item ? item.kode_ruangan : '',
                nama_ruangan: item ? item.nama_ruangan : '',
                kapasitas: item ? item.kapasitas || '' : '',
                lokasi: item ? item.lokasi || '' : '',
                status: item ? item.status : 'aktif',
            });
            formRuangan.clearErrors();
        }
        setIsModalOpen(true);
    };

    // Submit Modal Form
    const handleSubmit = (e) => {
        e.preventDefault();

        const successCallback = () => {
            setIsModalOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: editItem ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
                timer: 2000,
                showConfirmButton: false,
            });
        };

        if (activeTab === 'kategori') {
            if (editItem) {
                formKategori.put(route('admin.master-data.kategori.update', editItem.id), { onSuccess: successCallback });
            } else {
                formKategori.post(route('admin.master-data.kategori.store'), { onSuccess: successCallback });
            }
        } else if (activeTab === 'supplier') {
            if (editItem) {
                formSupplier.put(route('admin.master-data.supplier.update', editItem.id), { onSuccess: successCallback });
            } else {
                formSupplier.post(route('admin.master-data.supplier.store'), { onSuccess: successCallback });
            }
        } else if (activeTab === 'lokasi') {
            if (editItem) {
                formLokasi.put(route('admin.master-data.lokasi.update', editItem.id), { onSuccess: successCallback });
            } else {
                formLokasi.post(route('admin.master-data.lokasi.store'), { onSuccess: successCallback });
            }
        } else if (activeTab === 'ruangan') {
            if (editItem) {
                formRuangan.put(route('admin.master-data.ruangan.update', editItem.id), { onSuccess: successCallback });
            } else {
                formRuangan.post(route('admin.master-data.ruangan.store'), { onSuccess: successCallback });
            }
        }
    };

    // Delete Item SweetAlert
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data "${name}" akan dihapus permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#ef4444',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                let deleteRoute = '';
                if (activeTab === 'kategori') deleteRoute = route('admin.master-data.kategori.destroy', id);
                if (activeTab === 'supplier') deleteRoute = route('admin.master-data.supplier.destroy', id);
                if (activeTab === 'lokasi') deleteRoute = route('admin.master-data.lokasi.destroy', id);
                if (activeTab === 'ruangan') deleteRoute = route('admin.master-data.ruangan.destroy', id);

                router.delete(deleteRoute, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                    },
                });
            }
        });
    };

    // Helper Dynamic Pagination Data
    const getActiveData = () => {
        if (activeTab === 'kategori') return kategori;
        if (activeTab === 'supplier') return supplier;
        if (activeTab === 'lokasi') return lokasi;
        return ruangan;
    };

    const currentData = getActiveData();

    return (
        <AdminLayout>
            <Head title="Master Data" />

            <div className="py-6 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
                        <p className="text-sm text-gray-600">Kelola kategori alat, supplier, lokasi alat, dan ruangan laboratorium.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow flex items-center gap-2 self-start md:self-auto"
                    >
                        <span>+ Tambah Data</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        {[
                            { key: 'kategori', label: 'Kategori Alat' },
                            { key: 'supplier', label: 'Data Supplier' },
                            { key: 'lokasi', label: 'Lokasi Alat' },
                            { key: 'ruangan', label: 'Data Ruangan' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Search Header */}
                <div className="bg-white p-4 rounded-t-xl border border-gray-200 flex justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                        <input
                            type="text"
                            placeholder={`Cari di ${activeTab}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-900">
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                            {activeTab === 'kategori' && (
                                <tr>
                                    <th className="px-6 py-3">Nama Kategori</th>
                                    <th className="px-6 py-3">Deskripsi</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            )}
                            {activeTab === 'supplier' && (
                                <tr>
                                    <th className="px-6 py-3">Nama Supplier</th>
                                    <th className="px-6 py-3">Kontak</th>
                                    <th className="px-6 py-3">Alamat</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            )}
                            {activeTab === 'lokasi' && (
                                <tr>
                                    <th className="px-6 py-3">Nama Lokasi</th>
                                    <th className="px-6 py-3">Deskripsi</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            )}
                            {activeTab === 'ruangan' && (
                                <tr>
                                    <th className="px-6 py-3">Kode & Nama Ruangan</th>
                                    <th className="px-6 py-3">Kapasitas</th>
                                    <th className="px-6 py-3">Lokasi</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentData.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-500">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                currentData.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        {activeTab === 'kategori' && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.nama_kategori}</td>
                                                <td className="px-6 py-4">{item.deskripsi || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'supplier' && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.nama_supplier}</td>
                                                <td className="px-6 py-4">
                                                    <div>{item.telepon || '-'}</div>
                                                    <div className="text-xs text-gray-500">{item.email}</div>
                                                </td>
                                                <td className="px-6 py-4">{item.alamat || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'lokasi' && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.nama_lokasi}</td>
                                                <td className="px-6 py-4">{item.deskripsi || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'ruangan' && (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{item.nama_ruangan}</div>
                                                    <div className="text-xs text-gray-500">{item.kode_ruangan}</div>
                                                </td>
                                                <td className="px-6 py-4">{item.kapasitas ? `${item.kapasitas} Orang` : '-'}</td>
                                                <td className="px-6 py-4">{item.lokasi || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.nama_kategori || item.nama_supplier || item.nama_lokasi || item.nama_ruangan)}
                                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination (5 Data Per Halaman) */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
                        <span>Menampilkan {currentData.from || 0} - {currentData.to || 0} dari {currentData.total} data</span>
                        <div className="flex space-x-1">
                            {currentData.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded ${
                                        link.active ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Box Form (Create/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 uppercase text-sm">
                                {editItem ? `Edit ${activeTab}` : `Tambah ${activeTab}`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Form Dynamic berdasarkan Active Tab */}
                            {activeTab === 'kategori' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Kategori</label>
                                        <input
                                            type="text"
                                            value={formKategori.data.nama_kategori}
                                            onChange={(e) => formKategori.setData('nama_kategori', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            required
                                        />
                                        {formKategori.errors.nama_kategori && <p className="text-red-500 text-xs mt-1">{formKategori.errors.nama_kategori}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi</label>
                                        <textarea
                                            value={formKategori.data.deskripsi}
                                            onChange={(e) => formKategori.setData('deskripsi', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            rows="3"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'supplier' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Supplier</label>
                                        <input
                                            type="text"
                                            value={formSupplier.data.nama_supplier}
                                            onChange={(e) => formSupplier.setData('nama_supplier', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            required
                                        />
                                        {formSupplier.errors.nama_supplier && <p className="text-red-500 text-xs mt-1">{formSupplier.errors.nama_supplier}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Telepon</label>
                                            <input
                                                type="text"
                                                value={formSupplier.data.telepon}
                                                onChange={(e) => formSupplier.setData('telepon', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formSupplier.data.email}
                                                onChange={(e) => formSupplier.setData('email', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            />
                                            {formSupplier.errors.email && <p className="text-red-500 text-xs mt-1">{formSupplier.errors.email}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat</label>
                                        <textarea
                                            value={formSupplier.data.alamat}
                                            onChange={(e) => formSupplier.setData('alamat', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            rows="2"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'lokasi' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lokasi</label>
                                        <input
                                            type="text"
                                            value={formLokasi.data.nama_lokasi}
                                            onChange={(e) => formLokasi.setData('nama_lokasi', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            required
                                        />
                                        {formLokasi.errors.nama_lokasi && <p className="text-red-500 text-xs mt-1">{formLokasi.errors.nama_lokasi}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi</label>
                                        <textarea
                                            value={formLokasi.data.deskripsi}
                                            onChange={(e) => formLokasi.setData('deskripsi', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            rows="3"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'ruangan' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Ruangan</label>
                                            <input
                                                type="text"
                                                value={formRuangan.data.kode_ruangan}
                                                onChange={(e) => formRuangan.setData('kode_ruangan', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                                required
                                            />
                                            {formRuangan.errors.kode_ruangan && <p className="text-red-500 text-xs mt-1">{formRuangan.errors.kode_ruangan}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Kapasitas (Orang)</label>
                                            <input
                                                type="number"
                                                value={formRuangan.data.kapasitas}
                                                onChange={(e) => formRuangan.setData('kapasitas', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Ruangan</label>
                                        <input
                                            type="text"
                                            value={formRuangan.data.nama_ruangan}
                                            onChange={(e) => formRuangan.setData('nama_ruangan', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                            required
                                        />
                                        {formRuangan.errors.nama_ruangan && <p className="text-red-500 text-xs mt-1">{formRuangan.errors.nama_ruangan}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Lokasi Ruangan</label>
                                        <input
                                            type="text"
                                            value={formRuangan.data.lokasi}
                                            onChange={(e) => formRuangan.setData('lokasi', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                        <select
                                            value={formRuangan.data.status}
                                            onChange={(e) => formRuangan.setData('status', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow"
                                >
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}