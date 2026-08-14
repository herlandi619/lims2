<!DOCTYPE html>
<html>
<head>
    <title>Laporan Kalibrasi Alat</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table, th, td { border: 1px solid #999; }
        th { background-color: #f2f2f2; padding: 8px; text-align: left; }
        td { padding: 6px 8px; }
        .status { font-weight: bold; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN REKAPITULASI KALIBRASI ALAT</h2>
        <p>Tanggal Cetak: {{ date('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th>Nama Alat</th>
                <th>Tanggal Kalibrasi</th>
                <th>Kalibrasi Berikutnya</th>
                <th>Hasil / Kelayakan</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->alat->nama_alat ?? '-' }}</td>
                <td>{{ $item->tanggal_kalibrasi }}</td>
                <td>{{ $item->kalibrasi_berikutnya ?? '-' }}</td>
                <td class="status">{{ $item->hasil ?? '-' }}</td>
                <td>{{ $item->keterangan ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center;">Tidak ada data kalibrasi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>