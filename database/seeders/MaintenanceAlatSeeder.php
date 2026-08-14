<?php

namespace Database\Seeders;

use App\Models\MaintenanceAlat;
use Illuminate\Database\Seeder;

class MaintenanceAlatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'alat_id' => 1,
                'tanggal_maintenance' => '2026-07-01',
                'jenis' => 'preventif',
                'teknisi' => 'Andi Pratama',
                'biaya' => 150000,
                'status' => 'selesai',
                'keterangan' => 'Pembersihan dan pengecekan hardware.',
            ],

            [
                'alat_id' => 4,
                'tanggal_maintenance' => '2026-07-05',
                'jenis' => 'korektif',
                'teknisi' => 'Siti Rahma',
                'biaya' => 250000,
                'status' => 'selesai',
                'keterangan' => 'Penggantian lensa mikroskop.',
            ],

            [
                'alat_id' => 5,
                'tanggal_maintenance' => '2026-07-10',
                'jenis' => 'preventif',
                'teknisi' => 'Andi Pratama',
                'biaya' => 100000,
                'status' => 'selesai',
                'keterangan' => 'Update firmware router.',
            ],

            [
                'alat_id' => 8,
                'tanggal_maintenance' => '2026-07-15',
                'jenis' => 'darurat',
                'teknisi' => 'Vendor Omron',
                'biaya' => 500000,
                'status' => 'proses',
                'keterangan' => 'Perbaikan sensor tensimeter.',
            ],

        ];

        foreach ($data as $item) {
            MaintenanceAlat::create($item);
        }
    }
}