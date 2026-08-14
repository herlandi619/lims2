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
        Schema::create('maintenance_alat', function (Blueprint $table) {
            $table->id();

            $table->foreignId('alat_id')
                ->constrained('alat')
                ->cascadeOnDelete();

            $table->date('tanggal_maintenance');

            $table->enum('jenis', [
                'preventif',
                'korektif',
                'darurat'
            ]);

            $table->string('teknisi')->nullable();

            $table->decimal('biaya', 12, 2)
                ->default(0);

            $table->enum('status', [
                'proses',
                'selesai'
            ])->default('proses');

            $table->text('keterangan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_alats');
    }
};
