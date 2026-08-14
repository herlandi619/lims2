<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tiket')->unique(); // Contoh: TCK-20260813-001

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete(); // Pelapor (Mahasiswa/Dosen)

            // Relasi opsional jika kendala terkait dengan peminjaman / alat tertentu
            $table->foreignId('peminjaman_id')
                ->nullable()
                ->constrained('peminjaman')
                ->nullOnDelete();

            $table->foreignId('alat_id')
                ->nullable()
                ->constrained('alat')
                ->nullOnDelete();

            $table->foreignId('ruangan_id')
                ->nullable()
                ->constrained('ruangan')
                ->nullOnDelete();

            $table->enum('kategori', [
                'kerusakan_alat',
                'kendala_ruangan',
                'sistem_error',
                'layanan',
                'lainnya'
            ])->default('lainnya');

            $table->string('subjek');
            $table->text('deskripsi');
            $table->string('lampiran_foto')->nullable(); // Foto bukti kerusakan/kendala

            $table->enum('prioritas', ['rendah', 'sedang', 'tinggi', 'darurat'])
                ->default('sedang');

            $table->enum('status', [
                'open',         // Baru dibuat
                'in_progress',  // Sedang ditangani laboran/admin
                'resolved',     // Selesai ditangani
                'closed'        // Ditutup
            ])->default('open');

            // Ditangani oleh siapa (Laboran/Admin)
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('catatan_penyelesaian')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};