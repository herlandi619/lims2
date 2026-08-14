<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;


class AdminBackupController extends Controller
{
    private string $backupPath = 'backups';

    public function index(Request $request)
    {
        if (!Storage::exists($this->backupPath)) {
            Storage::makeDirectory($this->backupPath);
        }

        $files = Storage::files($this->backupPath);
        $backups = [];

        foreach ($files as $file) {
            $ext = pathinfo($file, PATHINFO_EXTENSION);
            if (in_array($ext, ['sqlite', 'db', 'sql'])) {
                $fileName = pathinfo($file, PATHINFO_BASENAME);
                $backups[] = [
                    'file_name' => $fileName,
                    'size' => $this->formatBytes(Storage::size($file)),
                    'raw_size' => Storage::size($file),
                    'created_at' => date('Y-m-d H:i:s', Storage::lastModified($file)),
                ];
            }
        }

        // Urutkan dari yang terbaru
        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        // Search Filter
        $search = $request->get('search', '');
        if ($search) {
            $backups = array_filter($backups, function ($item) use ($search) {
                return stripos($item['file_name'], $search) !== false;
            });
        }

        // Pagination 5 Data
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 5;
        $currentItems = array_slice($backups, ($currentPage - 1) * $perPage, $perPage);

        $paginatedBackups = new LengthAwarePaginator(
            $currentItems,
            count($backups),
            $perPage,
            $currentPage,
            ['path' => LengthAwarePaginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $paginatedBackups,
            'filters' => ['search' => $search],
        ]);
    }

    public function createBackup(Request $request)
    {
        $sqlitePath = database_path('database.sqlite');

        if (!File::exists($sqlitePath)) {
            return redirect()->back()->with('error', 'File database.sqlite tidak ditemukan!');
        }

        $fileName = 'backup_' . date('Y-m-d_H-i-s') . '.sqlite';
        $destinationPath = storage_path("app/{$this->backupPath}/{$fileName}");

        if (!file_exists(storage_path("app/{$this->backupPath}"))) {
            mkdir(storage_path("app/{$this->backupPath}"), 0755, true);
        }

        // Copy file database.sqlite ke folder backup server
        if (File::copy($sqlitePath, $destinationPath)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'aktivitas' => "Membuat backup database SQLite: {$fileName}",
                'ip_address' => $request->ip(),
                'browser' => $request->header('User-Agent'),
            ]);

            // LANGSUNG DOWNLOAD FILE KE COMPUTER USER
            return response()->download($destinationPath, $fileName);
        }

        return redirect()->back()->with('error', 'Gagal menyalin file database!');
    }




    public function restoreBackup(Request $request)
    {
        $request->validate([
            'file_name' => 'nullable|string',
            'backup_file' => 'nullable|file',
        ]);

        $targetPath = database_path('database.sqlite');
        $sourcePath = null;
        $logTarget = '';

        if ($request->hasFile('backup_file')) {
            $uploadedFile = $request->file('backup_file');
            $sourcePath = $uploadedFile->getRealPath();
            $logTarget = "file unggahan: " . $uploadedFile->getClientOriginalName();
        } elseif ($request->filled('file_name')) {
            $sourcePath = storage_path("app/{$this->backupPath}/" . $request->file_name);
            $logTarget = $request->file_name;
        }

        if (!$sourcePath || !File::exists($sourcePath)) {
            return redirect()->back()->with('error', 'File backup tidak ditemukan!');
        }

        // Timpa database.sqlite dengan file backup
        if (File::copy($sourcePath, $targetPath)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'aktivitas' => "Melakukan restore database SQLite dari {$logTarget}",
                'ip_address' => $request->ip(),
                'browser' => $request->header('User-Agent'),
            ]);

            return redirect()->back()->with('success', 'Database SQLite berhasil di-restore!');
        }

        return redirect()->back()->with('error', 'Gagal melakukan restore database!');
    }

    public function downloadBackup(string $fileName)
    {
        $filePath = "{$this->backupPath}/{$fileName}";

        if (!Storage::exists($filePath)) {
            abort(404, 'File backup tidak ditemukan.');
        }

        return Storage::download($filePath);
    }



    public function destroyBackup(Request $request, string $fileName)
    {
        $filePath = "{$this->backupPath}/{$fileName}";

        if (Storage::exists($filePath)) {
            Storage::delete($filePath);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'aktivitas' => "Menghapus file backup SQLite: {$fileName}",
                'ip_address' => $request->ip(),
                'browser' => $request->header('User-Agent'),
            ]);
        }

        return redirect()->back()->with('success', 'File backup berhasil dihapus!');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}