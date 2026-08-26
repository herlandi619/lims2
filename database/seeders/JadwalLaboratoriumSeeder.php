<?php

namespace Database\Seeders;

use App\Models\JadwalLaboratorium;
use App\Models\KelasPraktikum;
use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class JadwalLaboratoriumSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua ID kelas praktikum dan ruangan yang tersedia
        $kelasIds = KelasPraktikum::pluck('id')->toArray();
        $ruanganIds = Ruangan::pluck('id')->toArray();

        // Cegah eksekusi jika data master kosong
        if (empty($kelasIds) || empty($ruanganIds)) {
            return;
        }

        $jadwal = [
            [
                'hari'       => 'senin',
                'jam_mulai'  => '08:00',
                'jam_selesai' => '10:00',
            ],
            [
                'hari'       => 'selasa',
                'jam_mulai'  => '10:00',
                'jam_selesai' => '12:00',
            ],
            [
                'hari'       => 'rabu',
                'jam_mulai'  => '08:00',
                'jam_selesai' => '10:00',
            ],
            [
                'hari'       => 'kamis',
                'jam_mulai'  => '13:00',
                'jam_selesai' => '15:00',
            ],
            [
                'hari'       => 'jumat',
                'jam_mulai'  => '08:00',
                'jam_selesai' => '10:00',
            ],
        ];

        foreach ($jadwal as $index => $item) {
            // Mengambil ID secara berurutan menggunakan modulus agar aman dari Error Foreign Key
            $kelasId = $kelasIds[$index % count($kelasIds)];
            $ruanganId = $ruanganIds[$index % count($ruanganIds)];

            JadwalLaboratorium::create([
                'kelas_praktikum_id' => $kelasId,
                'ruangan_id'         => $ruanganId,
                'hari'               => $item['hari'],
                'jam_mulai'          => $item['jam_mulai'],
                'jam_selesai'        => $item['jam_selesai'],
            ]);
        }
    }
}