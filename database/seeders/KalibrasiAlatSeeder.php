<?php

namespace Database\Seeders;

use App\Models\KalibrasiAlat;
use Illuminate\Database\Seeder;

class KalibrasiAlatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'alat_id' => 4,
                'tanggal_kalibrasi' => '2026-01-15',
                'kalibrasi_berikutnya' => '2027-01-15',
                'hasil' => 'lulus',
                'sertifikat' => 'sertifikat-mikroskop-001.pdf',
                'keterangan' => 'Kalibrasi mikroskop berhasil dilakukan.',
            ],

            [
                'alat_id' => 8,
                'tanggal_kalibrasi' => '2026-02-10',
                'kalibrasi_berikutnya' => '2027-02-10',
                'hasil' => 'lulus',
                'sertifikat' => 'sertifikat-tensimeter-001.pdf',
                'keterangan' => 'Alat memenuhi standar pengukuran.',
            ],

            [
                'alat_id' => 7,
                'tanggal_kalibrasi' => '2026-03-05',
                'kalibrasi_berikutnya' => '2027-03-05',
                'hasil' => 'tidak_lulus',
                'sertifikat' => null,
                'keterangan' => 'Perlu dilakukan perbaikan sebelum kalibrasi ulang.',
            ],

        ];

        foreach ($data as $item) {
            KalibrasiAlat::create($item);
        }
    }
}