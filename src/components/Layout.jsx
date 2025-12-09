import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Users, Menu, X, GraduationCap } from 'lucide-react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Overview', href: '/', icon: LayoutDashboard },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Students', href: '/students/123456', icon: Users }, // Placeholder link
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold text-gray-800">AEWF</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header (Mobile Only) */}
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
                    <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-semibold text-gray-800">AEWF Dashboard</span>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
