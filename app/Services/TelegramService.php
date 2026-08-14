<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    public static function sendMessage(string $message): bool
    {
        $token = Setting::where('key', 'telegram_bot_token')->value('value');
        $chatId = Setting::where('key', 'telegram_chat_id')->value('value');

        if (empty($token) || empty($chatId)) {
            Log::warning('Telegram Error: Token atau Chat ID belum terisi.');
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";

            // Tambahkan timeout 30 detik & retry 3 kali dengan jeda 100ms
            $response = Http::timeout(30)
                ->retry(3, 100)
                ->post($url, [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]);

            if (!$response->successful()) {
                Log::error('Telegram API Response Error: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Telegram Exception Error: ' . $e->getMessage());
            return false;
        }
    }
}