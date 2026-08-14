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
        route: 'kepala.dashboard', 
        // Icon: Chart Bar / Dashboard
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
    },
    { 
        name: 'Pusat Persetujuan', 
        route: 'kepala.persetujuan.index', 
        // Icon: Shield Check / Approval
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' 
    },
    { 
        name: 'Monitoring & Pengawasan', 
        route: 'kepala.monitoring.index', 
        // Icon: Eye / Monitoring / Radar
        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' 
    },
    { 
        name: 'Ticketing', 
        route: 'kepala.tickets.index', 
        // Icon: Eye / Monitoring / Radar
        icon: 'M15 5v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5H4a2 2 0 00-2 2v3a2 2 0 011 1.732V12a2 2 0 01-1 1.732V17a2 2 0 002 2h16a2 2 0 002-2v-3.268A2 2 0 0121 12a2 2 0 01-1-1.732V7a2 2 0 00-2-2h-3z' 
    },
    { 
        name: 'Laporan', 
        route: 'kepala.laporan.index', 
        // Icon: Document Report / Clipboard List
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
    },
];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white min-h-screen shadow-lg">
                <div className="p-5 border-b border-indigo-800 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl tracking-wider">LIMS LAB</h1>
                        <p className="text-xs text-indigo-300">Portal Kepala Laboran</p>
                    </div>
                </div>

                {/* Profil Singkat Kepala Laboran di Sidebar */}
                <div className="p-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.name || 'Kepala Laboran'}</p>
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