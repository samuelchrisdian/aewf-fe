import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const TEACHERS_QUERY_KEY = ['teachers'] as const;

export interface Teacher {
  teacher_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

// Get all teachers
export function useTeachersQuery() {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/api/v1/teachers');

        // Extract array from response
        let teachers: Teacher[] = [];
        if (Array.isArray(response)) {
          teachers = response;
        } else if (response.data && Array.isArray(response.data)) {
          teachers = response.data;
        } else if (response.success && response.data && Array.isArray(response.data)) {
          teachers = response.data;
        }

        // Filter only "Wali Kelas" role
        return teachers.filter(teacher => teacher.role === 'Wali Kelas');
      } catch (error) {
        console.error('Teachers API error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

