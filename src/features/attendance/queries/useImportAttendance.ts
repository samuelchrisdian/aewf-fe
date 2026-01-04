import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';

export interface ImportAttendanceParams {
    file: File;
    machine_code: string;
}

export interface ImportAttendanceResponse {
    message: string;
    data?: {
        batch_id: number;
        logs_imported: number;
        daily_records_created: number;
        errors: string[];
    };
}

export function useImportAttendance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: ImportAttendanceParams): Promise<ImportAttendanceResponse> => {
            const formData = new FormData();
            formData.append('file', params.file);
            formData.append('machine_code', params.machine_code);

            const response = await apiClient.post<ImportAttendanceResponse>(
                '/api/v1/import/attendance',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response;
        },
        onSuccess: () => {
            // Invalidate attendance queries to refresh data
            queryClient.invalidateQueries({ queryKey: DAILY_ATTENDANCE_QUERY_KEY });
        },
    });
}
