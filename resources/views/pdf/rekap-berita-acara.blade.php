<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Berita Acara Praktikum</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2 style="text-align: center;">REKAPITULASI BERITA ACARA PRAKTIKUM</h2>
    <h4 style="text-align: center;">Semester: {{ $semester ?: 'Semua Semester' }}</h4>
    <hr>

    @foreach($kelas as $kls)
        @if($kls->pertemuan->count() > 0)
            <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; background: #e0f2fe; padding: 5px;">
                Kode: {{ $kls->kode_kelas }} | Praktikum: {{ $kls->nama_praktikum }} | Dosen: {{ $kls->dosen->name }}
            </div>
            <table>
                <thead>
                    <tr>
                        <th width="8%">Pert. Ke</th>
                        <th width="15%">Tanggal</th>
                        <th width="25%">Topik / Materi</th>
                        <th width="52%">Berita Acara Kegiatan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($kls->pertemuan as $ptm)
                    <tr>
                        <td align="center">{{ $ptm->pertemuan_ke }}</td>
                        <td>{{ $ptm->tanggal_praktik }}</td>
                        <td>{{ $ptm->topik_materi }}</td>
                        <td>{{ $ptm->berita_acara }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endforeach

</body>
</html>