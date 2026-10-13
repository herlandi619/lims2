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
        Schema::create('penyewaan_penelitian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_penelitian_id')->constrained('surat_penelitian')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('users')->cascadeOnDelete();
            
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            
            // Status alur penyewaan
            $table->enum('status', [
                'menunggu_laboran', 
                'disetujui', 
                'ditolak', 
                'selesai'
            ])->default('menunggu_laboran');
            
            $table->text('catatan_laboran')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penyewaan_penelitians');
    }
};
