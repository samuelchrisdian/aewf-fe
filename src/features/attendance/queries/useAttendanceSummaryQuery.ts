import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AttendanceSummary, AttendanceSummaryParams } from '@/types/api';

export const ATTENDANCE_SUMMARY_QUERY_KEY = ['attendance', 'summary'] as const;

export function useAttendanceSummaryQuery(params?: AttendanceSummaryParams) {
  return useQuery({
    queryKey: [...ATTENDANCE_SUMMARY_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/attendance/summary', { params });
      // Extract data from response
      return response.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

