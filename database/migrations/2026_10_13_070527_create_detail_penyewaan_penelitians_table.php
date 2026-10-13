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
        Schema::create('detail_penyewaan_penelitian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penyewaan_penelitian_id')->constrained('penyewaan_penelitian')->cascadeOnDelete();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->integer('jumlah')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_penyewaan_penelitians');
    }
};
