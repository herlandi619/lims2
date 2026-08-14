<?php

namespace Database\Seeders;

use App\Models\LokasiAlat;
use Illuminate\Database\Seeder;

class LokasiAlatSeeder extends Seeder
{
    public function run(): void
    {
        $lokasi = [
            'Gudang Laboratorium',
            'Laboratorium Komputer 1',
            'Laboratorium Komputer 2',
            'Laboratorium Jaringan',
            'Laboratorium Multimedia',
            'Laboratorium Mikrobiologi',
            'Laboratorium Anatomi',
            'Ruang Kepala Laboratorium',
        ];

        foreach ($lokasi as $item) {

            LokasiAlat::create([
                'nama_lokasi' => $item,
            ]);

        }
    }
}