import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { RiskHistory } from '@/types/api';

export const RISK_HISTORY_QUERY_KEY = (nis?: string) => ['risk', 'history', nis] as const;

export function useRiskHistoryQuery(nis?: string) {
  return useQuery({
    queryKey: RISK_HISTORY_QUERY_KEY(nis),
    queryFn: async () => {
      if (!nis) return [];

      try {
        const response = await apiClient.get<any>(`/api/v1/risk/history/${nis}`);
        // Extract data from response - handle both wrapped and direct array responses
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data) {
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (Array.isArray(response.data.history)) {
            return response.data.history;
          }
        }
        // Fallback to empty array
        return [];
      } catch (error) {
        console.error('Failed to fetch risk history:', error);
        return [];
      }
    },
    enabled: !!nis,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

