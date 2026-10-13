import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    // Ambil data user secara terpusat dari Inertia Shared Props
    const { auth } = usePage().props;
    const user = auth?.user;

    const navigationLinks = [
    { 
        name: 'Dashboard', 
        route: 'admin.dashboard', 
        // Icon: Chart Bar / Dashboard
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
    },
    { 
        name: 'Manajemen User & Role', 
        route: 'admin.users.index', 
        // Icon: Users / User Group
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
    { 
        name: 'Master Data', 
        route: 'admin.master-data.index', 
        // Icon: Database / Server Data
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' 
    },
    { 
        name: 'Activity Logs', 
        route: 'admin.activity-logs.index', 
        // Icon: Clipboard List / Logs
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' 
    },
    { 
        name: 'Denda Setting', 
        route: 'admin.pengaturan-denda.index', 
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
        name: 'Ticketing', 
        route: 'admin.tickets.index', 
        icon: 'M15 5v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5H4a2 2 0 00-2 2v3a2 2 0 011 1.732V12a2 2 0 01-1 1.732V17a2 2 0 002 2h16a2 2 0 002-2v-3.268A2 2 0 0121 12a2 2 0 01-1-1.732V7a2 2 0 00-2-2h-3z' 
    },
    { 
        name: 'Backup & Restore', 
        route: 'admin.backups.index', 
        // Icon: Refresh / Sync / Backup
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' 
    },
    { 
        name: 'Validasi Penelitian', 
        route: 'admin.penelitian.index', 
        // Icon: Refresh / Sync / Backup
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' 
    },
];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white min-h-screen shadow-lg">
                <div className="p-5 border-b border-indigo-800 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl tracking-wider">LIMS LAB</h1>
                        <p className="text-xs text-indigo-300">Portal Admin</p>
                    </div>
                </div>

                {/* Profil Singkat Admin di Sidebar */}
                <div className="p-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
                        {/* <p className="text-xs text-indigo-300">NIM: {user?.nim || '-'}</p> */}
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
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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

                        {/* Topbar Action Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 p-1.5 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
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