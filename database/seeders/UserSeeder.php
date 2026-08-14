<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => true,
        ]);

        // Kepala Laboran
        User::create([
            'name' => 'Dr. Hendra Saputra',
            'email' => 'kepalalab@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'kepala_laboran',
            'nip' => '198705102015011001',
            'status' => true,
        ]);

        // Laboran
        User::create([
            'name' => 'Andi Pratama',
            'email' => 'laboran@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'laboran',
            'nip' => '198906122016011002',
            'status' => true,
        ]);

        User::create([
            'name' => 'Siti Rahma',
            'email' => 'siti@stikeswdh.ac.id',
            'password' => Hash::make('password'),
            'role' => 'laboran',
            'nip' => '199003152017011003',
            'status' => true,
        ]);

        // Dosen
        $dosen = [
            [
                'name' => 'Dr. Rina Anggraini',
                'email' => 'dosen@gmail.com',
                'nip' => '197901012010012001',
            ],
            [
                'name' => 'Dr. Agus Salim',
                'email' => 'agus@stikeswdh.ac.id',
                'nip' => '198002022011011002',
            ],
            [
                'name' => 'Dewi Lestari, M.Kom',
                'email' => 'dewi@stikeswdh.ac.id',
                'nip' => '198503032012012003',
            ],
        ];

        foreach ($dosen as $item) {
            User::create([
                'name' => $item['name'],
                'email' => $item['email'],
                'password' => Hash::make('password'),
                'role' => 'dosen',
                'nip' => $item['nip'],
                'status' => true,
            ]);
        }

        // Mahasiswa
        $mahasiswa = [
            ['jhin','221011400001'],
            ['Ahmad Fauzi','221011400002'],
            ['Dinda Ayu','221011400003'],
            ['Rizky Ramadhan','221011400004'],
            ['Nur Aisyah','221011400005'],
            ['Fitri Handayani','221011400006'],
            ['Muhammad Iqbal','221011400007'],
            ['Siska Amelia','221011400008'],
            ['Yoga Pratama','221011400009'],
            ['Nabila Putri','221011400010'],
        ];

        foreach ($mahasiswa as $index => $item) {

            User::create([
                'name' => $item[0],
                'email' => 'mahasiswa'.($index+1).'@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
                'nim' => $item[1],
                'status' => true,
            ]);

        }
    }
}