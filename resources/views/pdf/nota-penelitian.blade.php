<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota Tagihan Penelitian - {{ $tagihan->nomor_nota }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>NOTA PENYEWAAN ALAT LABORATORIUM</h2>
        <p>No. Invoice: <strong>{{ $tagihan->nomor_nota }}</strong></p>
    </div>

    <p><strong>Nama Mahasiswa:</strong> {{ $tagihan->mahasiswa->name }}</p>
    <p><strong>Judul Penelitian:</strong> {{ $tagihan->penyewaan->surat->judul_penelitian }}</p>
    <p><strong>Periode Sewa:</strong> {{ $tagihan->penyewaan->tanggal_mulai }} s/d {{ $tagihan->penyewaan->tanggal_selesai }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kode Alat</th>
                <th>Nama Alat</th>
                <th>Jumlah Sewa</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tagihan->penyewaan->details as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->alat->kode_alat }}</td>
                <td>{{ $item->alat->nama_alat }}</td>
                <td>{{ $item->jumlah }} Unit</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h3 class="text-right">Total Tagihan: Rp {{ number_format($tagihan->total_tagihan, 0, ',', '.') }}</h3>

    <p style="margin-top: 50px;">Status Tagihan: 
        <strong>{{ strtoupper(str_replace('_', ' ', $tagihan->status_tagihan)) }}</strong>
    </p>
</body>
</html>