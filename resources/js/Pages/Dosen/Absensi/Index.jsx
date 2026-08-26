import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DosenLayout from '@/Layouts/DosenLayout';
import Swal from 'sweetalert2';

export default function Index({ kelas, ruangan, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [semesterFilter, setSemesterFilter] = useState(filters.semester || '');
    
    // Modal Controls
    const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
    const [selectedKelasMap, setSelectedKelasMap] = useState(null);
    const [selectedPertemuan, setSelectedPertemuan] = useState(null);
    const [listAbsensi, setListAbsensi] = useState([]);
    const [topikMateri, setTopikMateri] = useState('');
    const [tanggalPraktik, setTanggalPraktik] = useState('');

    // Form Tambah Kelas Praktikum
    const { data, setData, post, processing, errors, reset } = useForm({
        kode_kelas: '',
        nama_praktikum: '',
        semester: 1,
        nama_kelas: 'Kelas A',
        tahun_ajaran: '2025/2026',
        ruangan_id: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dosen.absensi.index'), { search, semester: semesterFilter }, { preserveState: true, replace: true });
    };

    const handleTambahKelas = (e) => {
        e.preventDefault();
        post(route('dosen.absensi.kelas.store'), {
            onSuccess: () => {
                setIsTambahModalOpen(false);
                reset();
                Swal.fire('Berhasil!', 'Kelas Praktikum & 14 Pertemuan berhasil dikonfigurasi.', 'success');
            } 
        });
    };

    // Buka Modal Map 14 Pertemuan
    const openMapPertemuan = (item) => {
        setSelectedKelasMap(item);
    };

    // Buka Sheet Absensi Pertemuan Spesifik
    const openLembarAbsensi = (pertemuanId) => {
        axios.get(route('dosen.absensi.pertemuan.show', pertemuanId)).then((res) => {
            setSelectedPertemuan(res.data.pertemuan);
            setListAbsensi(res.data.list_absensi);
            setTopikMateri(res.data.pertemuan.topik_materi || '');
            setTanggalPraktik(res.data.pertemuan.tanggal_praktik || new Date().toISOString().split('T')[0]);
        });
    };

    // Handle Perubahan Status Absensi Mahasiswa
    const handleStatusChange = (index, status) => {
        const updated = [...listAbsensi];
        updated[index].status_kehadiran = status;
        setListAbsensi(updated);
    };

    // Fast Set All (Hadir Semua)
    const setAllStatus = (status) => {
        const updated = listAbsensi.map(item => ({ ...item, status_kehadiran: status }));
        setListAbsensi(updated);
    };

    // Simpan Lembar Absensi
    const handleSimpanAbsensi = (e) => {
        e.preventDefault();
        router.post(route('dosen.absensi.pertemuan.simpan', selectedPertemuan.id), {
            topik_materi: topikMateri,
            tanggal_praktik: tanggalPraktik,
            absensi: listAbsensi
        }, {
            onSuccess: () => {
                setSelectedPertemuan(null);
                Swal.fire('Tersimpan!', 'Lembar absensi pertemuan berhasil diperbarui.', 'success');
            }
        });
    };

    // Destroy
        const handleDeleteKelas = (kelasId) => {
        Swal.fire({
            title: 'Hapus Kelas Praktikum?',
            text: 'Seluruh data 14 pertemuan dan riwayat absensi di kelas ini akan dihapus permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus Kelas',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('dosen.absensi.destroy', kelasId), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Kelas praktikum berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    return (
        <DosenLayout title="Absensi Laboratorium Farmasi">
            <Head title="Absensi Praktikum - Lab Farmasi" />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Map Absensi Praktikum (14 Pertemuan)</h2>
                        <p className="text-sm text-slate-500">Kelola 112 Kelas Praktikum & 14 Lembar Pertemuan per Semester.</p>
                    </div>
                    <button
                        onClick={() => setIsTambahModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors"
                    >
                        + Buat Kelas Praktikum Baru
                    </button>
                </div>

                {/* Filter */}
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari mata kuliah atau kode kelas..."
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg w-full md:w-64"
                    />
                    <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    >
                        <option value="">Semua Semester (1-7)</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg">
                        Filter
                    </button>
                </form>

                {/* Tabel Kelas */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Praktikum</th>
                                <th className="px-4 py-3">Semester</th>
                                <th className="px-4 py-3">Kelas</th>
                                <th className="px-4 py-3">Total Map</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {kelas.data.length > 0 ? (
                                kelas.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.kode_kelas}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.nama_praktikum}</td>
                                        <td className="px-4 py-3">Semester {item.semester}</td>
                                        <td className="px-4 py-3">{item.nama_kelas}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-xs">
                                                14 Pertemuan
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openMapPertemuan(item)}
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    Buka Map Absensi (14)
                                                </button>

                                                {/* 🗑️ TOMBOL DELETE KELAS */}
                                                <button
                                                    onClick={() => handleDeleteKelas(item.id)}
                                                    className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium rounded-lg transition-colors"
                                                    title="Hapus Kelas Praktikum"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                                                            </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-slate-400">Belum ada kelas praktikum dibuat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500">Menampilkan {kelas.from ?? 0} hingga {kelas.to ?? 0} dari {kelas.total} kelas</p>
                    <div className="flex gap-1">
                        {kelas.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs rounded border ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Drawer: 14 Map Pertemuan */}
            {selectedKelasMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Map Absensi: {selectedKelasMap.nama_praktikum}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedKelasMap.kode_kelas} - {selectedKelasMap.nama_kelas} (Semester {selectedKelasMap.semester})
                                </p>
                            </div>
                            {/* 🌟 TOMBOL EXPORT PDF */}
                            <div className="flex items-center gap-2">
                                <a
                                    href={route('dosen.absensi.kelas.exportPdf', selectedKelasMap.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                                >
                                    📄 Export PDF Rekap
                                </a>
                                <button onClick={() => setSelectedKelasMap(null)} className="text-slate-400 hover:text-slate-600 font-bold px-2">✕</button>
                            </div>

                            {/* <button onClick={() => setSelectedKelasMap(null)} className="text-slate-400 hover:text-slate-600">✕</button> */}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* PERBAIKAN: Gunakan relasi selectedKelasMap.pertemuan jika sudah dimuat dari Controller */}
                            {selectedKelasMap.pertemuan && selectedKelasMap.pertemuan.length > 0 ? (
                                selectedKelasMap.pertemuan.map((pertemuan) => (
                                    <div key={pertemuan.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 hover:border-indigo-500 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-xs text-indigo-700">
                                                Lembar Ke-{pertemuan.pertemuan_ke}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                                pertemuan.status_pertemuan === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {pertemuan.status_pertemuan}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mb-3">
                                            {pertemuan.topik_materi || `Pertemuan ${pertemuan.pertemuan_ke}`}
                                        </p>
                                        <button
                                            type="button"
                                            /* ✅ PERBAIKAN: Oper ID dari pertemuannya langsung (pertemuan.id), BUKAN kelas.id */
                                            onClick={() => openLembarAbsensi(pertemuan.id)}
                                            className="w-full py-1.5 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded text-xs font-semibold transition-colors"
                                        >
                                            Isi Presensi
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-xs text-slate-400 py-4">
                                    Data 14 pertemuan belum digenerate untuk kelas ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sheet Isi Lembar Presensi */}
            {selectedPertemuan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Lembar Absensi Ke-{selectedPertemuan.pertemuan_ke}</h3>
                                <p className="text-xs text-slate-500">Tanggal & Pengisian Kehadiran Praktikan</p>
                            </div>
                            <button onClick={() => setSelectedPertemuan(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSimpanAbsensi} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Tanggal Praktikum</label>
                                    <input
                                        type="date"
                                        value={tanggalPraktik}
                                        onChange={(e) => setTanggalPraktik(e.target.value)}
                                        className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Topik Praktikum</label>
                                    <input
                                        type="text"
                                        value={topikMateri}
                                        onChange={(e) => setTopikMateri(e.target.value)}
                                        className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                        placeholder="Judul modul/topik..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-slate-700">Daftar Presensi Mahasiswa</span>
                                <div className="space-x-1">
                                    <button type="button" onClick={() => setAllStatus('hadir')} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded font-medium">Set Semua Hadir</button>
                                    <button type="button" onClick={() => setAllStatus('alpa')} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">Reset Alpa</button>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                                {listAbsensi.map((mhs, idx) => (
                                    <div key={mhs.mahasiswa_id} className="p-2.5 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="font-semibold text-slate-800">{mhs.nama}</p>
                                            <p className="text-slate-400 font-mono">{mhs.nim}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {['hadir', 'izin', 'sakit', 'alpa'].map((st) => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => handleStatusChange(idx, st)}
                                                    className={`px-2.5 py-1 rounded capitalize font-medium ${
                                                        mhs.status_kehadiran === st
                                                            ? st === 'hadir' ? 'bg-emerald-600 text-white' : st === 'izin' ? 'bg-amber-500 text-white' : st === 'sakit' ? 'bg-blue-500 text-white' : 'bg-red-600 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button type="button" onClick={() => setSelectedPertemuan(null)} className="px-4 py-2 text-xs font-medium text-slate-600">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg">Simpan Lembar Absensi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Kelas Baru */}
            {isTambahModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Buat Kelas Praktikum Baru</h3>
                        <form onSubmit={handleTambahKelas} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Kode Kelas</label>
                                <input type="text" value={data.kode_kelas} onChange={e => setData('kode_kelas', e.target.value)} className="w-full border rounded p-2" placeholder="FAR-SEM1-A" required />
                                {errors.kode_kelas && <span className="text-red-500">{errors.kode_kelas}</span>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Nama Praktikum</label>
                                <input type="text" value={data.nama_praktikum} onChange={e => setData('nama_praktikum', e.target.value)} className="w-full border rounded p-2" placeholder="Praktikum Kimia Farmasi" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Semester (1-7)</label>
                                    <select value={data.semester} onChange={e => setData('semester', e.target.value)} className="w-full border rounded p-2">
                                        {[1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Nama Kelas</label>
                                    <input type="text" value={data.nama_kelas} onChange={e => setData('nama_kelas', e.target.value)} className="w-full border rounded p-2" placeholder="Kelas A" required />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Tahun Ajaran</label>
                                <input type="text" value={data.tahun_ajaran} onChange={e => setData('tahun_ajaran', e.target.value)} className="w-full border rounded p-2" placeholder="2025/2026" required />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button type="button" onClick={() => setIsTambahModalOpen(false)} className="px-3 py-1.5 text-slate-600">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-1.5 bg-emerald-600 text-white font-medium rounded">Generate 14 Lembar Absensi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DosenLayout>
    ); 
}