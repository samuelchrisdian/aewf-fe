import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Student } from '@/types/api';

export const STUDENT_QUERY_KEY = (nis?: string | null) => ['student', nis] as const;

export function useStudentQuery(nis?: string | null) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEY(nis),
    queryFn: async () => {
      if (!nis) return null;

      try {
        const response = await apiClient.get<any>(`/api/v1/students/${nis}`);
        // Extract data from response
        return response.data || response;
      } catch (error) {
        console.error('Failed to fetch student:', error);
        return null;
      }
    },
    enabled: !!nis,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
