// Mapping System React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    MappingStats,
    MappingSuggestion,
    VerifyMappingRequest,
    BulkVerifyRequest,
    ProcessMappingResponse,
    ManualMappingRequest,
    BulkCreateMappingRequest,
    BulkCreateMappingResponse
} from '@/types/api';

export const MAPPING_STATS_KEY = ['mapping-stats'] as const;
export const UNMAPPED_USERS_KEY = ['mapping-unmapped'] as const;
export const MAPPED_USERS_KEY = ['mapping-list'] as const;
export const UNMAPPED_STUDENTS_KEY = ['mapping-unmapped-students'] as const;
export const MAPPING_SUGGESTIONS_KEY = ['mapping-suggestions'] as const;

// Get mapping statistics
export function useMappingStats() {
    return useQuery({
        queryKey: MAPPING_STATS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/stats');
            const data = response.data || response;

            // Return the data as it comes from the API
            // API returns: total_machine_users, mapped_count, suggested_count, unmapped_count, verified_count, mapping_rate
            return {
                total_machine_users: data.total_machine_users ?? 0,
                mapped_count: data.mapped_count ?? 0,
                unmapped_count: data.unmapped_count ?? 0,
                suggested_count: data.suggested_count ?? 0,
                verified_count: data.verified_count ?? 0,
                mapping_rate: data.mapping_rate ?? 0,
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
            // Fetch all unmapped users (per_page=1000 to avoid pagination)
            const response = await apiClient.get<any>('/api/v1/mapping/unmapped?per_page=1000');

            // Parse the response to get the unmapped array and pagination
            let unmappedArray: any[] = [];
            let total = 0;

            if (Array.isArray(response)) {
                unmappedArray = response;
                total = response.length;
            } else if (response.data && Array.isArray(response.data)) {
                unmappedArray = response.data;
                total = response.pagination?.total || response.data.length;
            } else if (response.unmapped && Array.isArray(response.unmapped)) {
                unmappedArray = response.unmapped;
                total = response.pagination?.total || response.unmapped.length;
            }

            // Transform the API response format to match MappingSuggestion type
            // API returns: { machine_user: {...}, suggested_matches: [...] }
            // Frontend expects: { id, machine_user, suggested_student, confidence_score, status, is_mapped }
            const transformedData = unmappedArray.map((item, index) => {
                const topMatch = item.suggested_matches?.[0];
                return {
                    id: item.machine_user?.id || index,
                    machine_user: {
                        id: item.machine_user?.id,
                        machine_id: item.machine_user?.machine_id,  // Include machine_id for delete operations
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
                    confidence_score: topMatch?.confidence_score || 0, // Keep as percentage (0-100)
                    status: 'pending' as const,
                    is_mapped: item.machine_user?.is_mapped ?? false,
                    all_matches: item.suggested_matches, // Keep all matches for display if needed
                } as MappingSuggestion & { all_matches?: any[] };
            });

            // Return data with metadata
            return {
                data: transformedData,
                total: total,
            };
        },
        staleTime: 1000 * 60 * 2,
    });
}

// Get mapped users
export function useMappedUsers() {
    return useQuery({
        queryKey: MAPPED_USERS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/list');

            // Parse the response to get the mapped array and pagination
            let mappedArray: any[] = [];
            let total = 0;

            if (Array.isArray(response)) {
                mappedArray = response;
                total = response.length;
            } else if (response.data && Array.isArray(response.data)) {
                mappedArray = response.data;
                total = response.pagination?.total || response.data.length;
            } else if (response.mappings && Array.isArray(response.mappings)) {
                mappedArray = response.mappings;
                total = response.pagination?.total || response.mappings.length;
            }

            // Transform the API response format to match MappingSuggestion type
            const transformedData = mappedArray.map((item, index) => {
                return {
                    id: item.id || index,
                    machine_user: {
                        id: item.machine_user?.id || item.id,
                        machine_user_id: item.machine_user?.machine_user_id || '',
                        machine_user_name: item.machine_user?.machine_user_name || '',
                        machine_code: item.machine_user?.machine_code || '',
                        department: item.machine_user?.machine_code || '',
                    },
                    suggested_student: item.student ? {
                        nis: item.student.nis,
                        name: item.student.name,
                        class_id: item.student.class_id,
                    } : null,
                    confidence_score: item.confidence_score || 100, // Keep as percentage (0-100)
                    status: item.status || 'suggested' as const,
                    is_mapped: true,
                    verified_at: item.verified_at,
                    verified_by: item.verified_by,
                } as MappingSuggestion;
            });

            // Return data with metadata
            return {
                data: transformedData,
                total: total,
            };
        },
        staleTime: 1000 * 60 * 2,
    });
}

// Get unmapped students for manual mapping
export function useUnmappedStudents() {
    return useQuery({
        queryKey: UNMAPPED_STUDENTS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/mapping/unmapped-students');

            // Parse the response to get the students array
            let studentsArray: any[] = [];
            if (Array.isArray(response)) {
                studentsArray = response;
            } else if (response.data && Array.isArray(response.data)) {
                studentsArray = response.data;
            } else if (response.students && Array.isArray(response.students)) {
                studentsArray = response.students;
            }

            // Transform to Student type if needed
            return studentsArray.map((student: any) => ({
                nis: student.nis,
                name: student.name,
                class_id: student.class_id,
                class_name: student.class_name || student.class_id,
            }));
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
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
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
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
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
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
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
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
        },
    });
}

// Delete a mapped student mapping
export function useDeleteMappedStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (nis: string) => {
            return apiClient.delete(`/api/v1/mapping/student/${nis}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_STUDENTS_KEY });
        },
    });
}

// Create a single manual mapping
export function useManualMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ManualMappingRequest) => {
            return apiClient.post<{ success: boolean; message: string; mapping_id?: number }>(
                '/api/v1/mapping/manual',
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_STUDENTS_KEY });
        },
    });
}

// Create multiple mappings at once (bulk create)
export function useBulkCreateMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: BulkCreateMappingRequest) => {
            return apiClient.post<BulkCreateMappingResponse>(
                '/api/v1/mapping/bulk-create',
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_STUDENTS_KEY });
        },
    });
}

// Delete a machine user (for unmapped users in the mapping page)
export function useDeleteMachineUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ machineId, userId }: { machineId: number; userId: number }) => {
            return apiClient.delete(`/api/v1/machines/${machineId}/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MAPPING_STATS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPED_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: MAPPING_SUGGESTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: UNMAPPED_STUDENTS_KEY });
        },
    });
}
