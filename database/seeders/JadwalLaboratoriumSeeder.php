<?php

namespace Database\Seeders;

use App\Models\JadwalLaboratorium;
use Illuminate\Database\Seeder;

class JadwalLaboratoriumSeeder extends Seeder
{
    public function run(): void
    {
        $jadwal = [

            [
                'ruangan_id' => 1,
                'dosen_id' => 5,
                'mata_kuliah' => 'Pemrograman Web',
                'kelas' => 'SI-5A',
                'hari' => 'senin',
                'jam_mulai' => '08:00',
                'jam_selesai' => '10:00',
            ],

            [
                'ruangan_id' => 3,
                'dosen_id' => 6,
                'mata_kuliah' => 'Jaringan Komputer',
                'kelas' => 'SI-5B',
                'hari' => 'selasa',
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:00',
            ],

            [
                'ruangan_id' => 5,
                'dosen_id' => 5,
                'mata_kuliah' => 'Mikrobiologi',
                'kelas' => 'AK-3A',
                'hari' => 'rabu',
                'jam_mulai' => '08:00',
                'jam_selesai' => '10:00',
            ],

            [
                'ruangan_id' => 4,
                'dosen_id' => 7,
                'mata_kuliah' => 'Multimedia',
                'kelas' => 'SI-4A',
                'hari' => 'kamis',
                'jam_mulai' => '13:00',
                'jam_selesai' => '15:00',
            ],

            [
                'ruangan_id' => 6,
                'dosen_id' => 5,
                'mata_kuliah' => 'Anatomi',
                'kelas' => 'KEP-2A',
                'hari' => 'jumat',
                'jam_mulai' => '08:00',
                'jam_selesai' => '10:00',
            ],

        ];

        foreach ($jadwal as $item) {
            JadwalLaboratorium::create($item);
        }
    }
}