<?php

namespace App\Models;

use App\Models\DetailPeminjaman;
use App\Models\KalibrasiAlat;
use App\Models\KategoriAlat;
use App\Models\LokasiAlat;
use App\Models\MaintenanceAlat;
use App\Models\RiwayatAlat;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Model;

class Alat extends Model
{   
    protected $table = 'alat';
    protected $guarded = [];

    // relasi
    // 1. Relasi ke Kategori Alat
    public function kategori()
    {
        return $this->belongsTo(KategoriAlat::class, 'kategori_id');
    }

    // 2. Relasi ke Lokasi Alat
    public function lokasi()
    {
        return $this->belongsTo(LokasiAlat::class, 'lokasi_id');
    }

    // 3. Relasi ke Supplier
    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    // 4. Relasi ke Maintenance Alat (Yang Menyebabkan Error)
    public function maintenanceAlat()
    {
        return $this->hasMany(MaintenanceAlat::class, 'alat_id');
    }

    // 5. Relasi ke Kalibrasi Alat
    public function kalibrasiAlat()
    {
        return $this->hasMany(KalibrasiAlat::class, 'alat_id');
    }

    // 6. Relasi ke Riwayat Alat
    public function riwayatAlat()
    {
        return $this->hasMany(RiwayatAlat::class, 'alat_id');
    }

}
