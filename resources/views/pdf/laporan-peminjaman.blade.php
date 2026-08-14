<!DOCTYPE html>
<html>
<head>
    <title>Laporan Rekapitulasi Peminjaman</title>
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
        <h2>LAPORAN REKAPITULASI PEMINJAMAN ALAT</h2>
        <p>Tanggal Cetak: {{ date('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Peminjam</th>
                <th>Keperluan</th>
                <th>Tgl Pinjam</th>
                <th>Rencana Kembali</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->kode_peminjaman }}</td>
                <td>{{ $item->user->name ?? '-' }}</td>
                <td>{{ $item->keperluan ?? '-' }}</td>
                <td>{{ $item->tanggal_pinjam }}</td>
                <td>{{ $item->tanggal_rencana_kembali }}</td>
                <td>{{ $item->tanggal_kembali ?? '-' }}</td>
                <td class="status">{{ $item->status }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center;">Tidak ada data peminjaman.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>