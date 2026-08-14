import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function Index({ tickets, telegramConfig, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || '');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form Telegram Bot Configuration
    const telegramForm = useForm({
        bot_token: telegramConfig.bot_token || '',
        chat_id: telegramConfig.chat_id || '',
    });

    // Form Edit Tiket / Override Status
    const editForm = useForm({
        subjek: '',
        kategori: '',
        prioritas: '',
        status: '',
        catatan_penyelesaian: '',
    });

    // Flash Notification Alert
    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        }
        if (flash.error) {
            Swal.fire({
                title: 'Gagal!',
                text: flash.error,
                icon: 'error',
            });
        }
    }, [flash]);

    // Submit Telegram Config
    const handleTelegramSubmit = (e) => {
        e.preventDefault();
        telegramForm.post('/admin/tickets/telegram-config', {
            preserveScroll: true,
        });
    };

    // Filter & Search
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/admin/tickets', { search, kategori }, { preserveState: true, replace: true });
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setSelectedTicket(item);
        editForm.setData({
            subjek: item.subjek || '',
            kategori: item.kategori || 'sistem_error',
            prioritas: item.prioritas || 'sedang',
            status: item.status || 'open',
            catatan_penyelesaian: item.catatan_penyelesaian || '',
        });
        setIsEditModalOpen(true);
    };

    // Submit Edit Tiket
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        editForm.put(`/admin/tickets/${selectedTicket.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedTicket(null);
            },
        });
    };

    // Delete Ticket History with SweetAlert Confirmation
    const handleDelete = (item) => {
        Swal.fire({
            title: 'Hapus Histori Tiket?',
            text: `Tiket ${item.kode_tiket} akan dihapus permanen beserta seluruh balasannya!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/tickets/${item.id}`);
            }
        });
    };

    return (
        <AdminLayout title="Pengelolaan Sistem & Tiket">
            <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin - Pengelolaan Sistem & Tiket</h1>
                    <p className="text-sm text-gray-500">Konfigurasi notifikasi Telegram dan penanganan kendala sistem/akun.</p>
                </div>

                {/* SECTION 1: CONFIGURATION TELEGRAM BOT */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span>🤖</span> Integrasi Telegram Bot Notification
                    </h2>
                    <form onSubmit={handleTelegramSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <label className="block font-semibold mb-1 text-slate-700">Bot Token</label>
                            <input
                                type="text"
                                required
                                placeholder="123456789:ABCdefGHIjklMNOpqrs..."
                                value={telegramForm.data.bot_token}
                                onChange={(e) => telegramForm.setData('bot_token', e.target.value)}
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-slate-700">Group Chat ID</label>
                            <input
                                type="text"
                                required
                                placeholder="-100123456789"
                                value={telegramForm.data.chat_id}
                                onChange={(e) => telegramForm.setData('chat_id', e.target.value)}
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={telegramForm.processing}
                                className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded"
                            >
                                {telegramForm.processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECTION 2: FILTER & DATA TIKET */}
                <div className="space-y-4">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="Cari kode, subjek, pelapor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-1/3 px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="px-3 py-2 border rounded text-xs"
                        >
                            <option value="">-- Semua Kategori --</option>
                            <option value="sistem_error">Sistem Error / Bug</option>
                            <option value="alat">Kerusakan Alat</option>
                            <option value="ruangan">Fasilitas Ruangan</option>
                        </select>
                        <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-2 rounded hover:bg-indigo-700">
                            Cari
                        </button>
                    </form>

                    {/* Table Tiket */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-gray-500">
                            <thead className="text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3">Kode Tiket</th>
                                    <th className="px-4 py-3">Pelapor</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Subjek</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">Aksi (CRUD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.data.length > 0 ? (
                                    tickets.data.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-gray-900">{item.kode_tiket}</td>
                                            <td className="px-4 py-3">{item.pelapor?.name || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                                                    item.kategori === 'sistem_error' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{item.subjek}</td>
                                            <td className="px-4 py-3 uppercase text-[10px] font-bold">{item.status}</td>
                                            <td className="px-4 py-3 text-center space-x-1">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-[11px]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px]"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            Tidak ada data tiket.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">
                            Menampilkan {tickets.from || 0} - {tickets.to || 0} dari {tickets.total} data
                        </span>
                        <div className="flex gap-1">
                            {tickets.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded border ${
                                        link.active ? 'bg-slate-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EDIT DATA TIKET SYSTEM ERROR / OVERRIDE */}
            {isEditModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-sm font-bold">Edit / Override Tiket: {selectedTicket.kode_tiket}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500">✕</button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Subjek</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.subjek}
                                    onChange={(e) => editForm.setData('subjek', e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Kategori Tiket</label>
                                <select
                                    value={editForm.data.kategori}
                                    onChange={(e) => editForm.setData('kategori', e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="sistem_error">Sistem Error / Bug</option>
                                    <option value="alat">Kerusakan Alat</option>
                                    <option value="ruangan">Fasilitas Ruangan</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Prioritas</label>
                                    <select
                                        value={editForm.data.prioritas}
                                        onChange={(e) => editForm.setData('prioritas', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="rendah">Rendah</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="tinggi">Tinggi</option>
                                        <option value="darurat">Darurat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Status</label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Catatan Penyelesaian Admin</label>
                                <textarea
                                    rows="3"
                                    value={editForm.data.catatan_penyelesaian}
                                    onChange={(e) => editForm.setData('catatan_penyelesaian', e.target.value)}
                                    placeholder="Catatan penanganan bug / masalah akun..."
                                    className="w-full border rounded p-2"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-3 py-1.5 bg-gray-200 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}