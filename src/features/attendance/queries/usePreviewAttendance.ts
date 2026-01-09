import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface PreviewAttendanceParams {
    file: File;
    machine_code: string;
}

export interface PreviewUserRecord {
    user_id: string;
    name: string;
    mapped_to: string | null;
    found_in_machine: boolean;
    log_count: number;
}

export interface PreviewAttendanceResponse {
    message?: string;
    success: boolean;
    data?: {
        format: string;
        period: {
            year: number;
            month: number;
        };
        summary: {
            total_logs: number;
            total_users: number;
            unmapped_users: number;
            users_not_found: number;
        };
        users: PreviewUserRecord[];
        errors: string[];
    };
}

export function usePreviewAttendance() {
    return useMutation({
        mutationFn: async (params: PreviewAttendanceParams): Promise<PreviewAttendanceResponse> => {
            const formData = new FormData();
            formData.append('file', params.file);
            formData.append('machine_code', params.machine_code);

            const response = await apiClient.post<PreviewAttendanceResponse>(
                '/api/v1/import/attendance/preview',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 120000, // 2 minutes timeout for file upload
                }
            );

            return response;
        },
    });
}

