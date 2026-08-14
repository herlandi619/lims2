<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan_denda', function (Blueprint $table) {
            $table->id();
            $table->decimal('denda_per_hari', 12, 2)->default(5000); // Rp 5.000 / hari keterlambatan
            $table->decimal('denda_rusak_ringan', 12, 2)->default(25000);
            $table->decimal('denda_rusak_berat', 12, 2)->default(50000);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_denda');
    }
};