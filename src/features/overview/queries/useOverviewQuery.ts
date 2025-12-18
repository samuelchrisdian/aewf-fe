import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types/api';

export const OVERVIEW_QUERY_KEY = ['overview'] as const;

export function useOverviewQuery() {
    return useQuery({
        queryKey: OVERVIEW_QUERY_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/dashboard/stats');
            // Extract data from response if wrapped
            return response.data || response;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
