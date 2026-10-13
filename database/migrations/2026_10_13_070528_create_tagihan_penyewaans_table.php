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
        Schema::create('tagihan_penyewaan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_nota')->unique(); // Contoh: INV-RES-001
            $table->foreignId('penyewaan_penelitian_id')->constrained('penyewaan_penelitian')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('users')->cascadeOnDelete();
            
            // Laboran menentukan total biaya berdasarkan alat yang disewa
            $table->decimal('total_tagihan', 12, 2)->default(0); 
            
            // Alur tagihan: Draft Laboran -> Admin Rilis -> Mahasiswa Bayar
            $table->enum('status_tagihan', [
                'draft_laboran',        // Laboran membuat tagihan, dikirim ke admin
                'menunggu_pembayaran',  // Admin meneruskan/merilis ke mahasiswa
                'lunas'
            ])->default('draft_laboran');
            
            $table->string('bukti_pembayaran')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan_penyewaans');
    }
};
