<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Tagihan Penyewaan Penelitian</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h2, h3 { text-align: center; margin-bottom: 5px; }
        .date { text-align: right; margin-bottom: 20px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; text-align: center; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .lunas { color: green; font-weight: bold; }
        .pending { color: orange; font-weight: bold; }
    </style>
</head>
<body>
    <h2>Laporan Rekapitulasi Pembayaran Alat Penelitian</h2>
    <h3>Laboratorium Sistem Informasi</h3>
    
    <div class="date">Dicetak pada: {{ date('d-m-Y H:i:s') }}</div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>No. Nota</th>
                <th>Nama Mahasiswa</th>
                <th>Judul Penelitian</th>
                <th>Tanggal Sewa</th>
                <th>Status Pembayaran</th>
                <th>Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalSemua = 0; @endphp
            @foreach($tagihan as $index => $item)
            @php 
                if($item->status_tagihan === 'lunas') {
                    $totalSemua += $item->total_tagihan; 
                }
            @endphp
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->nomor_nota }}</td>
                <td>{{ $item->mahasiswa->name }}</td>
                <td>{{ $item->penyewaan->surat->judul_penelitian }}</td>
                <td class="text-center">{{ $item->penyewaan->tanggal_mulai }}</td>
                <td class="text-center">
                    @if($item->status_tagihan === 'lunas')
                        <span class="lunas">LUNAS</span>
                    @else
                        <span class="pending">{{ strtoupper(str_replace('_', ' ', $item->status_tagihan)) }}</span>
                    @endif
                </td>
                <td class="text-right">{{ number_format($item->total_tagihan, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <th colspan="6" class="text-right">Total Pemasukan (Status Lunas):</th>
                <th class="text-right">Rp {{ number_format($totalSemua, 0, ',', '.') }}</th>
            </tr>
        </tfoot>
    </table>
</body>
</html>