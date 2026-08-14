<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\Ruangan;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\TelegramService;

class MahasiswaTicketController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $search = $request->input('search');

        // Query Tiket Milik Mahasiswa
        $tickets = Ticket::with(['peminjaman', 'alat', 'ruangan', 'balasan.user', 'petugas'])
            ->where('user_id', $userId)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_tiket', 'like', "%{$search}%")
                      ->orWhere('subjek', 'like', "%{$search}%")
                      ->orWhere('kategori', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // Data pendukung untuk Dropdown Form
        $peminjamanList = Peminjaman::where('user_id', $userId)->get();
        $alatList = Alat::select('id', 'nama_alat', 'kode_alat')->get();
        $ruanganList = Ruangan::select('id', 'nama_ruangan', 'kode_ruangan')->get();

        return Inertia::render('Mahasiswa/Ticket/Index', [
            'tickets' => $tickets,
            'peminjamanList' => $peminjamanList,
            'alatList' => $alatList,
            'ruanganList' => $ruanganList,
            'filters' => ['search' => $search],
        ]);
    }

    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'kategori' => 'required|in:kerusakan_alat,kendala_ruangan,sistem_error,layanan,lainnya',
    //         'subjek' => 'required|string|max:255',
    //         'deskripsi' => 'required|string',
    //         'prioritas' => 'required|in:rendah,sedang,tinggi,darurat',
    //         'peminjaman_id' => 'nullable|exists:peminjaman,id',
    //         'alat_id' => 'nullable|exists:alat,id',
    //         'ruangan_id' => 'nullable|exists:ruangan,id',
    //         'lampiran_foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    //     ]);

    //     $fotoPath = null;
    //     if ($request->hasFile('lampiran_foto')) {
    //         $fotoPath = $request->file('lampiran_foto')->store('tickets', 'public');
    //     }

    //     $kodeTiket = 'TCK-' . date('Ymd') . '-' . str_pad(Ticket::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

    //     $ticket = Ticket::create([
    //         'kode_tiket' => $kodeTiket,
    //         'user_id' => Auth::id(),
    //         'peminjaman_id' => $request->peminjaman_id,
    //         'alat_id' => $request->alat_id,
    //         'ruangan_id' => $request->ruangan_id,
    //         'kategori' => $request->kategori,
    //         'subjek' => $request->subjek,
    //         'deskripsi' => $request->deskripsi,
    //         'prioritas' => $request->prioritas,
    //         'lampiran_foto' => $fotoPath,
    //         'status' => 'open',
    //     ]);

    //     // Kirim Notifikasi Telegram
    //     // $this->sendTelegramNotification($ticket);
    //     // ... Logika validasi dan simpan tiket
    //     $ticket = Ticket::create([...]);

    //     // Susun Format Pesan Telegram (HTML)
    //     $text = "🚨 <b>TIKET KENDALA BARU</b> 🚨\n\n";
    //     $text .= "<b>Kode:</b> {$ticket->kode_tiket}\n";
    //     $text .= "<b>Pelapor:</b> " . auth()->user()->name . "\n";
    //     $text .= "<b>Kategori:</b> {$ticket->kategori}\n";
    //     $text .= "<b>Prioritas:</b> " . strtoupper($ticket->prioritas) . "\n";
    //     $text .= "<b>Subjek:</b> {$ticket->subjek}\n";
    //     $text .= "<b>Deskripsi:</b> {$ticket->deskripsi}\n\n";
    //     $text .= "<i>Mohon Petugas Laboran segera menindaklanjuti.</i>";

    //     // Kirim pesan ke Telegram
    //     TelegramService::sendMessage($text);

        
    //     return redirect()->back()->with('success', 'Tiket laporan berhasil dibuat dan diteruskan ke petugas!');
    // }

    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|in:kerusakan_alat,kendala_ruangan,sistem_error,layanan,lainnya',
            'subjek' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'prioritas' => 'required|in:rendah,sedang,tinggi,darurat',
            'peminjaman_id' => 'nullable|exists:peminjaman,id',
            'alat_id' => 'nullable|exists:alat,id',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'lampiran_foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('lampiran_foto')) {
            $fotoPath = $request->file('lampiran_foto')->store('tickets', 'public');
        }

        $kodeTiket = 'TCK-' . date('Ymd') . '-' . str_pad(Ticket::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        // 1. Simpan Data Tiket ke Database
        $ticket = Ticket::create([
            'kode_tiket' => $kodeTiket,
            'user_id' => Auth::id(),
            'peminjaman_id' => $request->peminjaman_id,
            'alat_id' => $request->alat_id,
            'ruangan_id' => $request->ruangan_id,
            'kategori' => $request->kategori,
            'subjek' => $request->subjek,
            'deskripsi' => $request->deskripsi,
            'prioritas' => $request->prioritas,
            'lampiran_foto' => $fotoPath,
            'status' => 'open',
        ]);

        // 2. Susun Format Pesan Telegram (HTML)
        $text = "🚨 <b>TIKET KENDALA BARU</b> 🚨\n\n";
        $text .= "<b>Kode:</b> {$ticket->kode_tiket}\n";
        $text .= "<b>Pelapor:</b> " . Auth::user()->name . "\n";
        $text .= "<b>Kategori:</b> {$ticket->kategori}\n";
        $text .= "<b>Prioritas:</b> " . strtoupper($ticket->prioritas) . "\n";
        $text .= "<b>Subjek:</b> {$ticket->subjek}\n";
        $text .= "<b>Deskripsi:</b> {$ticket->deskripsi}\n\n";
        $text .= "<i>Mohon Petugas Laboran segera menindaklanjuti.</i>";

        // 3. Kirim Pesan ke Telegram
        TelegramService::sendMessage($text);

        return redirect()->back()->with('success', 'Tiket laporan berhasil dibuat dan diteruskan ke petugas!');
    }


    public function reply(Request $request, $id)
    {
        $request->validate([
            'pesan' => 'required|string',
            'lampiran' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $ticket = Ticket::where('user_id', Auth::id())->findOrFail($id);

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('ticket_replies', 'public');
        }

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'pesan' => $request->pesan,
            'lampiran' => $lampiranPath,
        ]);

        return redirect()->back()->with('success', 'Balasan berhasil dikirim.');
    }

    public function close($id)
    {
        $ticket = Ticket::where('user_id', Auth::id())->findOrFail($id);
        $ticket->update(['status' => 'closed']);

        return redirect()->back()->with('success', 'Tiket telah ditutup.');
    }

    private function sendTelegramNotification(Ticket $ticket)
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {
            return;
        }

        $user = Auth::user();
        $message = "🚨 *LAPORAN KENDALA BARU* 🚨\n\n"
            . "📌 *Kode:* `{$ticket->kode_tiket}`\n"
            . "👤 *Pelapor:* {$user->name} (Mahasiswa)\n"
            . "🏷 *Kategori:* " . strtoupper(str_replace('_', ' ', $ticket->kategori)) . "\n"
            . "⚡ *Prioritas:* " . strtoupper($ticket->prioritas) . "\n"
            . "📝 *Subjek:* {$ticket->subjek}\n"
            . "💬 *Deskripsi:* {$ticket->deskripsi}\n\n"
            . "Mohon petugas/laboran segera memproses laporan ini.";

        try {
            Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Exception $e) {
            // Silently fail agar tidak mengganggu response pengguna
        }
    }
}