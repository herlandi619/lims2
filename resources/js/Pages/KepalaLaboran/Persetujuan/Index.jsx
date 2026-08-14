import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import KepalaLayout from '@/Layouts/KepalaLayout';
import Swal from 'sweetalert2';

export default function PersetujuanIndex({ auth, alatRusak, maintenanceBesar, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState('alat'); // 'alat' atau 'maintenance'
    
    // Modal Box State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [actionType, setActionType] = useState(''); // 'approve_alat', 'reject_alat', 'approve_maint', 'reject_maint'
    const [catatan, setCatatan] = useState('');

    // Handlers Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('kepala.persetujuan.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('kepala.persetujuan.index'), {}, { preserveState: true, replace: true });
    };

    // Pemicu Modal Action
    const openActionModal = (type, data) => {
        setActionType(type);
        setSelectedData(data);
        setCatatan('');
        setIsModalOpen(true);
    };

    // Eksekusi Persetujuan / Penolakan via Inertia (Tanpa direct fetch)
    const handleConfirmAction = (e) => {
        e.preventDefault();
        setIsModalOpen(false);

        let targetRoute = '';
        if (actionType === 'approve_alat') targetRoute = route('kepala.persetujuan.alat.approve-delete', selectedData.id);
        if (actionType === 'reject_alat') targetRoute = route('kepala.persetujuan.alat.reject-delete', selectedData.id);
        if (actionType === 'approve_maint') targetRoute = route('kepala.persetujuan.maintenance.approve', selectedData.id);
        if (actionType === 'reject_maint') targetRoute = route('kepala.persetujuan.maintenance.reject', selectedData.id);

        router.post(
            targetRoute,
            { catatan },
            {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Tindakan persetujuan berhasil diperbarui.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan saat memproses data.',
                        icon: 'error',
                    });
                },
            }
        );
    };

    return (
        <KepalaLayout user={auth.user} header="Pusat Persetujuan Kepala Laboran">
            <Head title="Pusat Persetujuan" />

            <div className="space-y-6">
                {/* --- HEADER & NAVIGATION TABS --- */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('alat')}
                            className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'alat'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Penghapusan Alat ({alatRusak.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'maintenance'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Maintenance Besar ({maintenanceBesar.total})
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Cari kode/nama alat..."
                            className="px-3.5 py-2 border rounded-lg text-xs w-full md:w-60 focus:ring-blue-500 focus:border-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                        >
                            Cari
                        </button>
                        {filters.search && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* --- TAB 1: PENGHAPUSAN ALAT --- */}
                {activeTab === 'alat' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-800">Antrean Persetujuan Penghapusan Alat</h3>
                            <p className="text-xs text-gray-500">
                                Daftar alat dengan kondisi rusak parah/hilang yang diajukan untuk dihapus dari inventaris.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Kode / Nama Alat</th>
                                        <th className="px-6 py-3">Kategori</th>
                                        <th className="px-6 py-3">Lokasi</th>
                                        <th className="px-6 py-3">Kondisi / Status</th>
                                        <th className="px-6 py-3 text-center">Aksi Persetujuan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {alatRusak.data.length > 0 ? (
                                        alatRusak.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{item.nama_alat}</div>
                                                    <div className="text-gray-400">{item.kode_alat}</div>
                                                </td>
                                                <td className="px-6 py-4">{item.kategori?.nama_kategori || '-'}</td>
                                                <td className="px-6 py-4">{item.lokasi?.nama_lokasi || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 uppercase">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openActionModal('approve_alat', item)}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
                                                        >
                                                            Setujui Hapus
                                                        </button>
                                                        <button
                                                            onClick={() => openActionModal('reject_alat', item)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                Tidak ada pengajuan penghapusan alat saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginate 5 */}
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span className="text-gray-500">
                                Menampilkan {alatRusak.from || 0} - {alatRusak.to || 0} dari {alatRusak.total} data
                            </span>
                            <div className="flex gap-1">
                                {alatRusak.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-md border ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: MAINTENANCE BESAR --- */}
                {activeTab === 'maintenance' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-800">Antrean Persetujuan Maintenance Besar</h3>
                            <p className="text-xs text-gray-500">
                                Pengajuan tindakan maintenance khusus (Korektif / Darurat) yang membutuhkan persetujuan.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Nama Alat</th>
                                        <th className="px-6 py-3">Jenis Maintenance</th>
                                        <th className="px-6 py-3">Estimasi Biaya</th>
                                        <th className="px-6 py-3">Teknisi / Keterangan</th>
                                        <th className="px-6 py-3 text-center">Aksi Persetujuan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {maintenanceBesar.data.length > 0 ? (
                                        maintenanceBesar.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    {item.alat?.nama_alat || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase">
                                                        {item.jenis}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    Rp {Number(item.biaya).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>Teknisi: {item.teknisi || '-'}</div>
                                                    <div className="text-gray-400">{item.keterangan || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openActionModal('approve_maint', item)}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => openActionModal('reject_maint', item)}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                Tidak ada pengajuan maintenance besar saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginate 5 */}
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span className="text-gray-500">
                                Menampilkan {maintenanceBesar.from || 0} - {maintenanceBesar.to || 0} dari {maintenanceBesar.total} data
                            </span>
                            <div className="flex gap-1">
                                {maintenanceBesar.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-md border ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL BOX ACTION PERSATUAN --- */}
            {isModalOpen && selectedData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleConfirmAction} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-sm">Konfirmasi Persetujuan</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-xs text-gray-600">
                            <p>
                                Anda akan memproses tindakan untuk: <strong className="text-gray-800">{selectedData.nama_alat || selectedData.alat?.nama_alat}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Kepala Laboran (Opsional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Masukkan alasan atau instruksi tambahan..."
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 text-white rounded-lg text-xs font-medium ${
                                    actionType.startsWith('approve') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Ya, Konfirmasi
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </KepalaLayout>
    );
}