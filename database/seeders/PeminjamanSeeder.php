<?php

namespace Database\Seeders;

use App\Models\Peminjaman;
use Illuminate\Database\Seeder;

class PeminjamanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [

            [
                'kode_peminjaman' => 'PMJ0001',
                'user_id' => 8,
                'tanggal_pinjam' => '2026-07-20',
                'tanggal_rencana_kembali' => '2026-07-25',
                'status' => 'menunggu',
                'keperluan' => 'Praktikum Pemrograman Web',
            ],

            [
                'kode_peminjaman' => 'PMJ0002',
                'user_id' => 9,
                'tanggal_pinjam' => '2026-07-18',
                'tanggal_rencana_kembali' => '2026-07-23',
                'status' => 'dipinjam',
                'keperluan' => 'Praktikum Jaringan',
            ],

            [
                'kode_peminjaman' => 'PMJ0003',
                'user_id' => 10,
                'tanggal_pinjam' => '2026-07-10',
                'tanggal_rencana_kembali' => '2026-07-15',
                'status' => 'dikembalikan',
                'keperluan' => 'Penelitian',
            ],

            [
                'kode_peminjaman' => 'PMJ0004',
                'user_id' => 11,
                'tanggal_pinjam' => '2026-07-22',
                'tanggal_rencana_kembali' => '2026-07-28',
                'status' => 'disetujui',
                'keperluan' => 'Praktikum Basis Data',
            ],

        ];

        foreach ($data as $item) {
            Peminjaman::create($item);
        }
    }
}