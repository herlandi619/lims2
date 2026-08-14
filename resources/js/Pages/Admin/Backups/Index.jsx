import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ backups, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const restoreForm = useForm({
        backup_file: null,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.backups.index'), { search }, { preserveState: true });
    };

    // Ganti fungsi handleCreateBackup dengan kode berikut:
    const handleCreateBackup = () => {
        Swal.fire({
            title: 'Buat Backup & Download?',
            text: 'File cadangan SQLite akan dibuat dan otomatis terdownload ke komputer Anda.',
            icon: 'info',
            showCancelButton: true,
            confirmColor: '#4f46e5',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Download Sekarang!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                // Gunakan window.location.href atau window.open agar browser mengenali proses download file
                window.location.href = route('admin.backups.create');
            }
        });
    };

   


    const handleRestoreExisting = (fileName) => {
        Swal.fire({
            title: 'Restore Database?',
            text: `PERINGATAN! Seluruh data aktif akan ditimpa oleh file backup "${fileName}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#dc2626',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Restore Sekarang!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.backups.restore'), { file_name: fileName }, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Database SQLite berhasil di-restore.', 'success');
                    },
                });
            }
        });
    };

    const handleRestoreUpload = (e) => {
        e.preventDefault();
        if (!restoreForm.data.backup_file) return;

        Swal.fire({
            title: 'Restore File Unggahan?',
            text: 'Database aktif akan langsung ditimpa oleh file yang Anda unggah.',
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#dc2626',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Timpa Database!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                restoreForm.post(route('admin.backups.restore'), {
                    onSuccess: () => {
                        setIsUploadModalOpen(false);
                        restoreForm.reset();
                        Swal.fire('Berhasil!', 'Database SQLite berhasil di-restore.', 'success');
                    },
                });
            }
        });
    };

    const handleDelete = (fileName) => {
        Swal.fire({
            title: 'Hapus File Backup?',
            text: `File "${fileName}" akan dihapus dari server.`,
            icon: 'warning',
            showCancelButton: true,
            confirmColor: '#ef4444',
            cancelColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.backups.destroy', fileName), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'File backup telah dihapus.', 'success');
                    },
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Pemeliharaan Database (SQLite)" />

            <div className="py-6 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pemeliharaan Database (SQLite)</h1>
                        <p className="text-sm text-gray-600">Buat cadangan file database SQLite atau kembalikan data dari backup.</p>
                    </div>
                    <div className="flex gap-2 self-start md:self-auto">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-300 shadow-sm flex items-center gap-1"
                        >
                            <span>📤 Upload File Database</span>
                        </button>
                        <button
                            onClick={handleCreateBackup}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-1"
                        >
                            <span>+ Buat Backup Baru</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search */}
                {/* <div className="bg-white p-4 rounded-t-xl border border-gray-200">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Cari nama file backup..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-900">
                            Cari
                        </button>
                    </form>
                </div> */}

                {/* Table Section */}
                <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-x-auto">
                    {/* <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Nama File Backup</th>
                                <th className="px-6 py-3">Ukuran File</th>
                                <th className="px-6 py-3">Waktu Pembuatan</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {backups.data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        Tidak ada file backup ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                backups.data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                                            {item.file_name}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                                            {item.size}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {item.created_at}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <a
                                                href={route('admin.backups.download', item.file_name)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-2.5 py-1 rounded-md"
                                            >
                                                Download
                                            </a>
                                            <button
                                                onClick={() => handleRestoreExisting(item.file_name)}
                                                className="text-amber-600 hover:text-amber-900 font-medium text-xs bg-amber-50 px-2.5 py-1 rounded-md"
                                            >
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.file_name)}
                                                className="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 px-2.5 py-1 rounded-md"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table> */}

                    {/* Pagination (5 Data Per Halaman) */}
                    {/* <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
                        <span>Menampilkan {backups.from || 0} - {backups.to || 0} dari {backups.total} file</span>
                        <div className="flex space-x-1">
                            {backups.links.map((link, idx) => (
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
                    </div> */}
                </div>
            </div>

            {/* Modal Box Upload External File Database */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-sm uppercase">Upload File Backup Database</h3>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRestoreUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Pilih File (.sqlite, .db)
                                </label>
                                <input
                                    type="file"
                                    accept=".sqlite,.db,.sql"
                                    onChange={(e) => restoreForm.setData('backup_file', e.target.files[0])}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    required
                                />
                                {restoreForm.errors.backup_file && (
                                    <p className="text-red-500 text-xs mt-1">{restoreForm.errors.backup_file}</p>
                                )}
                            </div>

                            <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                ⚠️ Perhatian: Mengunggah file ini akan langsung menimpa database SQLite aktif di server saat ini.
                            </p>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={restoreForm.processing}
                                    className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow"
                                >
                                    Restore Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}