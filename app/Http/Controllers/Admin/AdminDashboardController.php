<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Alat;
use App\Models\BookingRuangan;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Total Statistik System
        $stats = [
            'total_users' => User::count(),
            'total_alat' => Alat::count(),
            'peminjaman_pending' => Peminjaman::where('status', 'menunggu')->count(),
            'booking_pending' => BookingRuangan::where('status', 'menunggu')->count(),
        ];

        // Audit Activity Logs dengan Search & Pagination 5
        $logs = ActivityLog::with('user')
            ->when($search, function ($query, $search) {
                $query->where('aktivitas', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'logs' => $logs,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}