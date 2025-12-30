import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Menu, X, GraduationCap, LogOut, User, Users, Calendar, BarChart3, BookOpen, Server, MoreVertical } from 'lucide-react';
import { useAuth } from '../features/auth/hooks';

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
}

const Layout = (): React.ReactElement => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navigation: NavigationItem[] = [
        { name: 'Overview', href: '/', icon: LayoutDashboard },
        { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Students', href: '/students', icon: Users },
        { name: 'Attendance', href: '/attendance', icon: Calendar },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Classes', href: '/classes', icon: BookOpen, adminOnly: true },
        { name: 'Machines', href: '/machines', icon: Server, adminOnly: true },
    ];

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter(item => {
        // If item is admin only, check if user is admin
        if (item.adminOnly) {
            return user?.role === 'admin';
        }
        return true;
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Sidebar Header - Fixed */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold text-gray-800">AEWF</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section - Fixed at bottom */}
                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
                            </div>
                        </div>
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute bottom-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden flex-shrink-0">
                    <button onClick={() => setIsSidebarOpen((v) => !v)} className="text-gray-500 focus:outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-semibold text-gray-800">AEWF Dashboard</span>
                    <div className="w-6" />
                </header>

                {/* Main Content - Scrollable */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
