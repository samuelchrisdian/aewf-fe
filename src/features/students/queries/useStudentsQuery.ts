import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { extractData } from '@/lib/api-helpers';
import type { StudentsListParams, StudentsListResponse } from '@/types/api';

export const STUDENTS_QUERY_KEY = ['students'] as const;

export function useStudentsQuery(params?: StudentsListParams) {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/students', { params });

      // API returns: { success: true, data: [...], pagination: {...}, message: "..." }
      // Transform to: { students: [...], total_pages: ..., total: ... }
      return {
        students: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        per_page: response.pagination?.per_page || 20,
        total_pages: response.pagination?.pages || 1,
      } as StudentsListResponse;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

