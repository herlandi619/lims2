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
        // 1. Tambah field Denda di tabel peminjaman
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->decimal('total_denda', 12, 2)->default(0)->after('catatan_laboran');
            $table->enum('status_denda', ['tidak_ada', 'belum_dibayar', 'lunas'])
                ->default('tidak_ada')
                ->after('total_denda');
            $table->text('catatan_denda')->nullable()->after('status_denda');
        });

        // 2. Tambah field Rincian Denda Per Barang di detail_peminjaman
        Schema::table('detail_peminjaman', function (Blueprint $table) {
            $table->decimal('denda_keterlambatan', 12, 2)->default(0)->after('foto_pengembalian');
            $table->decimal('denda_kerusakan', 12, 2)->default(0)->after('denda_keterlambatan');
            $table->text('keterangan_denda')->nullable()->after('denda_kerusakan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropColumn(['total_denda', 'status_denda', 'catatan_denda']);
        });

        Schema::table('detail_peminjaman', function (Blueprint $table) {
            $table->dropColumn(['denda_keterlambatan', 'denda_kerusakan', 'keterangan_denda']);
        });
    }
};
