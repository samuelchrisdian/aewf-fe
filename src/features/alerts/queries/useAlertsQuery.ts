import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Alert, AlertsParams } from '@/types/api';

export const ALERTS_QUERY_KEY = ['alerts'] as const;

export function useAlertsQuery(params?: AlertsParams) {
    return useQuery({
        queryKey: [...ALERTS_QUERY_KEY, params],
        queryFn: async () => {
            return apiClient.get<Alert[]>('/api/v1/risk/alerts', { params });
        },
        staleTime: 1000 * 60 * 1, // 1 minute
    });
}
