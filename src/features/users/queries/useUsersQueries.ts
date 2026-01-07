import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SystemUser, CreateUserRequest, UpdateUserRequest } from '@/types/api';

export const USERS_KEY = ['users'] as const;
export const USER_DETAIL_KEY = (id: number) => ['users', id] as const;

// Get all users
export function useUsersQuery() {
    return useQuery({
        queryKey: USERS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/users');

            // Handle different response formats
            if (Array.isArray(response)) {
                return response as SystemUser[];
            }
            if (response.data && Array.isArray(response.data)) {
                return response.data as SystemUser[];
            }
            if (response.users && Array.isArray(response.users)) {
                return response.users as SystemUser[];
            }
            return [] as SystemUser[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Get user by ID
export function useUserQuery(id: number | undefined) {
    return useQuery({
        queryKey: USER_DETAIL_KEY(id!),
        queryFn: async () => {
            const response = await apiClient.get<any>(`/api/v1/users/${id}`);

            // Handle different response formats
            if (response.data) {
                return response.data as SystemUser;
            }
            return response as SystemUser;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}

// Create user
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateUserRequest) => {
            return apiClient.post<SystemUser>('/api/v1/users', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
        },
    });
}

// Update user
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateUserRequest }) => {
            return apiClient.put<SystemUser>(`/api/v1/users/${id}`, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
            queryClient.invalidateQueries({ queryKey: USER_DETAIL_KEY(variables.id) });
        },
    });
}

// Delete user
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/api/v1/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
        },
    });
}

