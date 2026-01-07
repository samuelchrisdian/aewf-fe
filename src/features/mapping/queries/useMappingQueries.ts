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
            const data = response.data || response;

            // Transform API response to match MappingStats type
            // API returns: total_machine_users, mapped_count, suggested_count, unmapped_count, verified_count
            // Frontend expects: total_users, mapped, pending, unmapped
            return {
                total_users: data.total_machine_users ?? data.total_users ?? 0,
                mapped: data.verified_count ?? data.mapped_count ?? data.mapped ?? 0,
                pending: data.suggested_count ?? data.pending ?? 0,
                unmapped: data.unmapped_count ?? data.unmapped ?? 0,
            } as MappingStats;
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

            // Parse the response to get the unmapped array
            let unmappedArray: any[] = [];
            if (Array.isArray(response)) {
                unmappedArray = response;
            } else if (response.data && Array.isArray(response.data)) {
                unmappedArray = response.data;
            } else if (response.unmapped && Array.isArray(response.unmapped)) {
                unmappedArray = response.unmapped;
            }

            // Transform the API response format to match MappingSuggestion type
            // API returns: { machine_user: {...}, suggested_matches: [...] }
            // Frontend expects: { id, machine_user, suggested_student, confidence_score, status }
            return unmappedArray.map((item, index) => {
                const topMatch = item.suggested_matches?.[0];
                return {
                    id: item.machine_user?.id || index,
                    machine_user: {
                        id: item.machine_user?.id,
                        machine_user_id: item.machine_user?.machine_user_id,
                        machine_user_name: item.machine_user?.machine_user_name,
                        machine_code: item.machine_user?.machine_code,
                        department: item.machine_user?.department || item.machine_user?.machine_code,
                    },
                    suggested_student: topMatch?.student ? {
                        nis: topMatch.student.nis,
                        name: topMatch.student.name,
                        class_id: topMatch.student.class_id,
                    } : null,
                    confidence_score: topMatch?.confidence_score ? topMatch.confidence_score / 100 : 0,
                    status: 'pending' as const,
                    all_matches: item.suggested_matches, // Keep all matches for display if needed
                } as MappingSuggestion & { all_matches?: any[] };
            });
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
            // Send empty object to ensure Content-Type: application/json header is included
            // This fixes 415 Unsupported Media Type error
            return apiClient.post<ProcessMappingResponse>('/api/v1/mapping/process', {});
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
