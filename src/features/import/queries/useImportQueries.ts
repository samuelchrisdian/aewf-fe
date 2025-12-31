// Import System React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ImportBatch, ImportResponse, ImportBatchListParams } from '@/types/api';

export const BATCHES_QUERY_KEY = ['import-batches'] as const;

// List import batches
export function useBatchesQuery(params?: ImportBatchListParams) {
    return useQuery({
        queryKey: [...BATCHES_QUERY_KEY, params],
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/import/batches', { params });
            if (Array.isArray(response)) return response;
            if (response.data && Array.isArray(response.data)) return response.data as ImportBatch[];
            if (response.batches && Array.isArray(response.batches)) return response.batches as ImportBatch[];
            return [];
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Get single batch details
export const BATCH_QUERY_KEY = (id?: number) => ['import-batch', id] as const;

export function useBatchQuery(id?: number) {
    return useQuery({
        queryKey: BATCH_QUERY_KEY(id),
        queryFn: async () => {
            if (!id) return null;
            const response = await apiClient.get<any>(`/api/v1/import/batches/${id}`);
            return response.data || response;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 2,
    });
}

// Import master data (students, classes, teachers)
export function useImportMaster() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return apiClient.post<ImportResponse>('/api/v1/import/master', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
            // Also invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
    });
}

// Sync machine users
export function useImportSync() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, machineCode }: { file: File; machineCode: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('machine_code', machineCode);
            return apiClient.post<ImportResponse>('/api/v1/import/users-sync', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['machines'] });
        },
    });
}

// Import attendance logs
export function useImportAttendance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, machineCode }: { file: File; machineCode: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('machine_code', machineCode);
            return apiClient.post<ImportResponse>('/api/v1/import/attendance', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
    });
}

// Rollback batch
export function useRollbackBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return apiClient.post<{ success: boolean; message: string }>(`/api/v1/import/batches/${id}/rollback`);
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEY(id) });
        },
    });
}

// Delete batch
export function useDeleteBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/api/v1/import/batches/${id}`);
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
            queryClient.removeQueries({ queryKey: BATCH_QUERY_KEY(id) });
        },
    });
}
