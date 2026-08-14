import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import LaboranLayout from '@/Layouts/LaboranLayout';
import Swal from 'sweetalert2';

export default function Index({ tickets, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

    // Form Update Status Tiket
    const statusForm = useForm({
        status: 'in_progress',
        catatan_penyelesaian: '',
    });

    // Form Balas Tiket
    const replyForm = useForm({
        pesan: '',
        lampiran: null,
    });

    // Form Buat Maintenance Alat
    const maintenanceForm = useForm({
        jenis: 'korektif',
        tanggal_maintenance: new Date().toISOString().split('T')[0],
        teknisi: '',
        biaya: 0,
        keterangan: '',
    });

    // Handle Flash Notification via SweetAlert2
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

    // Live Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/laboran/tickets', { search }, { preserveState: true, replace: true });
    };

    // Open Detail Modal
    const handleOpenDetail = (item) => {
        setSelectedTicket(item);
        statusForm.setData({
            status: item.status,
            catatan_penyelesaian: item.catatan_penyelesaian || '',
        });
    };

    // Submit Update Status
    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        statusForm.put(`/laboran/tickets/${selectedTicket.id}/status`, {
            onSuccess: () => {
                const updated = tickets.data.find((t) => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            },
        });
    };

    // Submit Balasan
    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        replyForm.post(`/laboran/tickets/${selectedTicket.id}/reply`, {
            forceFormData: true,
            onSuccess: () => {
                replyForm.reset();
            },
        });
    };

    // Submit Maintenance Alat
    const handleMaintenanceSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        maintenanceForm.post(`/laboran/tickets/${selectedTicket.id}/maintenance`, {
            onSuccess: () => {
                setIsMaintenanceOpen(false);
                maintenanceForm.reset();
            },
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
        <LaboranLayout title="Pengelolaan Tiket Kendala">
            <div className="p-6 bg-white rounded-lg shadow-md">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Daftar Tiket Kendala & Laporan</h1>
                    <p className="text-sm text-gray-500">Proses penanganan laporan kendala dari Mahasiswa & Dosen.</p>
                </div>

                {/* Filter Search */}
                <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari kode, subjek, nama pelapor..."
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
                                <th className="px-4 py-3">Pelapor</th>
                                <th className="px-4 py-3">Subjek</th>
                                <th className="px-4 py-3">Prioritas</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Petugas</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.data.length > 0 ? (
                                tickets.data.map((item) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.kode_tiket}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{item.pelapor?.name}</div>
                                            <div className="text-[10px] text-gray-400 capitalize">{item.pelapor?.role}</div>
                                        </td>
                                        <td className="px-4 py-3">{item.subjek}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded font-bold ${
                                                item.prioritas === 'darurat' ? 'bg-red-100 text-red-700' :
                                                item.prioritas === 'tinggi' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.prioritas}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{renderStatusBadge(item.status)}</td>
                                        <td className="px-4 py-3 text-xs">{item.petugas?.name || <span className="text-gray-400 italic">Belum diassign</span>}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleOpenDetail(item)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Tindak Lanjuti
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">
                                        Tidak ada data tiket kendala.
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

            {/* MODAL 1: DETAIL, UPDATE STATUS, & REPLIES */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b pb-3 mb-3">
                            <div>
                                <h2 className="text-base font-bold">{selectedTicket.kode_tiket} - {selectedTicket.subjek}</h2>
                                <p className="text-xs text-gray-500">Pelapor: {selectedTicket.pelapor?.name}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-black">✕</button>
                        </div>

                        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                            {/* Panel Detail */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded text-xs">
                                <div>
                                    <p><strong>Kategori:</strong> {selectedTicket.kategori}</p>
                                    <p><strong>Prioritas:</strong> {selectedTicket.prioritas}</p>
                                    <p><strong>Terkait Alat:</strong> {selectedTicket.alat ? selectedTicket.alat.nama_alat : '-'}</p>
                                    <p><strong>Terkait Ruangan:</strong> {selectedTicket.ruangan ? selectedTicket.ruangan.nama_ruangan : '-'}</p>
                                </div>
                                <div>
                                    <p><strong>Deskripsi:</strong> {selectedTicket.deskripsi}</p>
                                    {selectedTicket.lampiran_foto && (
                                        <p className="mt-1">
                                            <strong>Lampiran:</strong>{' '}
                                            <a href={`/storage/${selectedTicket.lampiran_foto}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                                Buka Foto
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Tombol Maintenance jika ada Alat */}
                            {selectedTicket.alat_id && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded flex justify-between items-center text-xs">
                                    <span>Laporan ini terkait dengan alat inventaris <strong>{selectedTicket.alat?.nama_alat}</strong>.</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsMaintenanceOpen(true)}
                                        className="bg-amber-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-amber-700"
                                    >
                                        + Jadwalkan Maintenance Alat
                                    </button>
                                </div>
                            )}

                            {/* Form Ubah Status Tiket */}
                            <form onSubmit={handleStatusSubmit} className="border p-3 rounded bg-white space-y-2">
                                <h3 className="text-xs font-bold text-gray-800">Update Status & Catatan Petugas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status Tiket</label>
                                        <select
                                            value={statusForm.data.status}
                                            onChange={(e) => statusForm.setData('status', e.target.value)}
                                            className="w-full border rounded text-xs p-1.5"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress (Diproses)</option>
                                            <option value="resolved">Resolved (Selesai)</option>
                                            <option value="closed">Closed (Ditutup)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Catatan Penyelesaian</label>
                                        <input
                                            type="text"
                                            value={statusForm.data.catatan_penyelesaian}
                                            onChange={(e) => statusForm.setData('catatan_penyelesaian', e.target.value)}
                                            placeholder="Contoh: Alat telah diganti sparepart baru."
                                            className="w-full border rounded text-xs p-1.5"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button
                                        type="submit"
                                        disabled={statusForm.processing}
                                        className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                                    >
                                        Simpan Perubahan Status
                                    </button>
                                </div>
                            </form>

                            {/* Thread Diskusi Balasan */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 border-b pb-1">Diskusi / Balasan Laporan</h3>
                                {selectedTicket.balasan && selectedTicket.balasan.length > 0 ? (
                                    selectedTicket.balasan.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`p-3 rounded text-xs ${
                                                reply.user_id === selectedTicket.user_id
                                                    ? 'bg-gray-100 border-l-4 border-gray-400 mr-4'
                                                    : 'bg-indigo-50 border-l-4 border-indigo-500 ml-4'
                                            }`}
                                        >
                                            <div className="flex justify-between text-gray-500 text-[10px] mb-1">
                                                <span className="font-bold text-gray-800">{reply.user?.name} ({reply.user?.role})</span>
                                                <span>{new Date(reply.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                            <p className="text-gray-700">{reply.pesan}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Belum ada percakapan.</p>
                                )}
                            </div>
                        </div>

                        {/* Input Balasan Form */}
                        <form onSubmit={handleReplySubmit} className="mt-4 border-t pt-3 space-y-2">
                            <textarea
                                required
                                rows="2"
                                value={replyForm.data.pesan}
                                onChange={(e) => replyForm.setData('pesan', e.target.value)}
                                placeholder="Tulis balasan untuk pelapor..."
                                className="w-full border rounded text-xs p-2 focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={replyForm.processing}
                                    className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Kirim Balasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: QUICK CREATE MAINTENANCE ALAT */}
            {isMaintenanceOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-sm font-bold">Buat Maintenance Alat</h3>
                            <button onClick={() => setIsMaintenanceOpen(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>
                        <form onSubmit={handleMaintenanceSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Alat Terkait</label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedTicket.alat?.nama_alat || ''}
                                    className="w-full border rounded p-2 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Jenis Maintenance</label>
                                <select
                                    value={maintenanceForm.data.jenis}
                                    onChange={(e) => maintenanceForm.setData('jenis', e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="korektif">Korektif (Perbaikan Rusak)</option>
                                    <option value="darurat">Darurat</option>
                                    <option value="preventif">Preventif (Pencegahan)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Tanggal Tindakan</label>
                                <input
                                    type="date"
                                    required
                                    value={maintenanceForm.data.tanggal_maintenance}
                                    onChange={(e) => maintenanceForm.setData('tanggal_maintenance', e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Teknisi / Vendor</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Tim Teknisi Internal / PT. Vendor"
                                    value={maintenanceForm.data.teknisi}
                                    onChange={(e) => maintenanceForm.setData('teknisi', e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Estimasi Biaya (Rp)</label>
                                <input
                                    type="number"
                                    value={maintenanceForm.data.biaya}
                                    onChange={(e) => maintenanceForm.setData('biaya', e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Keterangan Tambahan</label>
                                <textarea
                                    rows="2"
                                    value={maintenanceForm.data.keterangan}
                                    onChange={(e) => maintenanceForm.setData('keterangan', e.target.value)}
                                    placeholder="Catatan pengerjaan..."
                                    className="w-full border rounded p-2"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMaintenanceOpen(false)}
                                    className="px-3 py-1.5 bg-gray-200 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={maintenanceForm.processing}
                                    className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700"
                                >
                                    {maintenanceForm.processing ? 'Menyimpan...' : 'Simpan Maintenance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LaboranLayout>
    );
}