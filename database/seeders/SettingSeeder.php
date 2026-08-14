<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'telegram_bot_token'],
            ['value' => '']
        );

        Setting::updateOrCreate(
            ['key' => 'telegram_chat_id'],
            ['value' => '']
        );
    }
}