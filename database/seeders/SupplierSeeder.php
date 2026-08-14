<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $supplier = [
            'PT Datascrip',
            'PT Epson Indonesia',
            'PT Lenovo Indonesia',
            'PT Asus Indonesia',
            'PT Canon Indonesia',
            'PT Medika Nusantara',
            'CV Laboratorium Indonesia',
        ];

        foreach ($supplier as $item) {

            Supplier::create([
                'nama_supplier' => $item,
                'alamat' => 'Jakarta',
                'telepon' => '02112345678',
                'email' => strtolower(str_replace(' ','',$item)).'@mail.com',
            ]);

        }
    }
}