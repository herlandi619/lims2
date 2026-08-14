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
        Schema::create('kalibrasi_alat', function (Blueprint $table) {
            $table->id();

            $table->foreignId('alat_id')
                ->constrained('alat')
                ->cascadeOnDelete();

            $table->date('tanggal_kalibrasi');
            $table->date('kalibrasi_berikutnya');

            $table->enum('hasil', [
                'lulus',
                'tidak_lulus'
            ]);

            $table->string('sertifikat')->nullable();
            $table->text('keterangan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kalibrasi_alats');
    }
};
