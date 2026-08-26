<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_laboratorium', function (Blueprint $table) {
            $table->id();

            // Relasi ke kelas praktikum (otomatis dapat mata_kuliah, kelas, & dosen)
            $table->foreignId('kelas_praktikum_id')
                ->constrained('kelas_praktikum')
                ->cascadeOnDelete();

            // Tetap dipakai jika ruangan lab berbeda dengan ruangan default kelas
            $table->foreignId('ruangan_id')
                ->constrained('ruangan')
                ->cascadeOnDelete();

            $table->enum('hari', [
                'senin',
                'selasa',
                'rabu',
                'kamis',
                'jumat',
                'sabtu'
            ]);

            $table->time('jam_mulai');
            $table->time('jam_selesai');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Diperbaiki dari 'jadwal_laboratoria' ke 'jadwal_laboratorium'
        Schema::dropIfExists('jadwal_laboratorium');
    }
};