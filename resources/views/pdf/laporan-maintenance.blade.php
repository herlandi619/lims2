<!DOCTYPE html>
<html>
<head>
    <title>Laporan Maintenance Alat</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table, th, td { border: 1px solid #999; }
        th { background-color: #f2f2f2; padding: 8px; text-align: left; }
        td { padding: 6px 8px; }
        .status { font-weight: bold; text-transform: uppercase; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN REKAPITULASI MAINTENANCE ALAT</h2>
        <p>Tanggal Cetak: {{ date('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th>Nama Alat</th>
                <th>Jenis Maintenance</th>
                <th>Tanggal Maintenance</th>
                <th>Teknisi / Pihak Ke-3</th>
                <th>Biaya</th>
                <th style="width: 12%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->alat->nama_alat ?? '-' }}</td>
                <td>{{ strtoupper($item->jenis ?? '-') }}</td>
                <td>{{ $item->tanggal_maintenance }}</td>
                <td>{{ $item->teknisi ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($item->biaya ?? 0, 0, ',', '.') }}</td>
                <td class="status">{{ $item->status }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada data maintenance.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>