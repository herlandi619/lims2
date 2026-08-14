<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Menampung hingga 112 kelas (16 kelas x 7 semester)
        Schema::create('kelas_praktikum', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kelas')->unique(); // Contoh: FAR-SEM3-A
            $table->string('nama_praktikum'); // Contoh: Praktikum Farmakologi
            $table->tinyInteger('semester'); // 1 sampai 7
            $table->string('nama_kelas'); // Contoh: Kelas A, Kelas B
            $table->string('tahun_ajaran'); // Contoh: 2025/2026

            $table->foreignId('dosen_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('ruangan_id')
                ->nullable()
                ->constrained('ruangan')
                ->nullOnDelete();

            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas_praktikum');
    }
};