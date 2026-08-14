<!DOCTYPE html>
<html>
<head>
    <title>Laporan Booking Ruangan</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table, th, td { border: 1px solid #999; }
        th { background-color: #f2f2f2; padding: 8px; text-align: left; }
        td { padding: 6px 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN REKAPITULASI BOOKING RUANGAN</h2>
        <p>Tanggal Cetak: {{ date('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Ruangan</th>
                <th>Pemohon</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Keperluan</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->ruangan->nama_ruangan ?? '-' }}</td>
                <td>{{ $item->user->name ?? '-' }}</td>
                <td>{{ $item->tanggal }}</td>
                <td>{{ $item->jam_mulai }} - {{ $item->jam_selesai }}</td>
                <td>{{ $item->keperluan ?? '-' }}</td>
                <td>{{ strtoupper($item->status) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada data booking ruangan.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>