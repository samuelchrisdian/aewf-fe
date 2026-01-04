import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DAILY_ATTENDANCE_QUERY_KEY } from './useDailyAttendanceQuery';
import { ATTENDANCE_SUMMARY_QUERY_KEY } from './useAttendanceSummaryQuery';

export interface ManualAttendanceInput {
  student_nis: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'permission';
  notes?: string;
}

// Map frontend status to backend expected values
const statusMap: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Permission', // Map excused to Permission
  sick: 'Sick',
  permission: 'Permission',
};

export const useManualAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualAttendanceInput) => {
      // Transform to backend expected format
      const apiData = {
        student_nis: data.student_nis,
        attendance_date: data.date, // Backend expects attendance_date, not date
        status: statusMap[data.status] || 'Present', // Capitalize status
        notes: data.notes || undefined,
      };

      const response = await apiClient.post<any>('/api/v1/attendance/manual', apiData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};
