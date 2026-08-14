<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [

            [
                'user_id' => 1,
                'aktivitas' => 'Login ke sistem',
                'ip_address' => '192.168.1.10',
                'browser' => 'Google Chrome',
            ],

            [
                'user_id' => 8,
                'aktivitas' => 'Mengajukan peminjaman Laptop Dell Latitude 5420',
                'ip_address' => '192.168.1.20',
                'browser' => 'Mozilla Firefox',
            ],

            [
                'user_id' => 3,
                'aktivitas' => 'Menyetujui peminjaman alat ALT001',
                'ip_address' => '192.168.1.30',
                'browser' => 'Google Chrome',
            ],

            [
                'user_id' => 9,
                'aktivitas' => 'Booking Laboratorium Komputer 1',
                'ip_address' => '192.168.1.40',
                'browser' => 'Microsoft Edge',
            ],

            [
                'user_id' => 3,
                'aktivitas' => 'Melakukan maintenance Router Cisco 2911',
                'ip_address' => '192.168.1.30',
                'browser' => 'Google Chrome',
            ],

            [
                'user_id' => 5,
                'aktivitas' => 'Mengunggah Modul Praktikum Pemrograman Web',
                'ip_address' => '192.168.1.50',
                'browser' => 'Google Chrome',
            ],

            [
                'user_id' => 1,
                'aktivitas' => 'Menambahkan data alat baru',
                'ip_address' => '192.168.1.10',
                'browser' => 'Google Chrome',
            ],

            [
                'user_id' => 10,
                'aktivitas' => 'Mengembalikan alat laboratorium',
                'ip_address' => '192.168.1.60',
                'browser' => 'Safari',
            ],

        ];

        foreach ($data as $log) {
            ActivityLog::create($log);
        }
    }
}