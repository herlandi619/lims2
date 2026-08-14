<?php

namespace Database\Seeders;

use App\Models\KategoriAlat;
use Illuminate\Database\Seeder;

class KategoriAlatSeeder extends Seeder
{
    public function run(): void
    {
        $kategori = [
            'Komputer',
            'Jaringan',
            'Elektronika',
            'Multimedia',
            'Medis',
            'Mikrobiologi',
            'Anatomi',
            'Kimia',
            'Fisiologi',
            'Peralatan Umum'
        ];

        foreach ($kategori as $item) {

            KategoriAlat::create([
                'nama_kategori' => $item,
            ]);

        }
    }
}