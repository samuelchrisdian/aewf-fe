// Machines queries
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Machine, MachineUser } from '@/types/api';

export const MACHINES_QUERY_KEY = ['machines'] as const;

// List machines
export function useMachinesQuery(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: [...MACHINES_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/machines', { params });
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single machine
export const MACHINE_QUERY_KEY = (id?: number) => ['machine', id] as const;

export function useMachineQuery(id?: number) {
  return useQuery({
    queryKey: MACHINE_QUERY_KEY(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<any>(`/api/v1/machines/${id}`);
      return response.data || response;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get machine users
export const MACHINE_USERS_QUERY_KEY = (id?: number) => ['machine', id, 'users'] as const;

export function useMachineUsersQuery(
  id?: number,
  params?: { mapped?: boolean; search?: string }
) {
  return useQuery({
    queryKey: [...MACHINE_USERS_QUERY_KEY(id), params],
    queryFn: async () => {
      if (!id) return [];
      const response = await apiClient.get<any>(`/api/v1/machines/${id}/users`, { params });
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Register machine
export function useRegisterMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { machine_code: string; location: string }) => {
      return apiClient.post<Machine>('/api/v1/machines', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MACHINES_QUERY_KEY });
    },
  });
}

// Update machine
export function useUpdateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { location?: string; status?: string } }) => {
      return apiClient.put<Machine>(`/api/v1/machines/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MACHINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MACHINE_QUERY_KEY(variables.id) });
    },
  });
}

// Delete machine
export function useDeleteMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/api/v1/machines/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: MACHINES_QUERY_KEY });
      queryClient.removeQueries({ queryKey: MACHINE_QUERY_KEY(id) });
    },
  });
}

