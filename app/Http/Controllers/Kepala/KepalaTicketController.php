<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KepalaTicketController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $prioritas = $request->input('prioritas');
        $status = $request->input('status');

        // Ringkasan Agregat untuk Dashboard Monitoring Kepala Laboran
        $stats = [
            'total_tiket' => Ticket::count(),
            'total_open' => Ticket::where('status', 'open')->count(),
            'total_in_progress' => Ticket::where('status', 'in_progress')->count(),
            'total_darurat' => Ticket::where('prioritas', 'darurat')->whereIn('status', ['open', 'in_progress'])->count(),
        ];

        // Query Tiket dengan Filter
        $tickets = Ticket::with(['pelapor', 'peminjaman', 'alat', 'ruangan', 'petugas'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_tiket', 'like', "%{$search}%")
                      ->orWhere('subjek', 'like', "%{$search}%")
                      ->orWhereHas('pelapor', function ($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($prioritas, function ($query, $prioritas) {
                $query->where('prioritas', $prioritas);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // Ambil daftar petugas (Laboran) untuk opsi Re-assign Eskalasi
        $laboranList = User::where('role', 'laboran')->select('id', 'name')->get();

        return Inertia::render('KepalaLaboran/Ticket/Index', [
            'stats' => $stats,
            'tickets' => $tickets,
            'laboranList' => $laboranList,
            'filters' => [
                'search' => $search,
                'prioritas' => $prioritas,
                'status' => $status,
            ],
        ]);
    }

    // public function escalate(Request $request, $id)
    // {
    //     $request->validate([
    //         'assigned_to' => 'required|exists:users,id',
    //         'catatan_eskalasi' => 'required|string',
    //     ]);

    //     $ticket = Ticket::findOrFail($id);

    //     $ticket->update([
    //         'assigned_to' => $request->assigned_to,
    //         'prioritas' => 'darurat', // Otomatis naikkan prioritas ke Darurat
    //         'status' => 'in_progress',
    //     ]);

    //     // Opsional: Kirim notifikasi Telegram Bot / Email di sini

    //     return redirect()->back()->with('success', "Tiket {$ticket->kode_tiket} berhasil di-eskalasi dan ditugaskan ulang.");
    // }

    public function escalate(Request $request, $id)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'catatan_eskalasi' => 'required|string',
        ]);

        $ticket = Ticket::findOrFail($id);

        $ticket->update([
            'assigned_to' => $request->assigned_to,
            'prioritas' => 'darurat', // Otomatis naikkan prioritas ke Darurat
            'status' => 'in_progress',
        ]);

        // Load relasi petugas ditunjuk (petugas/assignedTo) untuk mengambil nama
        $ticket->load('petugas'); // Sesuaikan nama relasi di Model Ticket jika 'assignedTo' atau 'petugas'

        // Susun Format Pesan Telegram (HTML)
        $namaPetugas = $ticket->petugas ? $ticket->petugas->name : 'Petugas';

        $text = "⚡ <b>ESKALASI TIKET DARURAT</b> ⚡\n\n";
        $text .= "<b>Kode Tiket:</b> {$ticket->kode_tiket}\n";
        $text .= "<b>Subjek:</b> {$ticket->subjek}\n";
        $text .= "<b>Petugas Ditunjuk:</b> {$namaPetugas}\n";
        $text .= "<b>Catatan Eskalasi:</b> {$request->catatan_eskalasi}\n\n";
        $text .= "<b>Status Prioritas:</b> DARURAT\n";
        $text .= "<i>Mohon petugas terkait segera menindaklanjuti tiket ini.</i>";

        // Kirim Notifikasi Telegram
        TelegramService::sendMessage($text);

        return redirect()->back()->with('success', "Tiket {$ticket->kode_tiket} berhasil di-eskalasi dan ditugaskan ulang.");
    }

    public function exportReport(Request $request)
    {
        // Rekapitulasi Data Laporan Tiket
        $tickets = Ticket::with(['pelapor', 'alat', 'ruangan', 'petugas'])->get();

        $fileName = 'Laporan_Rekap_Tiket_' . date('Y-m-d') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($tickets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Kode Tiket', 'Pelapor', 'Kategori', 'Subjek', 'Prioritas', 'Status', 'Alat Terkait', 'Ruangan', 'Petugas', 'Tanggal Buat']);

            foreach ($tickets as $t) {
                fputcsv($file, [
                    $t->kode_tiket,
                    $t->pelapor ? $t->pelapor->name : '-',
                    $t->kategori,
                    $t->subjek,
                    $t->prioritas,
                    $t->status,
                    $t->alat ? $t->alat->nama_alat : '-',
                    $t->ruangan ? $t->ruangan->nama_ruangan : '-',
                    $t->petugas ? $t->petugas->name : 'Unassigned',
                    $t->created_at->format('Y-m-d H:i')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}