<?php

namespace Database\Seeders;

use App\Models\DetailPeminjaman;
use Illuminate\Database\Seeder;

class DetailPeminjamanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [

            [
                'peminjaman_id' => 1,
                'alat_id' => 1,
                'jumlah' => 1,
                'kondisi_sebelum' => 'baik',
                'kondisi_sesudah' => null,
            ],

            [
                'peminjaman_id' => 2,
                'alat_id' => 5,
                'jumlah' => 2,
                'kondisi_sebelum' => 'baik',
                'kondisi_sesudah' => null,
            ],

            [
                'peminjaman_id' => 3,
                'alat_id' => 4,
                'jumlah' => 1,
                'kondisi_sebelum' => 'baik',
                'kondisi_sesudah' => 'baik',
            ],

            [
                'peminjaman_id' => 4,
                'alat_id' => 2,
                'jumlah' => 1,
                'kondisi_sebelum' => 'baik',
                'kondisi_sesudah' => null,
            ],

        ];

        foreach ($data as $item) {
            DetailPeminjaman::create($item);
        }
    }
}