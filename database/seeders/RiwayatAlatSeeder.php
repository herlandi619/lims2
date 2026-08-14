<?php

namespace Database\Seeders;

use App\Models\RiwayatAlat;
use Illuminate\Database\Seeder;

class RiwayatAlatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'alat_id' => 1,
                'user_id' => 8,
                'aktivitas' => 'Peminjaman',
                'keterangan' => 'Laptop Dell Latitude dipinjam untuk Praktikum Pemrograman Web.',
            ],

            [
                'alat_id' => 1,
                'user_id' => 8,
                'aktivitas' => 'Pengembalian',
                'keterangan' => 'Laptop dikembalikan dalam kondisi baik.',
            ],

            [
                'alat_id' => 4,
                'user_id' => 9,
                'aktivitas' => 'Kalibrasi',
                'keterangan' => 'Mikroskop telah berhasil dikalibrasi.',
            ],

            [
                'alat_id' => 5,
                'user_id' => 3, // Laboran
                'aktivitas' => 'Maintenance',
                'keterangan' => 'Router Cisco dilakukan maintenance preventif.',
            ],

            [
                'alat_id' => 8,
                'user_id' => 3,
                'aktivitas' => 'Maintenance',
                'keterangan' => 'Tensimeter sedang dalam proses perbaikan.',
            ],

        ];

        foreach ($data as $item) {
            RiwayatAlat::create($item);
        }
    }
}