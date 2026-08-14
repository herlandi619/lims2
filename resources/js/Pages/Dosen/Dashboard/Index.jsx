import React, { useState } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Link, router } from '@inertiajs/react';

export default function Index({ jadwalMengajar, bookingRuangan, peminjamanAlat, stats, ruanganList, filters }) {
    // State Modal Form (Hanya untuk keperluan antarmuka/tampilan)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
    const [formData, setFormData] = useState({
        ruangan_id: '',
        tanggal: '',
        jam_mulai: '',
        jam_selesai: '',
        keperluan: '',
    });

    // State Search
    const [searchJadwal, setSearchJadwal] = useState(filters?.search_jadwal || '');
    const [searchBooking, setSearchBooking] = useState(filters?.search_booking || '');

    // Handle Pencarian (Filter Tampilan)
    const handleSearchJadwal = (e) => {
        e.preventDefault();
        router.get(route('dosen.dashboard'), { search_jadwal: searchJadwal, search_booking: searchBooking }, { preserveState: true });
    };

    const handleSearchBooking = (e) => {
        e.preventDefault();
        router.get(route('dosen.dashboard'), { search_booking: searchBooking, search_jadwal: searchJadwal }, { preserveState: true });
    };

    // Control Modal
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ ruangan_id: '', tanggal: '', jam_mulai: '', jam_selesai: '', keperluan: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData({
            ruangan_id: item.ruangan_id || '',
            tanggal: item.tanggal || '',
            jam_mulai: item.jam_mulai || '',
            jam_selesai: item.jam_selesai || '',
            keperluan: item.keperluan || '',
        });
        setIsModalOpen(true);
    };

    return (
        <DosenLayout>
            <div className="p-6 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Dosen</h1>
                    <p className="text-sm text-gray-500">Ringkasan aktivitas mengajar, booking ruangan, dan peminjaman alat.</p>
                </div>

                {/* 1. Cards Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Jadwal Mengajar</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.total_mengajar || 0}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Booking Aktif</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.booking_aktif || 0}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Alat Dipinjam</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.peminjaman_aktif || 0}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Total Booking Ruangan</p>
                        <p className="text-2xl font-bold text-gray-700 mt-1">{stats?.total_booking || 0}</p>
                    </div>
                </div>

                {/* 2. Section: Jadwal Mengajar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Jadwal Mengajar</h2>
                        <form onSubmit={handleSearchJadwal} className="flex gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Cari matkul/kelas..."
                                value={searchJadwal}
                                onChange={(e) => setSearchJadwal(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                            />
                            <button type="submit" className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-gray-600">
                                    <th className="p-3">Mata Kuliah</th>
                                    <th className="p-3">Kelas</th>
                                    <th className="p-3">Ruangan</th>
                                    <th className="p-3">Hari</th>
                                    <th className="p-3">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jadwalMengajar?.data?.length > 0 ? (
                                    jadwalMengajar.data.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{item.mata_kuliah}</td>
                                            <td className="p-3">{item.kelas}</td>
                                            <td className="p-3">{item.ruangan?.nama_ruangan || '-'}</td>
                                            <td className="p-3 capitalize">{item.hari}</td>
                                            <td className="p-3">{item.jam_mulai} - {item.jam_selesai}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-400">Tidak ada jadwal mengajar.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Jadwal */}
                    <div className="flex gap-1 justify-end mt-2">
                        {jadwalMengajar?.links?.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs rounded border ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                } ${!link.url && 'opacity-50 pointer-events-none'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. Section: Booking Ruangan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Booking Ruangan Aktif & Riwayat</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <form onSubmit={handleSearchBooking} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari keperluan/ruangan..."
                                    value={searchBooking}
                                    onChange={(e) => setSearchBooking(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                                />
                                <button type="submit" className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    Cari
                                </button>
                            </form>
                            {/* <button
                                onClick={openCreateModal}
                                className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                            >
                                + Ajukan Booking
                            </button> */}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-gray-600">
                                    <th className="p-3">Ruangan</th>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Waktu</th>
                                    <th className="p-3">Keperluan</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookingRuangan?.data?.length > 0 ? (
                                    bookingRuangan.data.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{item.ruangan?.nama_ruangan || '-'}</td>
                                            <td className="p-3">{item.tanggal}</td>
                                            <td className="p-3">{item.jam_mulai} - {item.jam_selesai}</td>
                                            <td className="p-3">{item.keperluan || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                                    item.status === 'disetujui' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'ditolak' ? 'bg-rose-100 text-rose-700' :
                                                    item.status === 'selesai' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                {item.status === 'menunggu' && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="text-xs text-indigo-600 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="text-xs text-rose-600 hover:underline"
                                                        >
                                                            Batal
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-gray-400">Tidak ada data booking ruangan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Booking */}
                    <div className="flex gap-1 justify-end mt-2">
                        {bookingRuangan?.links?.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs rounded border ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                } ${!link.url && 'opacity-50 pointer-events-none'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 4. Section: Alat Dipinjam */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Alat Laboratorium yang Dipinjam</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-gray-600">
                                    <th className="p-3">Kode Pinjam</th>
                                    <th className="p-3">Item Alat</th>
                                    <th className="p-3">Tgl Pinjam</th>
                                    <th className="p-3">Rencana Kembali</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peminjamanAlat?.data?.length > 0 ? (
                                    peminjamanAlat.data.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-mono font-medium text-gray-800">{item.kode_peminjaman}</td>
                                            <td className="p-3">
                                                <ul className="list-disc list-inside">
                                                    {item.details?.map((d) => (
                                                        <li key={d.id}>{d.alat?.nama_alat || 'Alat'} ({d.jumlah}x)</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="p-3">{item.tanggal_pinjam}</td>
                                            <td className="p-3">{item.tanggal_rencana_kembali}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                                    item.status === 'dipinjam' ? 'bg-amber-100 text-amber-700' :
                                                    item.status === 'dikembalikan' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'ditolak' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-400">Tidak ada data peminjaman alat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Peminjaman */}
                    <div className="flex gap-1 justify-end mt-2">
                        {peminjamanAlat?.links?.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs rounded border ${
                                    link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                } ${!link.url && 'opacity-50 pointer-events-none'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Box Form (Tampilan Saja) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800">
                                {modalMode === 'edit' ? 'Edit Booking Ruangan' : 'Ajukan Booking Ruangan'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Ruangan</label>
                                <select
                                    value={formData.ruangan_id}
                                    onChange={(e) => setFormData({ ...formData, ruangan_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">-- Pilih Ruangan --</option>
                                    {ruanganList?.map((r) => (
                                        <option key={r.id} value={r.id}>{r.nama_ruangan} ({r.kode_ruangan})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        value={formData.jam_mulai}
                                        onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        value={formData.jam_selesai}
                                        onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Keperluan</label>
                                <textarea
                                    value={formData.keperluan}
                                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                                    rows="3"
                                    placeholder="Contoh: Praktikum Pemrograman Web"
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}