import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Alert, AlertsParams } from '@/types/api';

export const ALERTS_QUERY_KEY = ['alerts'] as const;

interface AlertsResponse {
    alerts?: Alert[];
    data?: Alert[];
    total?: number;
    page?: number;
    per_page?: number;
}

export function useAlertsQuery(params?: AlertsParams) {
    return useQuery({
        queryKey: [...ALERTS_QUERY_KEY, params],
        queryFn: async () => {
            const response = await apiClient.get<AlertsResponse>('/api/v1/risk/alerts', { params });
            // Extract the alerts array from the response wrapper
            return response.alerts || response.data || [];
        },
        staleTime: 1000 * 60 * 1, // 1 minute
    });
}
