import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { RiskStudent, RiskListParams } from '@/types/api';

export const RISK_LIST_QUERY_KEY = ['risk', 'list'] as const;

// Backend response structure
interface BackendRiskStudent {
  student_nis: string;
  student_name: string;
  class_id?: string;
  class_name?: string;
  risk_level: string;
  risk_score: number;
  probability?: number;
  factors?: string[];
  last_updated?: string;
}

interface RiskListResponse {
  data: BackendRiskStudent[];
  total?: number;
  page?: number;
  per_page?: number;
}

export function useRiskListQuery(params?: RiskListParams) {
  return useQuery({
    queryKey: [...RISK_LIST_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<RiskListResponse>('/api/v1/risk/list', { params });
      // Transform backend data to frontend expected format
      const data = response.data || [];
      return data.map((item: BackendRiskStudent): RiskStudent => ({
        nis: item.student_nis,
        name: item.student_name,
        class_id: item.class_id ? parseInt(item.class_id) || 0 : 0,
        class_name: item.class_name,
        // Normalize risk_level (remove _risk suffix if present)
        risk_level: (item.risk_level?.replace('_risk', '') || 'low') as RiskStudent['risk_level'],
        risk_score: item.risk_score || 0,
        probability: item.probability,
        factors: item.factors,
        last_updated: item.last_updated,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

