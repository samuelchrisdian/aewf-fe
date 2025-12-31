// Mapping System React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    MappingStats,
    MappingSuggestion,
    VerifyMappingRequest,
    BulkVerifyRequest,
    ProcessMappingResponse
} from '@/types/api';

export const MAPPING_STATS_KEY = ['mapping-stats'] as const;
export const UNMAPPED_USERS_KEY = ['mapping-unmapped'] as const;
export const MAPPING_SUGGESTIONS_KEY = ['mapping-suggestions'] as const;

// Get mapping statistics
export function useMappingStats() {
    return useQuery({
        queryKey: MAPPING_STATS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/stats');
            return (response.data || response) as MappingStats;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Get unmapped users with suggestions
export function useUnmappedUsers() {
    return useQuery({
        queryKey: UNMAPPED_USERS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/unmapped');
            if (Array.isArray(response)) return response as MappingSuggestion[];
            if (response.data && Array.isArray(response.data)) return response.data as MappingSuggestion[];
            if (response.unmapped && Array.isArray(response.unmapped)) return response.unmapped as MappingSuggestion[];
            return [];
        },
        staleTime: 1000 * 60 * 2,
    });
}

// Get mapping suggestions (legacy endpoint)
export function useMappingSuggestions() {
    return useQuery({
        queryKey: MAPPING_SUGGESTIONS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/suggestions');
            if (Array.isArray(response)) return response as MappingSuggestion[];
            if (response.data && Array.isArray(response.data)) return response.data as MappingSuggestion[];
            if (response.suggestions && Array.isArray(response.suggestions)) return response.suggestions as MappingSuggestion[];
            return [];
        },
        staleTime: 1000 * 60 * 2,
    });
}

// Run auto-mapping process
export function useProcessMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiClient.post<ProcessMappingResponse>('/api/v1/mapping/process');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
        },
    });
}

// Verify or reject a single mapping
export function useVerifyMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: VerifyMappingRequest) => {
            return apiClient.post<{ success: boolean; message: string }>('/api/v1/mapping/verify', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
        },
    });
}

// Bulk verify/reject mappings
export function useBulkVerify() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: BulkVerifyRequest) => {
            return apiClient.post<{ success: boolean; message: string; processed: number }>('/api/v1/mapping/bulk-verify', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
        },
    });
}

// Delete a mapping
export function useDeleteMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return apiClient.delete(`/api/v1/mapping/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
        },
    });
}
