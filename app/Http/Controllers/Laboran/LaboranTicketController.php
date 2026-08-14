<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceAlat;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;

class LaboranTicketController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Laboran membaca SELURUH tiket masuk
        $tickets = Ticket::with(['pelapor', 'peminjaman', 'alat', 'ruangan', 'balasan.user', 'petugas'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_tiket', 'like', "%{$search}%")
                      ->orWhere('subjek', 'like', "%{$search}%")
                      ->orWhere('kategori', 'like', "%{$search}%")
                      ->orWhereHas('pelapor', function ($u) use ($search) {
                          $u->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Laboran/Ticket/Index', [
            'tickets' => $tickets,
            'filters' => ['search' => $search],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'catatan_penyelesaian' => 'nullable|string',
        ]);

        $ticket = Ticket::findOrFail($id);

        $updateData = [
            'status' => $request->status,
            'catatan_penyelesaian' => $request->catatan_penyelesaian,
        ];

        // Otomatis assign ke laboran yang sedang login jika belum ada petugasnya
        if (!$ticket->assigned_to) {
            $updateData['assigned_to'] = Auth::id();
        }

        $ticket->update($updateData);

        return redirect()->back()->with('success', "Status tiket {$ticket->kode_tiket} berhasil diperbarui.");
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'pesan' => 'required|string',
            'lampiran' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $ticket = Ticket::findOrFail($id);

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

        // Jika status tiket masih 'open', otomatis ubah ke 'in_progress' dan assign ke laboran ini
        if ($ticket->status === 'open') {
            $ticket->update([
                'status' => 'in_progress',
                'assigned_to' => Auth::id(),
            ]);
        }

        return redirect()->back()->with('success', 'Balasan berhasil dikirim ke pelapor.');
    }

    public function createMaintenance(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);

        if (!$ticket->alat_id) {
            return redirect()->back()->with('error', 'Tiket ini tidak terhubung dengan alat inventaris.');
        }

        $request->validate([
            'jenis' => 'required|in:preventif,korektif,darurat',
            'tanggal_maintenance' => 'required|date',
            'teknisi' => 'nullable|string|max:255',
            'biaya' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        // Buat data maintenance alat
        MaintenanceAlat::create([
            'alat_id' => $ticket->alat_id,
            'tanggal_maintenance' => $request->tanggal_maintenance,
            'jenis' => $request->jenis,
            'teknisi' => $request->teknisi,
            'biaya' => $request->biaya,
            'status' => 'proses',
            'keterangan' => "Pemicu dari Tiket [{$ticket->kode_tiket}]: " . $request->keterangan,
        ]);

        // Update status tiket menjadi in_progress & assign laboran
        $ticket->update([
            'status' => 'in_progress',
            'assigned_to' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Tindakan Maintenance berhasil ditambahkan untuk alat terkait.");
    }
}