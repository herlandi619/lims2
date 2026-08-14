import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';

export default function Index({ kelas }) {
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [pertemuanList, setPertemuanList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Buka Detail 14 Pertemuan Kelas
    const openDetailKelas = (kelasId) => {
        setLoading(true);
        axios.get(route('mahasiswa.absensi.kelas', kelasId)).then((res) => {
            setSelectedKelas(res.data.kelas);
            setPertemuanList(res.data.pertemuan_list);
            setLoading(false);
        });
    };

    return (
        <MahasiswaLayout title="Absensi Saya">
            <Head title="Absensi Praktikum Saya" />

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-800">Monitoring Kehadiran Praktikum</h2>
                    <p className="text-sm text-slate-500">Pantau rekapitulasi absensi 14 pertemuan pada setiap mata praktikum yang Anda ikuti.</p>
                </div>

                {/* Grid Kartu Kelas Praktikum */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kelas.length > 0 ? (
                        kelas.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md font-mono">
                                        {item.kode_kelas}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">
                                        Sem {item.semester} - {item.nama_kelas}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 text-base mb-1">{item.nama_praktikum}</h3>
                                <p className="text-xs text-slate-500 mb-4">Dosen: {item.dosen?.name || '-'}</p>

                                {/* Progress Bar & Stat Persentase */}
                                <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-600">Kehadiran (Hadir/14)</span>
                                        <span className={item.rekap_pribadi.persentase >= 75 ? 'text-emerald-600' : 'text-red-600'}>
                                            {item.rekap_pribadi.persentase}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.rekap_pribadi.persentase >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                            style={{ width: `${item.rekap_pribadi.persentase}%` }}
                                        ></div>
                                    </div>

                                    {/* Badges Rekap */}
                                    <div className="grid grid-cols-4 gap-1 text-center pt-2 text-[10px] font-bold">
                                        <span className="bg-emerald-100 text-emerald-800 py-1 rounded">H: {item.rekap_pribadi.hadir}</span>
                                        <span className="bg-amber-100 text-amber-800 py-1 rounded">I: {item.rekap_pribadi.izin}</span>
                                        <span className="bg-blue-100 text-blue-800 py-1 rounded">S: {item.rekap_pribadi.sakit}</span>
                                        <span className="bg-red-100 text-red-800 py-1 rounded">A: {item.rekap_pribadi.alpa}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openDetailKelas(item.id)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    Lihat 14 Lembar Pertemuan
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                            Belum ada kelas praktikum yang terdaftar untuk Anda.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail 14 Pertemuan Mahasiswa */}
            {selectedKelas && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{selectedKelas.nama_praktikum}</h3>
                                <p className="text-xs text-slate-500">Status Absensi Pribadi per Lembar Pertemuan</p>
                            </div>
                            <button onClick={() => setSelectedKelas(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pertemuanList.map((ptm) => (
                                <div key={ptm.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-xs text-slate-800">Pertemuan Ke-{ptm.pertemuan_ke}</span>
                                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                                            {ptm.topik_materi || 'Materi belum diisi'}
                                        </p>
                                        <span className="text-[10px] text-slate-400">
                                            {ptm.tanggal_praktik || '-'}
                                        </span>
                                    </div>

                                    <div>
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold capitalize ${
                                            ptm.status_kehadiran === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                            ptm.status_kehadiran === 'izin' ? 'bg-amber-100 text-amber-800' :
                                            ptm.status_kehadiran === 'sakit' ? 'bg-blue-100 text-blue-800' :
                                            ptm.status_kehadiran === 'alpa' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            {ptm.status_kehadiran === 'belum_absen' ? 'Belum Ada Data' : ptm.status_kehadiran}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button onClick={() => setSelectedKelas(null)} className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MahasiswaLayout>
    );
}