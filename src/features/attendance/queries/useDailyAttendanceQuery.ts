import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AttendanceRecord, DailyAttendanceParams } from '@/types/api';

export const DAILY_ATTENDANCE_QUERY_KEY = ['attendance', 'daily'] as const;

export function useDailyAttendanceQuery(params?: DailyAttendanceParams) {
  return useQuery({
    queryKey: [...DAILY_ATTENDANCE_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/attendance/daily', { params });
      // Extract array from response - handle both wrapped and direct array
      if (Array.isArray(response)) {
        return response;
      }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback to empty array
      return [];
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

