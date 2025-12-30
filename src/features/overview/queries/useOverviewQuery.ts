import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const OVERVIEW_QUERY_KEY = ['overview'] as const;

export function useOverviewQuery() {
    return useQuery({
        queryKey: OVERVIEW_QUERY_KEY,
        queryFn: async () => {
            // Fetch dashboard stats and recent alerts in parallel
            const [statsResponse, alertsResponse] = await Promise.all([
                apiClient.get<any>('/api/v1/dashboard/stats'),
                apiClient.get<any>('/api/v1/risk/alerts?limit=5').catch(() => ({ data: { alerts: [] } }))
            ]);

            const apiData = statsResponse.data || statsResponse;
            const alertsData = alertsResponse.data || alertsResponse;

            // Transform alerts to match frontend expectations
            const recentAlerts = (alertsData.alerts || alertsData || []).slice(0, 5).map((alert: any) => ({
                id: alert.id,
                student_name: alert.student_name || alert.student?.name || 'Unknown',
                student_nis: alert.student_nis,
                risk_level: alert.alert_type?.toLowerCase() || alert.risk_level || 'medium',
                message: alert.message || `${alert.alert_type} alert`,
                status: alert.status || 'pending',
                created_at: alert.created_at || new Date().toISOString(),
            }));

            // Transform API response structure to match frontend expectations
            return {
                total_students: apiData.overview?.total_students || apiData.overview?.active_students || 0,
                total_classes: apiData.overview?.total_classes || 0,
                total_teachers: apiData.overview?.total_teachers || 0,
                attendance_today: {
                    present: apiData.today_attendance?.present || 0,
                    absent: apiData.today_attendance?.absent || 0,
                    late: apiData.today_attendance?.late || 0,
                    permission: apiData.today_attendance?.permission || 0,
                    sick: apiData.today_attendance?.sick || 0,
                    percentage: apiData.today_attendance?.rate || 0,
                    date: apiData.today_attendance?.date || new Date().toISOString().split('T')[0],
                },
                risk_summary: {
                    low: apiData.risk_summary?.low_risk || 0,
                    medium: apiData.risk_summary?.medium_risk || 0,
                    high: apiData.risk_summary?.high_risk || 0,
                    critical: apiData.risk_summary?.critical_risk || 0,
                },
                this_month: {
                    average_rate: apiData.this_month?.average_rate || 0,
                    total_absents: apiData.this_month?.total_absents || 0,
                    total_lates: apiData.this_month?.total_lates || 0,
                    trend: apiData.this_month?.trend || '+0.0%',
                },
                recent_alerts: recentAlerts,
            };
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
