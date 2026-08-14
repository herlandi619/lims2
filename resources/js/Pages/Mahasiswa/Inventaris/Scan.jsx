import React, { useEffect, useState, useRef } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { router, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';

export default function Scan() {
    const [qrInput, setQrInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef(null);

    // Fungsi saat QR Code berhasil dibaca oleh kamera
    const onScanSuccess = (decodedText) => {
        // Stop kamera terlebih dahulu agar tidak terus membaca
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
                setIsScanning(false);
                
                // Tampilkan notifikasi sukses singkat sebelum redirect
                Swal.fire({
                    title: 'QR Code Terdeteksi!',
                    text: `Kode: ${decodedText}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    // Redirect ke halaman detail alat berdasarkan ID / Kode QR
                    router.get(route('mahasiswa.inventaris.show', decodedText));
                });
            });
        }
    };

    // Fungsi Mulai Scan Kamera
    const startScanner = async () => {
        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            };

            // Menggunakan kamera belakang (facingMode: environment) secara default
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                (errorMessage) => {
                    // Callback error frame (opsional dikosongkan agar tidak merusak console)
                }
            );

            setIsScanning(true);
        } catch (err) {
            Swal.fire({
                title: 'Akses Kamera Gagal',
                text: 'Pastikan Anda telah memberikan izin akses kamera pada browser.',
                icon: 'error',
            });
        }
    };

    // Fungsi Hentikan Scan Kamera
    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
            setIsScanning(false);
        }
    };

    // Jalankan scanner otomatis saat halaman dimuat
    useEffect(() => {
        startScanner();

        // Cleanup saat berpindah halaman
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    // Form Submit Manual
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!qrInput.trim()) {
            Swal.fire({
                title: 'Peringatan',
                text: 'Masukkan kode QR terlebih dahulu!',
                icon: 'warning',
            });
            return;
        }

        stopScanner();
        router.get(route('mahasiswa.inventaris.show', qrInput));
    };

    return (
        <MahasiswaLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Scan QR Code Alat</h2>}>
            <div className="py-6 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Arahkan Kamera ke QR Code Alat</h3>
                    <p className="text-sm text-gray-600 mb-6">Sistem akan secara otomatis membaca QR Code dan mengarahkan ke Detail Alat.</p>

                    {/* Container Kamera Scanner */}
                    <div className="max-w-md mx-auto mb-6">
                        <div 
                            id="reader" 
                            className="w-full rounded-lg overflow-hidden border-2 border-indigo-500 shadow-inner bg-black min-h-[280px]"
                        ></div>
                    </div>

                    {/* Tombol Kontrol Kamera */}
                    <div className="mb-6 flex justify-center gap-3">
                        {!isScanning ? (
                            <button
                                onClick={startScanner}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-medium"
                            >
                                📷 Aktifkan Kamera
                            </button>
                        ) : (
                            <button
                                onClick={stopScanner}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-medium"
                            >
                                ⏹️ Matikan Kamera
                            </button>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <p className="text-xs text-gray-500 mb-3">
                            Kendala kamera? Masukkan <strong>Kode QR / Kode Alat</strong> secara manual:
                        </p>

                        <form onSubmit={handleManualSubmit} className="max-w-md mx-auto flex gap-2">
                            <input
                                type="text"
                                placeholder="Contoh: QR-ALT-001"
                                className="w-full border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={qrInput}
                                onChange={(e) => setQrInput(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                            >
                                Cari Alat
                            </button>
                        </form>
                    </div>

                </div>
                
            </div>

            {/* Tombol Kembali Ke Daftar Inventaris */}
                    <div className="mb-4">
                        <Link
                            href={route('mahasiswa.inventaris.index')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 transition"
                        >
                            ← Kembali ke Inventaris
                        </Link>
                    </div>
        </MahasiswaLayout>
    );
}