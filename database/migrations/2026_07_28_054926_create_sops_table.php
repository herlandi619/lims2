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
        Schema::create('sops', function (Blueprint $table) {
            $table->id();
            $table->string('kode_sop')->unique();
            $table->string('judul_sop');
            $table->enum('kategori', [
                'penggunaan_alat',
                'keselamatan_kerja',
                'penggunaan_ruangan',
                'peminjaman_alat',
                'lainnya'
            ])->default('penggunaan_alat');
            $table->string('versi')->default('1.0');
            $table->string('file_sop'); // Path file PDF/Dokumen
            $table->text('deskripsi')->nullable();
            
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sops');
    }
};
