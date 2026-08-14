<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1 Map = 14 Pertemuan/Lembar Pertemuan Absensi
        Schema::create('pertemuan_absensi', function (Blueprint $table) {
            $table->id();

            $table->foreignId('kelas_praktikum_id')
                ->constrained('kelas_praktikum')
                ->cascadeOnDelete();

            $table->tinyInteger('pertemuan_ke'); // 1 s/d 14
            $table->date('tanggal_praktik')->nullable();
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();

            $table->string('topik_materi')->nullable();
            $table->text('catatan_dosen')->nullable();

            $table->enum('status_pertemuan', ['terjadwal', 'berlangsung', 'selesai'])
                ->default('terjadwal');

            $table->string('qr_token')->nullable()->unique(); // Untuk scan QR absensi mandiri
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertemuan_absensi');
    }
};