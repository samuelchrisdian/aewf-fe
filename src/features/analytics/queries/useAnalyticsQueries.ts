// Analytics queries
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AttendanceTrend, ClassComparison, StudentPattern } from '@/types/api';

// Attendance trends query
export const ATTENDANCE_TRENDS_QUERY_KEY = ['analytics', 'trends'] as const;

export function useAttendanceTrendsQuery(period?: 'weekly' | 'monthly') {
  return useQuery({
    queryKey: [...ATTENDANCE_TRENDS_QUERY_KEY, period],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/analytics/trends', {
        params: { period }
      });
      // Extract array from response
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Class comparison query
export const CLASS_COMPARISON_QUERY_KEY = ['analytics', 'class-comparison'] as const;

export function useClassComparisonQuery(period?: string) {
  return useQuery({
    queryKey: [...CLASS_COMPARISON_QUERY_KEY, period],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/analytics/class-comparison', {
        params: { period }
      });
      // Extract array from response
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Student patterns query
export const STUDENT_PATTERNS_QUERY_KEY = (nis?: string) => ['analytics', 'student-patterns', nis] as const;

export function useStudentPatternsQuery(nis?: string) {
  return useQuery({
    queryKey: STUDENT_PATTERNS_QUERY_KEY(nis),
    queryFn: async () => {
      if (!nis) return null;
      const response = await apiClient.get<any>(`/api/v1/analytics/student-patterns/${nis}`);
      // Extract data from response
      return response.data || response;
    },
    enabled: !!nis,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

