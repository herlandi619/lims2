<?php

namespace Database\Seeders;

use App\Models\BookingRuangan;
use Illuminate\Database\Seeder;

class BookingRuanganSeeder extends Seeder
{
    public function run(): void
    {
        $data = [

            [
                'user_id' => 8,
                'ruangan_id' => 1,
                'tanggal' => '2026-07-28',
                'jam_mulai' => '08:00',
                'jam_selesai' => '10:00',
                'keperluan' => 'Praktikum Mandiri',
                'status' => 'menunggu',
            ],

            [
                'user_id' => 9,
                'ruangan_id' => 3,
                'tanggal' => '2026-07-29',
                'jam_mulai' => '13:00',
                'jam_selesai' => '15:00',
                'keperluan' => 'Praktikum Cisco',
                'status' => 'disetujui',
            ],

            [
                'user_id' => 5,
                'ruangan_id' => 5,
                'tanggal' => '2026-07-30',
                'jam_mulai' => '09:00',
                'jam_selesai' => '11:00',
                'keperluan' => 'Praktikum Mikrobiologi',
                'status' => 'disetujui',
            ],

        ];

        foreach ($data as $item) {
            BookingRuangan::create($item);
        }
    }
}