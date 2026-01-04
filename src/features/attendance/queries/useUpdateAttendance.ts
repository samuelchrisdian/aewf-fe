import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';
import { ATTENDANCE_SUMMARY_QUERY_KEY } from './useAttendanceSummaryQuery';

export interface UpdateAttendanceInput {
  status?: 'present' | 'absent' | 'late' | 'sick' | 'permission';
  notes?: string;
}

// Map frontend status to backend expected values
const statusMap: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  sick: 'Sick',
  permission: 'Permission',
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAttendanceInput }) => {
      // Transform to backend expected format
      const apiData: Record<string, string | undefined> = {};

      if (data.status) {
        apiData.status = statusMap[data.status] || data.status;
      }
      if (data.notes !== undefined) {
        apiData.notes = data.notes;
      }

      const response = await apiClient.put<any>(`/api/v1/attendance/${id}`, apiData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};
