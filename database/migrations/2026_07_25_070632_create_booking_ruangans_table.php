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
        Schema::create('booking_ruangan', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('ruangan_id')
                ->constrained('ruangan')
                ->cascadeOnDelete();

            $table->date('tanggal');

            $table->time('jam_mulai');
            $table->time('jam_selesai');

            $table->string('keperluan')->nullable();

            $table->enum('status', [
                'menunggu',
                'disetujui',
                'ditolak',
                'selesai'
            ])->default('menunggu');

            $table->text('catatan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_ruangans');
    }
};
