import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function MahasiswaLayout({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    // State Notifikasi Popover Dropdown
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Ambil data global langsung dari Inertia Shared Props
    const { auth, notifications = [], unreadNotificationCount = 0 } = usePage().props;
    const user = auth?.user;

    // Menutup dropdown saat klik di luar area lonceng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tandai 1 notifikasi sudah dibaca (via Inertia Router)
    const markAsRead = (id, sudahDibaca) => {
        if (sudahDibaca) return;
        
        router.patch(
            route('notifikasi.mark-as-read', id),
            {},
            {
                preserveScroll: true, // Mencegah halaman scroll ke atas saat update
            }
        );
    };

    // Tandai semua notifikasi sudah dibaca (via Inertia Router)
    const markAllAsRead = () => {
        if (unreadNotificationCount === 0) return;

        router.post(
            route('notifikasi.mark-all-read'),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const navigationLinks = [
        { name: 'Dashboard', route: 'mahasiswa.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Katalog & Inventaris', route: 'mahasiswa.inventaris.index', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { 
        name: 'Booking Ruangan', 
        route: 'mahasiswa.booking-ruangan.index', 
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
        },
        { name: 'Jadwal Lab', route: 'mahasiswa.jadwal-laboratorium.index', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Dokumen SOP & Arsip', route: 'mahasiswa.dokumen-sop.index', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { 
            name: 'Absensi Saya', 
            route: 'mahasiswa.absensi.index', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' 
        },
        { 
            name: 'Ticketing', 
            route: 'mahasiswa.tickets.index', 
            icon: 'M15 5v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5H4a2 2 0 00-2 2v3a2 2 0 011 1.732V12a2 2 0 01-1 1.732V17a2 2 0 002 2h16a2 2 0 002-2v-3.268A2 2 0 0121 12a2 2 0 01-1-1.732V7a2 2 0 00-2-2h-3z'
        },
        { name: 'Profil', route: 'mahasiswa.profil.index', icon: 'M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    ];
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white min-h-screen shadow-lg">
                <div className="p-5 border-b border-indigo-800 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl tracking-wider">LIMS LAB</h1>
                        <p className="text-xs text-indigo-300">Portal Mahasiswa</p>
                    </div>
                </div>

                <div className="p-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.name || 'Mahasiswa'}</p>
                        <p className="text-xs text-indigo-300">NIM: {user?.nim || '-'}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigationLinks.map((link, index) => {
                        const isActive = route().current(link.route);
                        return (
                            <Link
                                key={index}
                                href={route(link.route)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-indigo-700 text-white font-semibold'
                                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                </svg>
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Keluar (Logout)</span>
                    </Link>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header / Topbar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        
                        {/* Toggle Mobile */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <span className="ml-2 font-bold text-indigo-900">LIMS LAB</span>
                        </div>

                        <div className="hidden md:block">
                            {header}
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center space-x-4">
                            
                            {/* --- IKON LONCENG NOTIFIKASI --- */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative p-2 text-gray-600 hover:text-indigo-900 hover:bg-gray-100 rounded-full transition focus:outline-none"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    
                                    {/* Badge Merah Unread Count */}
                                    {unreadNotificationCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown Menu Notifikasi */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="font-bold text-gray-800 text-sm">Notifikasi</h4>
                                            {unreadNotificationCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => markAsRead(notif.id, notif.sudah_dibaca)}
                                                        className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start space-x-3 ${
                                                            !notif.sudah_dibaca ? 'bg-indigo-50/60' : 'bg-white'
                                                        }`}
                                                    >
                                                        {!notif.sudah_dibaca && (
                                                            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs ${!notif.sudah_dibaca ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {notif.pesan || notif.judul}
                                                            </p>
                                                            {notif.isi && (
                                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                                    {notif.isi}
                                                                </p>
                                                            )}
                                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                                {notif.created_at}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-gray-400 text-xs">
                                                    Belum ada notifikasi
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Avatar */}
                            <div className="flex items-center space-x-2 p-1.5 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}