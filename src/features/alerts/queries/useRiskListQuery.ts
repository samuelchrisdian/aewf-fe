import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { RiskStudent, RiskListParams } from '@/types/api';

export const RISK_LIST_QUERY_KEY = ['risk', 'list'] as const;

export function useRiskListQuery(params?: RiskListParams) {
  return useQuery({
    queryKey: [...RISK_LIST_QUERY_KEY, params],
    queryFn: async () => {
      return apiClient.get<RiskStudent[]>('/api/v1/risk/list', { params });
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

