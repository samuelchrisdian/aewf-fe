// Classes queries
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Class, CreateClassRequest } from '@/types/api';

export const CLASSES_QUERY_KEY = ['classes'] as const;

// List all classes
export function useClassesQuery() {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/api/v1/classes');

        // Extract array from response
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response.success && response.data && Array.isArray(response.data)) {
          return response.data;
        }

        return [];
      } catch (error) {
        console.error('Classes API error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Get single class
export const CLASS_QUERY_KEY = (id?: number) => ['class', id] as const;

export function useClassQuery(id?: number) {
  return useQuery({
    queryKey: CLASS_QUERY_KEY(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<any>(`/api/v1/classes/${id}`);
      return response.data || response;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create class
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { class_id: string; class_name: string; wali_kelas_id: string }) => {
      const response = await apiClient.post<any>('/api/v1/classes', data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
}

// Update class
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ class_id, data }: { class_id: string; data: { wali_kelas_id: string } }) => {
      const response = await apiClient.put<any>(`/api/v1/classes/${class_id}`, data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
}

// Delete class
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (class_id: string) => {
      const response = await apiClient.delete<any>(`/api/v1/classes/${class_id}`);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
}

