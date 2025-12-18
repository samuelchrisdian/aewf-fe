import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateAttendanceRequest, AttendanceRecord } from '@/types/api';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';
import { ATTENDANCE_SUMMARY_QUERY_KEY } from './useAttendanceSummaryQuery';

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAttendanceRequest }) => {
      const response = await apiClient.put<any>(`/api/v1/attendance/${id}`, data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};

