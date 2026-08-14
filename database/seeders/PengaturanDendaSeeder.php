<?php

// database/seeders/PengaturanDendaSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PengaturanDenda;

class PengaturanDendaSeeder extends Seeder
{
    public function run(): void
    {
        // Memastikan hanya ada 1 record master pengaturan
        PengaturanDenda::firstOrCreate(
            ['id' => 1],
            [
                'denda_per_hari'     => 5000,
                'denda_rusak_ringan' => 25000,
                'denda_rusak_berat'  => 50000,
            ]
        );
    }
}