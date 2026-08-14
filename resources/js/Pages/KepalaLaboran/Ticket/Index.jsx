import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import KepalaLayout from '@/Layouts/KepalaLayout';
import Swal from 'sweetalert2';

export default function Index({ stats, tickets, laboranList, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [prioritas, setPrioritas] = useState(filters.prioritas || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

    // Form Escalation Approval & Re-assign
    const escalateForm = useForm({
        assigned_to: '',
        catatan_eskalasi: '',
    });

    // Flash Alert via SweetAlert2
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

    // Handle Filter & Search
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/kepala/tickets', { search, prioritas, status }, { preserveState: true, replace: true });
    };

    // Open Escalation Modal
    const handleOpenEscalate = (item) => {
        setSelectedTicket(item);
        escalateForm.setData({
            assigned_to: item.assigned_to || '',
            catatan_eskalasi: '',
        });
        setIsEscalateModalOpen(true);
    };

    // Submit Escalation
    const handleEscalateSubmit = (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        escalateForm.post(`/kepala/tickets/${selectedTicket.id}/escalate`, {
            onSuccess: () => {
                setIsEscalateModalOpen(false);
                setSelectedTicket(null);
                escalateForm.reset();
            },
        });
    };

    // Export Laporan CSV
    const handleExport = () => {
        window.location.href = '/kepala/tickets/export';
    };

    return (
        <KepalaLayout title="Dashboard Monitoring & Supervisi Tiket">
            <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
                {/* Header & Export Action */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Supervisi & Escalation Approval</h1>
                        <p className="text-sm text-gray-500">Monitoring seluruh tiket kendala alat/ruangan dan eskalasi penanganan.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 self-start md:self-auto"
                    >
                        📊 Ekspor Rekap CSV
                    </button>
                </div>

                {/* Dashboard Monitoring Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 border rounded-lg">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Total Tiket Masuk</span>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total_tiket}</div>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-xs font-semibold text-amber-600 uppercase">Menunggu (Open)</span>
                        <div className="text-2xl font-bold text-amber-700 mt-1">{stats.total_open}</div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-xs font-semibold text-blue-600 uppercase">Sedang Diproses</span>
                        <div className="text-2xl font-bold text-blue-700 mt-1">{stats.total_in_progress}</div>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-xs font-semibold text-red-600 uppercase">Butuh Atensi (Darurat)</span>
                        <div className="text-2xl font-bold text-red-700 mt-1">{stats.total_darurat}</div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t pt-4">
                    <input
                        type="text"
                        placeholder="Cari kode, subjek, pelapor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                        value={prioritas}
                        onChange={(e) => setPrioritas(e.target.value)}
                        className="px-3 py-2 border rounded text-xs"
                    >
                        <option value="">-- Semua Prioritas --</option>
                        <option value="rendah">Rendah</option>
                        <option value="sedang">Sedang</option>
                        <option value="tinggi">Tinggi</option>
                        <option value="darurat">Darurat</option>
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-3 py-2 border rounded text-xs"
                    >
                        <option value="">-- Semua Status --</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button type="submit" className="bg-gray-800 text-white text-xs px-4 py-2 rounded hover:bg-gray-900">
                        Filter Data
                    </button>
                </form>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-500">
                        <thead className="text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Kode Tiket</th>
                                <th className="px-4 py-3">Pelapor</th>
                                <th className="px-4 py-3">Aset Terkait</th>
                                <th className="px-4 py-3">Prioritas</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Petugas Penanggung Jawab</th>
                                <th className="px-4 py-3 text-center">Aksi Eskalasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.data.length > 0 ? (
                                tickets.data.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-gray-900">{item.kode_tiket}</td>
                                        <td className="px-4 py-3">{item.pelapor?.name || '-'}</td>
                                        <td className="px-4 py-3">
                                            {item.alat ? item.alat.nama_alat : item.ruangan ? item.ruangan.nama_ruangan : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                                                item.prioritas === 'darurat' ? 'bg-red-100 text-red-700' :
                                                item.prioritas === 'tinggi' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.prioritas}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 uppercase text-[10px] font-bold">{item.status}</td>
                                        <td className="px-4 py-3">{item.petugas?.name || <span className="text-red-500 italic">Belum Ada</span>}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleOpenEscalate(item)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-medium"
                                            >
                                                ⚡ Eskalasi / Re-assign
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">
                                        Tidak ada data tiket yang cocok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500">
                        Menampilkan {tickets.from || 0} - {tickets.to || 0} dari {tickets.total} tiket
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

            {/* MODAL ESCALATION APPROVAL / RE-ASSIGN */}
            {isEscalateModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-sm font-bold text-red-600">Form Eskalasi Tiket: {selectedTicket.kode_tiket}</h3>
                            <button onClick={() => setIsEscalateModalOpen(false)} className="text-gray-500">✕</button>
                        </div>

                        <form onSubmit={handleEscalateSubmit} className="space-y-3 text-xs">
                            <div className="p-2 bg-gray-50 border rounded text-[11px]">
                                <p><strong>Subjek:</strong> {selectedTicket.subjek}</p>
                                <p><strong>Deskripsi:</strong> {selectedTicket.deskripsi}</p>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Tugaskan Ulang Kepada (Laboran)</label>
                                <select
                                    required
                                    value={escalateForm.data.assigned_to}
                                    onChange={(e) => escalateForm.setData('assigned_to', e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">-- Pilih Laboran --</option>
                                    {laboranList.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Catatan Instruksi Eskalasi</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={escalateForm.data.catatan_eskalasi}
                                    onChange={(e) => escalateForm.setData('catatan_eskalasi', e.target.value)}
                                    placeholder="Instruksi penanganan khusus dari Kepala Laboran..."
                                    className="w-full border rounded p-2"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEscalateModalOpen(false)}
                                    className="px-3 py-1.5 bg-gray-200 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={escalateForm.processing}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {escalateForm.processing ? 'Memproses...' : 'Proses Eskalasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </KepalaLayout>
    );
}