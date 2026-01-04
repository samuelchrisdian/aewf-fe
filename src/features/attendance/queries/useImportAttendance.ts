import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';

interface ImportAttendanceRequest {
  file: File;
  machine_code: string;
}

export function useImportAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, machine_code }: ImportAttendanceRequest) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('machine_code', machine_code);

      const response = await apiClient.post('/api/v1/import/attendance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    },
    onSuccess: () => {
      // Invalidate attendance queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: [DAILY_ATTENDANCE_QUERY_KEY] });
    },
  });
}

