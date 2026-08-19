import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DosenLayout from '@/Layouts/DosenLayout';
import Swal from 'sweetalert2';

export default function Index({ krsList, listKelas, listMahasiswa, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kelas_praktikum_id: '',
        mahasiswa_id: '',
    });

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dosen.krs.index'), { search }, { preserveState: true, replace: true });
    };

    // Buka Modal Tambah KRS
    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Submit Tambah KRS
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dosen.krs.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire('Berhasil!', 'Mahasiswa berhasil ditambahkan ke mata kuliah.', 'success');
            },
        });
    };

    // Hapus KRS dengan SweetAlert
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Mahasiswa akan dikeluarkan dari mata kuliah/KRS ini!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('dosen.krs.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'KRS mahasiswa berhasil dihapus.', 'success');
                    },
                });
            }
        });
    };

    return (
        <DosenLayout>
            <Head title="Manajemen KRS & Matkul Mahasiswa" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Manajemen KRS & Matkul Mahasiswa</h2>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        + Tambah Mahasiswa ke Matkul
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama mahasiswa, NIM, atau matkul..."
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah / Praktikum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester / Kelas</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {krsList.data.length > 0 ? (
                                krsList.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {(krsList.current_page - 1) * krsList.per_page + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {item.mahasiswa?.name} <span className="text-xs text-gray-500 block">NIM: {item.mahasiswa?.nim || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {item.kelas_praktikum?.nama_praktikum} <span className="text-xs text-gray-500 block">Kode: {item.kelas_praktikum?.kode_kelas}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            Sem {item.kelas_praktikum?.semester} | {item.kelas_praktikum?.nama_kelas}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Keluarkan
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Belum ada data KRS mahasiswa terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Links */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Menampilkan {krsList.from || 0} sampai {krsList.to || 0} dari {krsList.total} data
                        </div>
                        <div className="flex space-x-1">
                            {krsList.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    disabled={!link.url}
                                    className={`px-3 py-1 text-xs rounded border ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Box Tambah KRS */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center pb-3 border-b mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Masukkan Mahasiswa ke Matkul (KRS)</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Pilih Mata Kuliah / Kelas Praktikum</label>
                                <select
                                    value={data.kelas_praktikum_id}
                                    onChange={(e) => setData('kelas_praktikum_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">-- Pilih Mata Kuliah --</option>
                                    {listKelas.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_praktikum} (Sem {k.semester} - {k.nama_kelas})
                                        </option>
                                    ))}
                                </select>
                                {errors.kelas_praktikum_id && <span className="text-xs text-red-600 mt-1">{errors.kelas_praktikum_id}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700">Pilih Mahasiswa</label>
                                <select
                                    value={data.mahasiswa_id}
                                    onChange={(e) => setData('mahasiswa_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">-- Pilih Mahasiswa --</option>
                                    {listMahasiswa.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.nim ? `(${m.nim})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.mahasiswa_id && <span className="text-xs text-red-600 mt-1">{errors.mahasiswa_id}</span>}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}