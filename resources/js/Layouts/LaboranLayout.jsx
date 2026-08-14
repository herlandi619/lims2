import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function LaboranLayout({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showingNotificationDropdown, setShowingNotificationDropdown] = useState(false);
    
    const notificationRef = useRef(null);

    // Ambil data user & notifikasi dari Inertia Shared Props
    const { auth } = usePage().props;
    const user = auth?.user;
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unreadNotificationCount || 0;

    // Helper aman untuk mengecek route aktif
    const isCurrentRoute = (routeName) => {
        try {
            return typeof route === 'function' && route().current(routeName);
        } catch {
            return false;
        }
    };

    // Helper aman untuk generate URL route
    const getRouteUrl = (routeName, param = null) => {
        try {
            return typeof route === 'function' ? (param ? route(routeName, param) : route(routeName)) : '#';
        } catch {
            return '#';
        }
    };

    // Close notification dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowingNotificationDropdown(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowingNotificationDropdown(false);
                setShowingNavigationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Handler: Tandai 1 Notifikasi Dibaca lalu Arahkan ke URL Tujuan
    const handleMarkAsRead = (id, targetUrl) => {
        const markRoute = getRouteUrl('notifikasi.mark-as-read', id);
        if (markRoute === '#') return;

        router.patch(markRoute, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowingNotificationDropdown(false);
                if (targetUrl) {
                    router.visit(targetUrl);
                }
            }
        });
    };

    // Handler: Tandai Semua Notifikasi Dibaca
    const handleMarkAllRead = () => {
        const markAllRoute = getRouteUrl('notifikasi.mark-all-read');
        if (markAllRoute === '#') return;

        router.post(markAllRoute, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowingNotificationDropdown(false);
            }
        });
    };

    const navigationLinks = [ 
        { 
            name: 'Dashboard', 
            route: 'laboran.dashboard', 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
        },
        { 
            name: 'Manajemen Inventaris & QR', 
            route: 'laboran.alat.index', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
        },
        { 
            name: 'Transaksi & Persetujuan', 
            route: 'laboran.sirkulasi.index', 
            icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' 
        },
        { 
            name: 'Pengelolaan Ruangan & Jadwal', 
            route: 'laboran.ruangan-manajemen.index', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
        },
        { 
            name: 'Pemeliharaan Alat', 
            route: 'laboran.perawatan-alat.index', 
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' 
        },
        { 
            name: 'Pusat Dokumen', 
            route: 'laboran.arsip-sop.index', 
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
        },
        { 
            name: 'Absensi', 
            route: 'laboran.absensi.monitoring', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' 
        },
        { 
            name: 'Ticketing', 
            route: 'laboran.tickets.index', 
            icon: 'M15 5v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5H4a2 2 0 00-2 2v3a2 2 0 011 1.732V12a2 2 0 01-1 1.732V17a2 2 0 002 2h16a2 2 0 002-2v-3.268A2 2 0 0121 12a2 2 0 01-1-1.732V7a2 2 0 00-2-2h-3z'
        },
        { 
            name: 'Laporan & Rekapitulasi', 
            route: 'laboran.laporan.index', 
            icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' 
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white min-h-screen shadow-lg flex-shrink-0">
                <div className="p-5 border-b border-indigo-800 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl tracking-wider">LIMS LAB</h1>
                        <p className="text-xs text-indigo-300">Portal Laboran</p>
                    </div>
                </div>

                {/* Profil Singkat Laboran di Sidebar */}
                <div className="p-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white flex-shrink-0 select-none">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.name || 'Laboran'}</p>
                        <p className="text-xs text-indigo-300 truncate">{user?.email || 'Staff Laboratorium'}</p>
                    </div>
                </div>

                {/* Menu Navigasi Sidebar */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigationLinks.map((link, index) => {
                        const active = isCurrentRoute(link.route);
                        return (
                            <Link
                                key={index}
                                href={getRouteUrl(link.route)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-700 text-white font-semibold shadow-sm'
                                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                </svg>
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-indigo-800">
                    <Link
                        href={getRouteUrl('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors text-left"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        
                        {/* Mobile Hamburger Toggle */}
                        <div className="flex items-center md:hidden">
                            <button
                                type="button"
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="Toggle navigation"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <span className="ml-2 font-bold text-indigo-900">LIMS LAB</span>
                        </div>

                        {/* Page Header Title (Desktop) */}
                        <div className="hidden md:block">
                            {header}
                        </div>

                        {/* Topbar Action Menu (Notifikasi & Profil) */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            
                            {/* --- KOMPONEN DROPDOWN NOTIFIKASI --- */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowingNotificationDropdown(!showingNotificationDropdown)}
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    aria-label="Notifikasi"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>

                                    {/* Badge Jumlah Notifikasi Belum Dibaca */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Panel Popup Notifikasi */}
                                {showingNotificationDropdown && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-xs uppercase tracking-wider text-gray-700">Notifikasi</span>
                                                {unreadCount > 0 && (
                                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                                        {unreadCount} Baru
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-indigo-600 font-semibold hover:underline focus:outline-none"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>

                                        {/* Daftar Notifikasi */}
                                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-xs text-gray-400">
                                                    Tidak ada notifikasi baru.
                                                </div>
                                            ) : (
                                                notifications.map((notif) => {
                                                    const isUnread = !notif.read_at;
                                                    return (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleMarkAsRead(notif.id, notif.data?.url)}
                                                            className={`p-3.5 transition flex items-start space-x-3 cursor-pointer ${
                                                                isUnread ? 'bg-indigo-50/40 hover:bg-indigo-50/80' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                                notif.data?.type === 'peminjaman_barang' 
                                                                    ? 'bg-amber-100 text-amber-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 text-xs">
                                                                <p className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                    {notif.data?.title || 'Notifikasi Baru'}
                                                                </p>
                                                                <p className="text-gray-600 mt-0.5 leading-relaxed">{notif.data?.message}</p>
                                                                <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-flex items-center gap-1">
                                                                    Klik untuk meninjau &rarr;
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Profil User Topbar */}
                            <div className="flex items-center space-x-2 p-1 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm select-none">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigasi Dropdown Tampilan Mobile */}
                    {showingNavigationDropdown && (
                        <div className="md:hidden border-b border-gray-200 bg-indigo-900 text-white px-2 pt-2 pb-3 space-y-1">
                            {navigationLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={getRouteUrl(link.route)}
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        isCurrentRoute(link.route)
                                            ? 'bg-indigo-700 text-white'
                                            : 'text-indigo-200 hover:bg-indigo-800'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 pb-1 border-t border-indigo-800">
                                <Link
                                    href={getRouteUrl('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-red-900/50"
                                >
                                    Keluar (Logout)
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                {/* Sub Header khusus Mobile */}
                <div className="block md:hidden bg-white px-4 py-3 border-b border-gray-200">
                    {header}
                </div>

                {/* Main Content Render */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}