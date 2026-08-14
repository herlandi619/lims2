<?php

namespace Database\Seeders;

use App\Models\Arsip;
use Illuminate\Database\Seeder;

class ArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'judul' => 'SOP Penggunaan Laboratorium Komputer',
                'kategori' => 'sop',
                'file' => 'arsip/sop-laboratorium-komputer.pdf',
                'upload_by' => 1,
            ],

            [
                'judul' => 'SOP Peminjaman Alat Laboratorium',
                'kategori' => 'sop',
                'file' => 'arsip/sop-peminjaman-alat.pdf',
                'upload_by' => 1,
            ],

            [
                'judul' => 'Modul Praktikum Pemrograman Web',
                'kategori' => 'modul',
                'file' => 'arsip/modul-pemrograman-web.pdf',
                'upload_by' => 5,
            ],

            [
                'judul' => 'Modul Praktikum Jaringan Komputer',
                'kategori' => 'modul',
                'file' => 'arsip/modul-jaringan-komputer.pdf',
                'upload_by' => 6,
            ],

            [
                'judul' => 'Manual Book Mikroskop Olympus CX23',
                'kategori' => 'manual_alat',
                'file' => 'arsip/manual-mikroskop.pdf',
                'upload_by' => 3,
            ],

            [
                'judul' => 'Manual Book Router Cisco 2911',
                'kategori' => 'manual_alat',
                'file' => 'arsip/manual-router-cisco.pdf',
                'upload_by' => 3,
            ],

            [
                'judul' => 'Surat Inventaris Laboratorium 2026',
                'kategori' => 'dokumen',
                'file' => 'arsip/inventaris-2026.pdf',
                'upload_by' => 1,
            ],

            [
                'judul' => 'Denah Laboratorium STIKes WDH',
                'kategori' => 'lainnya',
                'file' => 'arsip/denah-laboratorium.pdf',
                'upload_by' => 1,
            ],

        ];

        foreach ($data as $arsip) {
            Arsip::create($arsip);
        }
    }
}