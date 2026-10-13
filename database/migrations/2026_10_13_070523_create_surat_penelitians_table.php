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
        Schema::create('surat_penelitian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('users')->cascadeOnDelete();
            $table->string('judul_penelitian');
            $table->string('file_form_a'); // Form A
            $table->string('file_form_b'); // Form B
            $table->string('file_form_c'); // Form C
            
            // Status alur surat
            $table->enum('status', [
                'menunggu_admin', 
                'diteruskan_laboran', 
                'ditolak'
            ])->default('menunggu_admin');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_penelitians');
    }
};
