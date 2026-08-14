<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $waktu = now()->translatedFormat('l, d F Y - H:i') . ' WIB';

        return (new MailMessage)
                    ->subject('Notifikasi Keamanan Login - LIMS')
                    ->greeting('Halo ' . $notifiable->name . '!')
                    ->line('Akun Anda baru saja login ke Sistem Inventaris Laboratorium (LIMS).')
                    ->line('Waktu Akses: ' . $waktu)
                    ->line('Jika ini bukan Anda, segera ubah kata sandi Anda atau hubungi Administrator.')
                    ->action('Buka Dashboard', url('/'))
                    ->salutation('Salam, Tim Pengelola Laboratorium');
    }
}