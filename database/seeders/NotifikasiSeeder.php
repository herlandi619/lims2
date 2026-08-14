<?php

namespace Database\Seeders;

use App\Models\Notifikasi;
use Illuminate\Database\Seeder;

class NotifikasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'user_id' => 8,
                'judul' => 'Peminjaman Disetujui',
                'isi' => 'Pengajuan peminjaman Laptop Dell Latitude 5420 telah disetujui. Silakan mengambil alat di Laboratorium Komputer.',
                'sudah_dibaca' => false,
            ],

            [
                'user_id' => 9,
                'judul' => 'Booking Ruangan Disetujui',
                'isi' => 'Booking Laboratorium Komputer 1 pada tanggal 28 Juli 2026 telah disetujui.',
                'sudah_dibaca' => false,
            ],

            [
                'user_id' => 10,
                'judul' => 'Pengembalian Alat',
                'isi' => 'Terima kasih. Pengembalian alat telah berhasil dikonfirmasi oleh laboran.',
                'sudah_dibaca' => true,
            ],

            [
                'user_id' => 5,
                'judul' => 'Jadwal Praktikum',
                'isi' => 'Jadwal praktikum Pemrograman Web akan dimulai besok pukul 08.00 WIB.',
                'sudah_dibaca' => false,
            ],

            [
                'user_id' => 3,
                'judul' => 'Maintenance Alat',
                'isi' => 'Terdapat alat yang dijadwalkan maintenance hari ini.',
                'sudah_dibaca' => false,
            ],

            [
                'user_id' => 1,
                'judul' => 'Laporan Bulanan',
                'isi' => 'Laporan inventaris laboratorium bulan Juli telah siap diunduh.',
                'sudah_dibaca' => false,
            ],

        ];

        foreach ($data as $item) {
            Notifikasi::create($item);
        }
    }
}