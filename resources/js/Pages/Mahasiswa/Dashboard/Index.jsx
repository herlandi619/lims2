import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, metrics, hariIni, jadwalHariIni, notifikasiTerbaru, riwayatPeminjaman, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    // SweetAlert Flash Message Listener
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: flash.error,
            });
        }
    }, [flash]);

    // Live Search dengan Debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('mahasiswa.dashboard'),
                { search },
                { preserveState: true, replace: true }
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('mahasiswa.dashboard'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    return (
        <MahasiswaLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Mahasiswa</h2>}
        >
            <Head title="Dashboard Mahasiswa" />

            <div className="space-y-6">
                {/* 1. INFORMASI METRICS & RINGKASAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kartu 1: Jumlah Alat Dipinjam */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Alat Sedang Dipinjam</p>
                            <h3 className="text-2xl font-bold text-gray-800">{metrics.jumlahDipinjam}</h3>
                        </div>
                    </div>

                    {/* Kartu 2: Booking Ruangan Aktif */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Booking Ruangan Aktif</p>
                            <h3 className="text-2xl font-bold text-gray-800">{metrics.jumlahBookingAktif}</h3>
                        </div>
                    </div>

                    {/* KARTU DENDA BELUM DIBAYAR */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Denda Belum Dibayar</p>
                            <h3 className="text-2xl font-bold text-red-600">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(metrics.totalDenda || 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 2. JADWAL HARI INI & NOTIFIKASI TERBARU */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Jadwal Praktikum Hari Ini */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Jadwal Praktikum Hari Ini {hariIni ? `(${hariIni})` : ''}
                        </h3>

                        {jadwalHariIni.length > 0 ? (
                            <div className="space-y-3">
                                {jadwalHariIni.map((jadwal) => (
                                    <div key={jadwal.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {jadwal.nama_kegiatan || jadwal.matakuliah || jadwal.keterangan || 'Praktikum'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Ruangan: <span className="font-medium text-gray-700">{jadwal.ruangan?.nama_ruangan || '-'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Tidak ada jadwal praktikum untuk hari {hariIni || 'ini'}.
                            </div>
                        )} 
                    </div>

                    {/* Notifikasi Terbaru */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifikasi Terbaru
                        </h3>

                        {notifikasiTerbaru.length > 0 ? (
                            <div className="space-y-3">
                                {notifikasiTerbaru.map((notif) => (
                                    <div key={notif.id} className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500 text-xs">
                                        <p className="font-semibold text-gray-800">{notif.judul}</p>
                                        <p className="text-gray-600 mt-0.5">{notif.isi || notif.pesan}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">{notif.created_at}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Belum ada notifikasi baru.
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. TABEL RIWAYAT PEMINJAMAN TERAKHIR */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-base font-bold text-gray-800">Riwayat Peminjaman Terakhir</h3>

                        {/* Search Input Form */}
                        <form onSubmit={handleSearch} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Cari kode/alat/status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                                    <th className="p-3">Kode Pinjam</th>
                                    <th className="p-3">Daftar Alat Dipinjam</th>
                                    <th className="p-3">Tgl Pinjam</th>
                                    <th className="p-3">Tgl Kembali</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {riwayatPeminjaman.data.length > 0 ? (
                                    riwayatPeminjaman.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-mono font-semibold text-gray-700">{item.kode_peminjaman}</td>
                                            
                                            <td className="p-3 text-gray-800">
                                                {item.details && item.details.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-0.5">
                                                        {item.details.map((detail) => (
                                                            <li key={detail.id} className="font-medium">
                                                                {detail.alat?.nama_alat || 'Alat tidak ditemukan'} 
                                                                <span className="text-gray-500 text-[11px] font-normal"> ({detail.jumlah} unit)</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-gray-400 italic">- Tidak ada detail -</span>
                                                )}
                                            </td>

                                            <td className="p-3 text-gray-600 whitespace-nowrap">{item.tanggal_pinjam}</td>
                                            <td className="p-3 text-gray-600 whitespace-nowrap">{item.tanggal_kembali || item.tanggal_rencana_kembali || '-'}</td>
                                            <td className="p-3 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        item.status === 'disetujui' || item.status === 'dikembalikan'
                                                            ? 'bg-green-100 text-green-700'
                                                            : item.status === 'menunggu'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : item.status === 'dipinjam'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-400">
                                            Data riwayat peminjaman tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Menampilkan {riwayatPeminjaman.from || 0} - {riwayatPeminjaman.to || 0} dari {riwayatPeminjaman.total} data
                        </p>
                        <div className="flex space-x-1">
                            {riwayatPeminjaman.links.map((link, key) => (
                                <Link
                                    key={key}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 text-xs rounded border ${
                                        link.active
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : link.url
                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MahasiswaLayout>
    );
}