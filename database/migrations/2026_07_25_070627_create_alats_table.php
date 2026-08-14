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
        Schema::create('alat', function (Blueprint $table) {
            $table->id();

            $table->foreignId('kategori_id')
                ->constrained('kategori_alat')
                ->cascadeOnDelete();

            $table->foreignId('supplier_id')
                ->nullable()
                ->constrained('supplier')
                ->nullOnDelete();

            $table->foreignId('lokasi_id')
                ->constrained('lokasi_alat')
                ->cascadeOnDelete();

            $table->string('kode_alat')->unique();
            $table->string('qr_code')->unique();

            $table->string('nama_alat');
            $table->string('merk')->nullable();
            $table->text('spesifikasi')->nullable();

            $table->integer('jumlah_stok')->default(1);
            $table->integer('stok_tersedia')->default(1);

            $table->enum('kondisi', ['baik', 'cukup', 'rusak'])
                ->default('baik');

            $table->enum('status', [
                'tersedia',
                'dipinjam',
                'maintenance',
                'rusak',
                'hilang'
            ])->default('tersedia');

            $table->date('tanggal_pembelian')->nullable();
            $table->string('foto')->nullable();
            $table->text('keterangan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alats');
    }
};
