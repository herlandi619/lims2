<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peminjaman', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('kode_peminjaman')->unique();
            $table->date('tanggal_pinjam');
            $table->date('tanggal_rencana_kembali');

            $table->date('tanggal_kembali')->nullable();

            $table->enum('status', [
                'menunggu',
                'disetujui',
                'dipinjam',
                'dikembalikan',
                'ditolak'
            ])->default('menunggu');

            $table->text('keperluan')->nullable();
            $table->text('catatan_laboran')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjamen');
    }
};
