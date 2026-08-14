<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_absensi', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pertemuan_absensi_id')
                ->constrained('pertemuan_absensi')
                ->cascadeOnDelete();

            $table->foreignId('mahasiswa_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('status_kehadiran', ['hadir', 'izin', 'sakit', 'alpa'])
                ->default('alpa');

            $table->timestamp('waktu_presensi')->nullable();
            $table->string('keterangan')->nullable();

            $table->timestamps();

            // Mencegah duplikasi absensi mahasiswa dalam 1 pertemuan
            $table->unique(['pertemuan_absensi_id', 'mahasiswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_absensi');
    }
};