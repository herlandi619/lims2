import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function DosenLayout({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showingNotifDropdown, setShowingNotifDropdown] = useState(false);
    
    // Ambil data user & notifikasi dari Shared Props Inertia
    const { auth, notifications = [], unreadNotificationCount = 0 } = usePage().props;
    const user = auth?.user;

    // Handler 1: Tandai 1 notifikasi sudah dibaca
    const handleMarkAsRead = (id) => {
        router.patch(route('notifikasi.mark-as-read', id), {}, {
            preserveScroll: true,
        });
    };

    // Handler 2: Tandai semua notifikasi milik user sudah dibaca
    const handleMarkAllRead = () => {
        if (unreadNotificationCount > 0) {
            router.post(route('notifikasi.mark-all-read'), {}, {
                preserveScroll: true,
            });
        }
    };

    const navigationLinks = [
        { 
            name: 'Dashboard', 
            route: 'dosen.dashboard', 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
        },
        { 
            name: 'Katalog & Inventaris', 
            route: 'dosen.inventaris.index', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
        },
        { 
            name: 'Booking Ruangan', 
            route: 'dosen.booking-ruangan.index', 
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4' 
        },
        { 
            name: 'Jadwal Lab', 
            route: 'dosen.jadwal-laboratorium.index', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
        },
        { 
            name: 'Absensi', 
            route: 'dosen.absensi.index', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' 
        },
        { 
            name: 'Dokumen Sop & Arsip', 
            route: 'dosen.dokumen-sop.index', 
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
        },
        { 
            name: 'Profile', 
            route: 'dosen.profil.index', 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' 
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white min-h-screen shadow-lg">
                <div className="p-5 border-b border-indigo-800 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl tracking-wider">LIMS LAB</h1>
                        <p className="text-xs text-indigo-300">Portal Dosen</p>
                    </div>
                </div>

                {/* Profil Singkat Dosen di Sidebar */}
                <div className="p-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.name || 'Dosen'}</p>
                        <p className="text-xs text-indigo-300">NIP: {user?.nip || '-'}</p>
                    </div>
                </div>

                {/* Menu Navigasi Sidebar */}
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
                        
                        {/* Mobile Hamburger Toggle */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
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

                        {/* Page Header Title */}
                        <div className="hidden md:block">
                            {header}
                        </div>

                        {/* Topbar Action Menu (Notifikasi & User) */}
                        <div className="flex items-center space-x-4">
                            
                            {/* --- COMPONENT NOTIFIKASI --- */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowingNotifDropdown(!showingNotifDropdown)}
                                    className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
                                    title="Notifikasi"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
                                    </svg>
                                    
                                    {/* Badge Red Dot Count */}
                                    {unreadNotificationCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown List Notifikasi */}
                                {showingNotifDropdown && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="px-4 py-3 bg-indigo-900 text-white flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-sm font-semibold">Notifikasi</h3>
                                                {unreadNotificationCount > 0 && (
                                                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                                        {unreadNotificationCount} Baru
                                                    </span>
                                                )}
                                            </div>
                                            {unreadNotificationCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-indigo-200 hover:text-white underline focus:outline-none"
                                                >
                                                    Tandai Semua Dibaca
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => {
                                                            if (!notif.sudah_dibaca) {
                                                                handleMarkAsRead(notif.id);
                                                            }
                                                        }}
                                                        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                            !notif.sudah_dibaca ? 'bg-indigo-50/60' : ''
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-xs font-semibold ${!notif.sudah_dibaca ? 'text-indigo-900' : 'text-gray-800'}`}>
                                                                {notif.judul}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                                                                {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 line-clamp-2">{notif.isi}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-gray-500">
                                                    Tidak ada notifikasi.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* --- END COMPONENT NOTIFIKASI --- */}

                            <div className="flex items-center space-x-2 p-1.5 rounded-lg border-l border-gray-200 pl-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
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
                                    href={route(link.route)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        route().current(link.route)
                                            ? 'bg-indigo-700 text-white'
                                            : 'text-indigo-200 hover:bg-indigo-800'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 pb-1 border-t border-indigo-800">
                                <Link
                                    href={route('logout')}
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