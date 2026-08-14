<?php

namespace Database\Seeders;

use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class RuanganSeeder extends Seeder
{
    public function run(): void
    {
        $ruangan = [
            ['LAB001','Laboratorium Komputer 1'],
            ['LAB002','Laboratorium Komputer 2'],
            ['LAB003','Laboratorium Jaringan'],
            ['LAB004','Laboratorium Multimedia'],
            ['LAB005','Laboratorium Mikrobiologi'],
            ['LAB006','Laboratorium Anatomi'],
        ];

        foreach ($ruangan as $item) {

            Ruangan::create([
                'kode_ruangan' => $item[0],
                'nama_ruangan' => $item[1],
                'kapasitas' => 30,
                'lokasi' => 'Gedung Laboratorium',
                'status' => 'aktif',
            ]);

        }
    }
}