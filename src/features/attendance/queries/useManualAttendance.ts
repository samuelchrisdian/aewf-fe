import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ManualAttendanceRequest, AttendanceRecord } from '@/types/api';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';
import { ATTENDANCE_SUMMARY_QUERY_KEY } from './useAttendanceSummaryQuery';

export const useManualAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualAttendanceRequest) => {
      const response = await apiClient.post<any>('/api/v1/attendance/manual', data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};

