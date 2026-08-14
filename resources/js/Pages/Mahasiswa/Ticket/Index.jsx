import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import Swal from 'sweetalert2';

export default function Index({ tickets, peminjamanList, alatList, ruanganList, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Form Tambah Tiket
    const createForm = useForm({
        kategori: 'kerusakan_alat',
        subjek: '',
        deskripsi: '',
        prioritas: 'sedang',
        peminjaman_id: '',
        alat_id: '',
        ruangan_id: '',
        lampiran_foto: null,
    });

    // Form Balas Tiket
    const replyForm = useForm({
        pesan: '',
        lampiran: null,
    });

    // Flash Message via SweetAlert2
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
    }, [flash]);

    // Handle Live Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/mahasiswa/tickets', { search }, { preserveState: true, replace: true });
    };

    // Submit Tiket Baru
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/mahasiswa/tickets', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Submit Balasan
    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        replyForm.post(`/mahasiswa/tickets/${selectedTicket.id}/reply`, {
            onSuccess: () => {
                replyForm.reset();
                // Update local state untuk langsung menampilkan balasan baru
                const updated = tickets.data.find((t) => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            },
        });
    };

    // Konfirmasi Tutup Tiket
    const handleCloseTicket = (id) => {
        Swal.fire({
            title: 'Tutup Tiket ini?',
            text: 'Tiket yang telah ditutup menandakan masalah sudah selesai.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Tutup!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(`/mahasiswa/tickets/${id}/close`, {}, {
                    onSuccess: () => {
                        setSelectedTicket(null);
                    }
                });
            }
        });
    };

    // Helper Badge Status
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Open</span>;
            case 'in_progress':
                return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">In Progress</span>;
            case 'resolved':
                return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Resolved</span>;
            case 'closed':
                return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">Closed</span>;
            default:
                return null;
        }
    };

    return (
        <MahasiswaLayout title="Ticketing & Customer Care">
            <div className="p-6 bg-white rounded-lg shadow-md">
                {/* Header & Button */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pusat Laporan Kendala (Ticketing)</h1>
                        <p className="text-sm text-gray-500">Laporkan masalah kerusakan alat, fasilitas ruangan, atau kendala layanan.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                        + Buat Tiket Laporan
                    </button>
                </div>

                {/* Filter Search */}
                <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari kode tiket, subjek..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm">
                        Cari
                    </button>
                </form>

                {/* Table Tiket */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Subjek</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3">Prioritas</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.data.length > 0 ? (
                                tickets.data.map((item) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.kode_tiket}</td>
                                        <td className="px-4 py-3">{item.subjek}</td>
                                        <td className="px-4 py-3 capitalize">{item.kategori.replace('_', ' ')}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded font-bold ${
                                                item.prioritas === 'darurat' ? 'bg-red-100 text-red-700' :
                                                item.prioritas === 'tinggi' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.prioritas}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{renderStatusBadge(item.status)}</td>
                                        <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedTicket(item)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Detail & Balas
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">
                                        Belum ada tiket laporan.
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
                                    link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL 1: BUAT TIKET BARU */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Buat Tiket Laporan Baru</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                                <select
                                    value={createForm.data.kategori}
                                    onChange={(e) => createForm.setData('kategori', e.target.value)}
                                    className="w-full border rounded text-xs p-2"
                                >
                                    <option value="kerusakan_alat">Kerusakan Alat</option>
                                    <option value="kendala_ruangan">Kendala Fasilitas Ruangan</option>
                                    <option value="sistem_error">Sistem / Aplikasi Error</option>
                                    <option value="layanan">Pelayanan Lab</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Prioritas</label>
                                <select
                                    value={createForm.data.prioritas}
                                    onChange={(e) => createForm.setData('prioritas', e.target.value)}
                                    className="w-full border rounded text-xs p-2"
                                >
                                    <option value="rendah">Rendah</option>
                                    <option value="sedang">Sedang</option>
                                    <option value="tinggi">Tinggi</option>
                                    <option value="darurat">Darurat</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Terkait Peminjaman (Opsional)</label>
                                <select
                                    value={createForm.data.peminjaman_id}
                                    onChange={(e) => createForm.setData('peminjaman_id', e.target.value)}
                                    className="w-full border rounded text-xs p-2"
                                >
                                    <option value="">-- Tidak Terkait --</option>
                                    {peminjamanList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.kode_peminjaman}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Terkait Alat (Opsional)</label>
                                <select
                                    value={createForm.data.alat_id}
                                    onChange={(e) => createForm.setData('alat_id', e.target.value)}
                                    className="w-full border rounded text-xs p-2"
                                >
                                    <option value="">-- Tidak Terkait --</option>
                                    {alatList.map((a) => (
                                        <option key={a.id} value={a.id}>{a.nama_alat} ({a.kode_alat})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subjek Laporan</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.subjek}
                                    onChange={(e) => createForm.setData('subjek', e.target.value)}
                                    placeholder="Contoh: Lensa Mikroskop CX23 Buram"
                                    className="w-full border rounded text-xs p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Detail</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={createForm.data.deskripsi}
                                    onChange={(e) => createForm.setData('deskripsi', e.target.value)}
                                    placeholder="Jelaskan detail kendala..."
                                    className="w-full border rounded text-xs p-2"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Lampiran Foto (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => createForm.setData('lampiran_foto', e.target.files[0])}
                                    className="w-full text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-3 py-1.5 text-xs bg-gray-200 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    {createForm.processing ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: DETAIL TIKET & DISKUSI BALASAN */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
                        {/* Header Modal Detail */}
                        <div className="flex justify-between items-center border-b pb-3 mb-3">
                            <div>
                                <h2 className="text-base font-bold">{selectedTicket.kode_tiket} - {selectedTicket.subjek}</h2>
                                <p className="text-xs text-gray-500">Status: {renderStatusBadge(selectedTicket.status)}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-black">✕</button>
                        </div>

                        {/* Detail Content */}
                        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                            <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                                <p><strong>Kategori:</strong> {selectedTicket.kategori}</p>
                                <p><strong>Deskripsi Awal:</strong> {selectedTicket.deskripsi}</p>
                                {selectedTicket.lampiran_foto && (
                                    <p>
                                        <strong>Foto Lampiran:</strong>{' '}
                                        <a
                                            href={`/storage/${selectedTicket.lampiran_foto}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Lihat Foto
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Thread Diskusi Balasan */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 border-b pb-1">Riwayat Diskusi / Balasan</h3>
                                {selectedTicket.balasan && selectedTicket.balasan.length > 0 ? (
                                    selectedTicket.balasan.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`p-3 rounded text-xs ${
                                                reply.user_id === selectedTicket.user_id
                                                    ? 'bg-indigo-50 border-l-4 border-indigo-500 ml-4'
                                                    : 'bg-emerald-50 border-l-4 border-emerald-500 mr-4'
                                            }`}
                                        >
                                            <div className="flex justify-between text-gray-500 text-[10px] mb-1">
                                                <span className="font-bold text-gray-800">{reply.user?.name || 'Petugas'}</span>
                                                <span>{new Date(reply.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                            <p className="text-gray-700">{reply.pesan}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Belum ada balasan dari petugas.</p>
                                )}
                            </div>
                        </div>

                        {/* Input Balasan Form (Hanya jika tiket belum closed) */}
                        {selectedTicket.status !== 'closed' ? (
                            <form onSubmit={handleReplySubmit} className="mt-4 border-t pt-3 space-y-2">
                                <textarea
                                    required
                                    rows="2"
                                    value={replyForm.data.pesan}
                                    onChange={(e) => replyForm.setData('pesan', e.target.value)}
                                    placeholder="Tulis balasan atau pertanyaan tambahan..."
                                    className="w-full border rounded text-xs p-2 focus:ring-2 focus:ring-indigo-500"
                                ></textarea>
                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={() => handleCloseTicket(selectedTicket.id)}
                                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                                    >
                                        Tutup Tiket (Selesai)
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={replyForm.processing}
                                        className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                        {replyForm.processing ? 'Mengirim...' : 'Kirim Balasan'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4 border-t pt-3 text-center text-xs text-gray-500">
                                Tiket ini telah ditutup. Tidak dapat menambah balasan baru.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}