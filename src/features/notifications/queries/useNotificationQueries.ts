import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============ Types ============
export interface Notification {
    id: number;
    type: 'risk_alert' | 'attendance' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high';
    is_read: boolean;
    created_at: string;
    recipient_type?: 'teacher' | 'parent';
    recipient_id?: string;
    related_student_nis?: string;
}

export interface NotificationSettings {
    enable_risk_alerts: boolean;
    enable_attendance: boolean;
    daily_digest_time: string;
}

export interface NotificationsResponse {
    data?: Notification[];
    notifications?: Notification[];
    total?: number;
    unread_count?: number;
    page?: number;
    per_page?: number;
}

// ============ Query Keys ============
export const NOTIFICATION_QUERY_KEYS = {
    list: (params?: { is_read?: boolean; page?: number }) =>
        ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    settings: ['notifications', 'settings'] as const,
};

// ============ Hooks ============

/**
 * Hook to fetch notifications list
 * GET /api/v1/notifications
 */
export function useNotifications(params?: { is_read?: boolean; page?: number }) {
    return useQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.list(params),
        queryFn: async (): Promise<{ notifications: Notification[]; total: number; unread_count: number }> => {
            const queryParams = new URLSearchParams();
            if (params?.is_read !== undefined) {
                queryParams.append('is_read', String(params.is_read));
            }
            if (params?.page) {
                queryParams.append('page', String(params.page));
            }

            const url = `/api/v1/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiClient.get<NotificationsResponse>(url);

            const data = response as any;
            const notifications = data.data || data.notifications || [];

            return {
                notifications: Array.isArray(notifications) ? notifications : [],
                total: data.total || notifications.length,
                unread_count: data.unread_count || notifications.filter((n: Notification) => !n.is_read).length,
            };
        },
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every 1 minute
    });
}

/**
 * Hook to get unread notifications count
 * Uses the notifications endpoint but only extracts unread count
 */
export function useUnreadCount() {
    return useQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
        queryFn: async (): Promise<number> => {
            const response = await apiClient.get<NotificationsResponse>('/api/v1/notifications?is_read=false');
            const data = response as any;

            if (data.unread_count !== undefined) {
                return data.unread_count;
            }

            const notifications = data.data || data.notifications || [];
            return Array.isArray(notifications) ? notifications.length : 0;
        },
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every 1 minute
    });
}

/**
 * Hook to mark a notification as read
 * PUT /api/v1/notifications/<id>/read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: number): Promise<void> => {
            await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            // Invalidate notifications queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Hook to delete a notification
 * DELETE /api/v1/notifications/<id>
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: number): Promise<void> => {
            await apiClient.delete(`/api/v1/notifications/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Hook to get notification settings
 * GET /api/v1/notifications/settings
 */
export function useNotificationSettings() {
    return useQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.settings,
        queryFn: async (): Promise<NotificationSettings> => {
            const response = await apiClient.get<NotificationSettings | { data: NotificationSettings }>('/api/v1/notifications/settings');
            const data = (response as any).data || response;

            return {
                enable_risk_alerts: data.enable_risk_alerts ?? true,
                enable_attendance: data.enable_attendance ?? true,
                daily_digest_time: data.daily_digest_time || '07:00',
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to update notification settings
 * PUT /api/v1/notifications/settings
 */
export function useUpdateNotificationSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: Partial<NotificationSettings>): Promise<void> => {
            await apiClient.put('/api/v1/notifications/settings', settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.settings });
        },
    });
}
