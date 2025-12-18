import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AttendanceRecord, StudentAttendanceParams } from '@/types/api';

export const STUDENT_ATTENDANCE_QUERY_KEY = (nis?: string) => ['attendance', 'student', nis] as const;

export function useStudentAttendanceQuery(nis?: string, params?: StudentAttendanceParams) {
  return useQuery({
    queryKey: [...STUDENT_ATTENDANCE_QUERY_KEY(nis), params],
    queryFn: async () => {
      if (!nis) return [];
      const response = await apiClient.get<any>(`/api/v1/attendance/student/${nis}`, { params });
      // Extract array from response
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },
    enabled: !!nis,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

