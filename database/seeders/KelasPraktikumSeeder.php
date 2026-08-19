<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KelasPraktikum; // Pastikan model ini sudah ada

class KelasPraktikumSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'kode_kelas' => 'FAR-SEM3-A',
                'nama_praktikum' => 'Praktikum Farmakologi',
                'semester' => 3,
                'nama_kelas' => 'Kelas A',
                'tahun_ajaran' => '2025/2026',
                'dosen_id' => 1, // Sesuaikan dengan ID user/dosen yang ada di database
                'ruangan_id' => 1, // Sesuaikan dengan ID ruangan yang ada di database
                'status_aktif' => true,
            ],
            [
                'kode_kelas' => 'FAR-SEM3-B',
                'nama_praktikum' => 'Praktikum Farmakologi',
                'semester' => 3,
                'nama_kelas' => 'Kelas B',
                'tahun_ajaran' => '2025/2026',
                'dosen_id' => 2,
                'ruangan_id' => 2,
                'status_aktif' => true,
            ],
            [
                'kode_kelas' => 'FAR-SEM5-A',
                'nama_praktikum' => 'Praktikum Teknologi Formasi Sediaan Steril',
                'semester' => 5,
                'nama_kelas' => 'Kelas A',
                'tahun_ajaran' => '2025/2026',
                'dosen_id' => 1,
                'ruangan_id' => 3,
                'status_aktif' => true,
            ],
        ];

        foreach ($data as $item) {
            KelasPraktikum::create($item);
        }
    }
}