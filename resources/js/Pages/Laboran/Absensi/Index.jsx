import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LaboranLayout from '@/Layouts/LaboranLayout';

export default function Index({ kelas, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [semesterFilter, setSemesterFilter] = useState(filters.semester || '');
    
    const [selectedKelasMap, setSelectedKelasMap] = useState(null);
    const [selectedPertemuan, setSelectedPertemuan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboran.absensi.monitoring'), { search, semester: semesterFilter }, { preserveState: true, replace: true });
    };

    // Buka Detail Map 14 Pertemuan (Read-Only)
    const openMapPertemuan = (kelasId) => {
        setLoading(true);
        axios.get(route('laboran.absensi.monitoring.kelas', kelasId)).then((res) => {
            setSelectedKelasMap(res.data.kelas);
            setLoading(false);
        });
    };

    // Buka Detail Lembar Absensi Mahasiswa (Read-Only)
    const openLembarAbsensi = (pertemuanId) => {
        setLoading(true);
        axios.get(route('laboran.absensi.monitoring.pertemuan', pertemuanId)).then((res) => {
            setSelectedPertemuan(res.data.pertemuan);
            setLoading(false);
        });
    };

    return (
        <LaboranLayout title="Monitoring Absensi Praktikum">
            <Head title="Monitoring Absensi - Laboran" />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Monitoring Absensi Praktikum Farmasi</h2>
                        <p className="text-sm text-slate-500">Pantau rekapitulasi kehadiran mahasiswa dan status 14 lembar pertemuan kelas.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-200">
                        <span>ℹ️</span> Mode Monitoring (Read-Only)
                    </div>
                </div>

                {/* Filter */}
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari mata kuliah, kelas, atau dosen..."
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
                        Cari
                    </button>

                    {/* TOMBOL BARU: CETAK REKAP BERITA ACARA */}
                    <a href={route('laboran.absensi.monitoring.export-berita-acara', { semester: semesterFilter })} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                        📄 Cetak Rekap Berita Acara & Absen
                    </a>
                </form>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Praktikum</th>
                                <th className="px-4 py-3">Semester / Kelas</th>
                                <th className="px-4 py-3">Dosen Pengampu</th>
                                <th className="px-4 py-3">Progres Pertemuan</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {kelas.data.length > 0 ? (
                                kelas.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.kode_kelas}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.nama_praktikum}</td>
                                        <td className="px-4 py-3">Sem {item.semester} - {item.nama_kelas}</td>
                                        <td className="px-4 py-3 text-xs">{item.dosen?.name || 'Belum Ditentukan'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full"
                                                        style={{ width: `${(item.total_pertemuan_selesai / 14) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">
                                                    {item.total_pertemuan_selesai}/14
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openMapPertemuan(item.id)}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg"
                                            >
                                                Pantau Map (14)
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-slate-400">Tidak ada kelas praktikum ditemukan.</td>
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
                                className={`px-3 py-1 text-xs rounded border ${link.active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Drawer 14 Pertemuan (Read-Only) */}
            {selectedKelasMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                       <div className="flex justify-between items-start mb-4 border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Detail Map Absensi: {selectedKelasMap.nama_praktikum}</h3>
                                <p className="text-xs text-slate-500">Dosen Pengampu: {selectedKelasMap.dosen?.name || '-'}</p>
                            </div>
                            
                            {/* Area Tombol Kanan */}
                            <div className="flex items-center gap-3">
                                {/* Tombol Cetak Khusus Kelas Ini */}
                                <a 
                                    href={route('laboran.absensi.monitoring.export-berita-acara', { kelas_id: selectedKelasMap.id })} 
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                >
                                    📄 Cetak Rekap Kelas Ini
                                </a>
                                
                                <button onClick={() => setSelectedKelasMap(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">✕</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {selectedKelasMap.pertemuan?.map((pertemuan) => (
                                <div key={pertemuan.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-xs text-slate-800">Lembar Ke-{pertemuan.pertemuan_ke}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${
                                            pertemuan.status_pertemuan === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {pertemuan.status_pertemuan}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-3">
                                        {pertemuan.tanggal_praktik || 'Belum Diisi'}
                                    </p>
                                    <button
                                        onClick={() => openLembarAbsensi(pertemuan.id)}
                                        className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors"
                                    >
                                        Lihat Rekap
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sheet Detail Rekap Absensi Mahasiswa (Read-Only) */}
            {selectedPertemuan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Rekap Lembar Ke-{selectedPertemuan.pertemuan_ke}</h3>
                                <p className="text-xs text-slate-500">Materi: {selectedPertemuan.topik_materi || '-'}</p>
                            </div>
                            <button onClick={() => setSelectedPertemuan(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                                <div><span className="text-slate-400">Tanggal:</span> <strong className="text-slate-700">{selectedPertemuan.tanggal_praktik || '-'}</strong></div>
                                <div><span className="text-slate-400">Status Pertemuan:</span> <strong className="capitalize text-emerald-600">{selectedPertemuan.status_pertemuan}</strong></div>
                            </div>

                            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                                {selectedPertemuan.detail_absensi?.length > 0 ? (
                                    selectedPertemuan.detail_absensi.map((detail) => (
                                        <div key={detail.id} className="p-2.5 flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-semibold text-slate-800">{detail.mahasiswa?.name}</p>
                                                <p className="text-slate-400 font-mono">{detail.mahasiswa?.nim}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded font-bold capitalize text-[11px] ${
                                                detail.status_kehadiran === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                                detail.status_kehadiran === 'izin' ? 'bg-amber-100 text-amber-800' :
                                                detail.status_kehadiran === 'sakit' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {detail.status_kehadiran}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-xs text-slate-400">Belum ada data presensi mahasiswa yang diinput dosen.</p>
                                )}
                            </div>


                            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border">
                                <div><span className="text-slate-400 block mb-1">Berita Acara:</span> <strong className="text-slate-700 whitespace-pre-wrap">{selectedPertemuan.berita_acara || 'Belum diisi'}</strong></div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Bukti Absen Fisik:</span> 
                                    {selectedPertemuan.file_absen_fisik ? (
                                        <a href={`/storage/${selectedPertemuan.file_absen_fisik}`} target="_blank" className="text-blue-600 font-bold hover:underline">Lihat Dokumen</a>
                                    ) : (
                                        <span className="text-slate-500 italic">Belum ada file</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t">
                                <button onClick={() => setSelectedPertemuan(null)} className="px-4 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg">Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LaboranLayout>
    );
}