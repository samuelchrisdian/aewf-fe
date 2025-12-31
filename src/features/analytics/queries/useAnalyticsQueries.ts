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
      // Calculate date ranges based on period
      const now = new Date();
      let startDate: string;
      let endDate: string = now.toISOString().split('T')[0]; // Today as end_date

      if (period === 'weekly') {
        // Get data for the last 4 weeks
        const start = new Date(now);
        start.setDate(start.getDate() - 28);
        startDate = start.toISOString().split('T')[0];
      } else {
        // Get data for the last 6 months for monthly
        const start = new Date(now);
        start.setMonth(start.getMonth() - 6);
        startDate = start.toISOString().split('T')[0];
      }

      const response = await apiClient.get<any>('/api/v1/analytics/trends', {
        params: {
          period,
          start_date: startDate,
          end_date: endDate
        }
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

