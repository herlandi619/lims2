<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\TagihanPenyewaan;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class LaboranTagihanPenelitianController extends Controller
{
    public function rekap()
    {
        // Alihkan kembali ke Index Gabungan di Controller Penyewaan
        return redirect()->route('laboran.penyewaan.index');
    }

    public function exportPdf()
    {
        $tagihan = TagihanPenyewaan::with(['penyewaan.surat', 'mahasiswa'])
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('pdf.rekap-tagihan-penelitian', compact('tagihan'))
                  ->setPaper('a4', 'landscape');
                  
        return $pdf->download('Rekap-Seluruh-Tagihan-Penelitian.pdf');
    }
}