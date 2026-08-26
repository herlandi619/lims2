<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            UserSeeder::class,
            KategoriAlatSeeder::class,
            SupplierSeeder::class,
            LokasiAlatSeeder::class,
            RuanganSeeder::class,

            KelasPraktikumSeeder::class,
            AlatSeeder::class,
            JadwalLaboratoriumSeeder::class,

            PeminjamanSeeder::class,
            DetailPeminjamanSeeder::class,
            BookingRuanganSeeder::class,

            MaintenanceAlatSeeder::class,
            KalibrasiAlatSeeder::class,
            RiwayatAlatSeeder::class,
            ArsipSeeder::class,
            NotifikasiSeeder::class,
            ActivityLogSeeder::class,
            PengaturanDendaSeeder::class,
            SettingSeeder::class,
        ]);
    }
}