import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const TEACHERS_QUERY_KEY = ['teachers'] as const;

export interface Teacher {
    teacher_id: string;
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
}

interface TeachersResponse {
    data?: Teacher[];
}

export function useTeachersQuery() {
    return useQuery({
        queryKey: TEACHERS_QUERY_KEY,
        queryFn: async (): Promise<Teacher[]> => {
            try {
                const response = await apiClient.get<TeachersResponse | Teacher[]>('/api/v1/teachers');

                // Handle different response structures
                if (Array.isArray(response)) {
                    return response;
                } else if (response.data && Array.isArray(response.data)) {
                    return response.data;
                }

                return [];
            } catch (error) {
                console.error('Failed to fetch teachers:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
}
