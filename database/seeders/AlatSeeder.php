<?php

namespace Database\Seeders;

use App\Models\Alat;
use Illuminate\Database\Seeder;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        $data = [

            [
                'kode_alat' => 'ALT001',
                'qr_code' => 'ALT001',
                'nama_alat' => 'Laptop Dell Latitude 5420',
                'kategori_id' => 1,
                'supplier_id' => 3,
                'lokasi_id' => 2,
                'merk' => 'Dell',
                'spesifikasi' => 'Core i5, RAM 8GB, SSD 256GB',
                'jumlah_stok' => 20,
                'stok_tersedia' => 20,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-01-10',
            ],

            [
                'kode_alat' => 'ALT002',
                'qr_code' => 'ALT002',
                'nama_alat' => 'Laptop Lenovo ThinkPad',
                'kategori_id' => 1,
                'supplier_id' => 3,
                'lokasi_id' => 3,
                'merk' => 'Lenovo',
                'spesifikasi' => 'Core i7, RAM 16GB',
                'jumlah_stok' => 15,
                'stok_tersedia' => 15,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-02-15',
            ],

            [
                'kode_alat' => 'ALT003',
                'qr_code' => 'ALT003',
                'nama_alat' => 'Proyektor Epson',
                'kategori_id' => 4,
                'supplier_id' => 2,
                'lokasi_id' => 5,
                'merk' => 'Epson',
                'spesifikasi' => '3800 Lumens',
                'jumlah_stok' => 5,
                'stok_tersedia' => 5,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2024-12-01',
            ],

            [
                'kode_alat' => 'ALT004',
                'qr_code' => 'ALT004',
                'nama_alat' => 'Mikroskop Olympus CX23',
                'kategori_id' => 6,
                'supplier_id' => 6,
                'lokasi_id' => 6,
                'merk' => 'Olympus',
                'spesifikasi' => 'Binocular 1000x',
                'jumlah_stok' => 10,
                'stok_tersedia' => 10,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2024-08-12',
            ],

            [
                'kode_alat' => 'ALT005',
                'qr_code' => 'ALT005',
                'nama_alat' => 'Router Cisco 2911',
                'kategori_id' => 2,
                'supplier_id' => 1,
                'lokasi_id' => 4,
                'merk' => 'Cisco',
                'spesifikasi' => 'Gigabit Router',
                'jumlah_stok' => 12,
                'stok_tersedia' => 12,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-03-05',
            ],

            [
                'kode_alat' => 'ALT006',
                'qr_code' => 'ALT006',
                'nama_alat' => 'Switch Cisco 24 Port',
                'kategori_id' => 2,
                'supplier_id' => 1,
                'lokasi_id' => 4,
                'merk' => 'Cisco',
                'spesifikasi' => '24 Port Gigabit',
                'jumlah_stok' => 10,
                'stok_tersedia' => 10,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-03-05',
            ],

            [
                'kode_alat' => 'ALT007',
                'qr_code' => 'ALT007',
                'nama_alat' => 'Skeleton Anatomi',
                'kategori_id' => 7,
                'supplier_id' => 6,
                'lokasi_id' => 7,
                'merk' => 'Human Model',
                'spesifikasi' => 'Ukuran Dewasa',
                'jumlah_stok' => 3,
                'stok_tersedia' => 3,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2023-09-01',
            ],

            [
                'kode_alat' => 'ALT008',
                'qr_code' => 'ALT008',
                'nama_alat' => 'Tensimeter Digital',
                'kategori_id' => 5,
                'supplier_id' => 6,
                'lokasi_id' => 1,
                'merk' => 'Omron',
                'spesifikasi' => 'Digital',
                'jumlah_stok' => 15,
                'stok_tersedia' => 15,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-04-20',
            ],

            [
                'kode_alat' => 'ALT009',
                'qr_code' => 'ALT009',
                'nama_alat' => 'Kamera DSLR Canon',
                'kategori_id' => 4,
                'supplier_id' => 5,
                'lokasi_id' => 5,
                'merk' => 'Canon',
                'spesifikasi' => 'EOS 250D',
                'jumlah_stok' => 3,
                'stok_tersedia' => 3,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-02-01',
            ],

            [
                'kode_alat' => 'ALT010',
                'qr_code' => 'ALT010',
                'nama_alat' => 'Printer Epson L3250',
                'kategori_id' => 1,
                'supplier_id' => 2,
                'lokasi_id' => 2,
                'merk' => 'Epson',
                'spesifikasi' => 'Ink Tank',
                'jumlah_stok' => 2,
                'stok_tersedia' => 2,
                'kondisi' => 'baik',
                'status' => 'tersedia',
                'tanggal_pembelian' => '2025-01-20',
            ],
        ];

        foreach ($data as $alat) {
            Alat::create($alat);
        }
    }
}