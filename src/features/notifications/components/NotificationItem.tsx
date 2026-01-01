import React from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Notification, useMarkAsRead, useDeleteNotification } from '../queries';

interface NotificationItemProps {
    notification: Notification;
    compact?: boolean;
    onRead?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, compact = false, onRead }) => {
    const { mutate: markAsRead, isPending: isMarking } = useMarkAsRead();
    const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'risk_alert':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'attendance':
                return <Calendar className="w-4 h-4 text-blue-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500';
            case 'normal':
                return 'border-l-blue-500';
            default:
                return 'border-l-gray-300';
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit lalu`;
            if (diffHours < 24) return `${diffHours} jam lalu`;
            if (diffDays < 7) return `${diffDays} hari lalu`;
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        } catch {
            return dateStr;
        }
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        markAsRead(notification.id);
        onRead?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Hapus notifikasi ini?')) {
            deleteNotification(notification.id);
        }
    };

    const content = (
        <div
            className={`flex items-start gap-3 p-3 border-l-4 ${getPriorityColor(notification.priority)} ${notification.is_read ? 'bg-white' : 'bg-blue-50'
                } hover:bg-gray-50 transition-colors rounded-r-lg`}
        >
            <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>

            <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'text-gray-900 font-medium'} line-clamp-1`}>
                        {notification.title}
                    </p>
                    {!compact && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(notification.created_at)}</span>
                    )}
                </div>

                {!compact && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                )}

                {compact && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(notification.created_at)}</p>
                )}
            </div>

            {!compact && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.is_read && (
                        <button
                            onClick={handleMarkAsRead}
                            disabled={isMarking}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Tandai sudah dibaca"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
            )}
        </div>
    );

    // If notification has related student, wrap in link
    if (notification.related_student_nis) {
        return (
            <Link to={`/alerts/${notification.related_student_nis}`} className="block">
                {content}
            </Link>
        );
    }

    return content;
};

export default NotificationItem;
