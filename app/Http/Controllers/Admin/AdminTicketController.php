<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTicketController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        // Query Tiket untuk Admin
        $tickets = Ticket::with(['pelapor', 'petugas'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_tiket', 'like', "%{$search}%")
                      ->orWhere('subjek', 'like', "%{$search}%")
                      ->orWhereHas('pelapor', function ($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($kategori, function ($query, $kategori) {
                $query->where('kategori', $kategori);
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // Ambil Pengaturan Telegram Bot dari Tabel Settings / Config
        $telegramConfig = [
            'bot_token' => Setting::where('key', 'telegram_bot_token')->value('value') ?? '',
            'chat_id' => Setting::where('key', 'telegram_chat_id')->value('value') ?? '',
        ];

        return Inertia::render('Admin/Ticket/Index', [
            'tickets' => $tickets,
            'telegramConfig' => $telegramConfig,
            'filters' => [
                'search' => $search,
                'kategori' => $kategori,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'subjek' => 'required|string|max:255',
            'kategori' => 'required|string',
            'prioritas' => 'required|in:rendah,sedang,tinggi,darurat',
            'status' => 'required|in:open,in_progress,resolved,closed',
            'catatan_penyelesaian' => 'nullable|string',
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'subjek' => $request->subjek,
            'kategori' => $request->kategori,
            'prioritas' => $request->prioritas,
            'status' => $request->status,
            'catatan_penyelesaian' => $request->catatan_penyelesaian,
        ]);

        return redirect()->back()->with('success', "Data tiket {$ticket->kode_tiket} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);
        $kode = $ticket->kode_tiket;
        
        // Hapus tiket & relasi balasannya jika cascade tidak diatur di DB
        $ticket->balasan()->delete();
        $ticket->delete();

        return redirect()->back()->with('success', "Histori tiket {$kode} berhasil dihapus.");
    }

    public function updateTelegramConfig(Request $request)
    {
        $request->validate([
            'bot_token' => 'required|string',
            'chat_id' => 'required|string',
        ]);

        Setting::updateOrCreate(
            ['key' => 'telegram_bot_token'],
            ['value' => $request->bot_token]
        );

        Setting::updateOrCreate(
            ['key' => 'telegram_chat_id'],
            ['value' => $request->chat_id]
        );

        return redirect()->back()->with('success', 'Konfigurasi Telegram Bot berhasil disimpan.');
    }
}