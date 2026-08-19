<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Absensi Praktikum</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; color: #333; }
        h2, p { margin: 0 0 5px 0; }
        .header { margin-bottom: 15px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #999; padding: 4px; text-align: center; }
        th { background-color: #f2f2f2; font-weight: bold; }
        td.text-left { text-align: left; }
        .badge { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>REKAPITULASI PRESENSI PRAKTIKUM LABORATORIUM FARMASI</h2>
        <p>{{ $kelas->nama_praktikum }} - {{ $kelas->kode_kelas }} {{ $kelas->nama_kelas }} (Semester {{ $kelas->semester }})</p>
        <p>Tahun Ajaran: {{ $kelas->tahun_ajaran }} | Dosen Pengampu: {{ $kelas->dosen->name ?? '-' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 30px;">No</th>
                <th rowspan="2" style="width: 70px;">NIM</th>
                <th rowspan="2" style="width: 150px;">Nama Mahasiswa</th>
                <th colspan="14">Pertemuan Ke-</th>
                <th rowspan="2" style="width: 40px;">H</th>
                <th rowspan="2" style="width: 40px;">I</th>
                <th rowspan="2" style="width: 40px;">S</th>
                <th rowspan="2" style="width: 40px;">A</th>
            </tr>
            <tr>
                @for ($i = 1; $i <= 14; $i++)
                    <th style="width: 22px;">{{ $i }}</th>
                @endfor
            </tr>
        </thead>
        <tbody>
            @foreach ($kelas->mahasiswa as $index => $mhs)
                @php
                    $h = 0; $iCount = 0; $s = 0; $a = 0;
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td style="font-family: monospace;">{{ $mhs->nim }}</td>
                    <td class="text-left">{{ $mhs->name }}</td>
                    
                    @foreach ($kelas->pertemuan as $pertemuan)
                        @php
                            // Cari detail absensi mahasiswa ini pada pertemuan tersebut
                            $detail = $pertemuan->detailAbsensi->where('mahasiswa_id', $mhs->id)->first();
                            $status = $detail ? $detail->status_kehadiran : 'alpa';
                            
                            // Hitung akumulasi
                            if ($status == 'hadir') { $h++; $char = 'H'; }
                            elseif ($status == 'izin') { $iCount++; $char = 'I'; }
                            elseif ($status == 'sakit') { $s++; $char = 'S'; }
                            else { $a++; $char = '-'; }
                        @endphp
                        <td>{{ $char }}</td>
                    @endforeach

                    <td><strong>{{ $h }}</strong></td>
                    <td><strong>{{ $iCount }}</strong></td>
                    <td><strong>{{ $s }}</strong></td>
                    <td><strong>{{ $a }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>
    
    <div style="margin-top: 15px; font-size: 9px;">
        <p>Keterangan: H = Hadir, I = Izin, S = Sakit, A/(-0) = Alpa</p>
    </div>
</body>
</html>