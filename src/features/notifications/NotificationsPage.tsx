import React, { useState } from 'react';
import { Bell, Filter, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications, useMarkAsRead } from './queries';
import NotificationItem from './components/NotificationItem';

const NotificationsPage: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [page, setPage] = useState(1);

    const isReadParam = filter === 'all' ? undefined : filter === 'read';
    const { data, isLoading, error, refetch } = useNotifications({ is_read: isReadParam, page });
    const { mutate: markAsRead, isPending: isMarkingAll } = useMarkAsRead();

    const notifications = data?.notifications || [];
    const unreadCount = data?.unread_count || 0;

    const handleMarkAllAsRead = () => {
        // Mark each unread notification as read
        notifications
            .filter(n => !n.is_read)
            .forEach(n => markAsRead(n.id));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        Notifikasi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter Buttons */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {(['all', 'unread', 'read'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setPage(1); }}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                            </button>
                        ))}
                    </div>

                    {/* Mark All as Read */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAll}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span className="hidden sm:inline">Tandai Semua Dibaca</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">Gagal memuat notifikasi</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 text-sm text-primary hover:underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium text-gray-600">
                            {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' :
                                filter === 'read' ? 'Tidak ada notifikasi yang sudah dibaca' :
                                    'Belum ada notifikasi'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Notifikasi baru akan muncul di sini
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && (data?.total || 0) > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{((page - 1) * (data?.per_page || 20)) + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(page * (data?.per_page || 20), data?.total || 0)}</span> of{' '}
                            <span className="font-medium">{data?.total || 0}</span> notifications
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                                Page <span className="font-medium mx-1">{page}</span> of <span className="font-medium ml-1">{data?.total_pages || 1}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= (data?.total_pages || 1)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
