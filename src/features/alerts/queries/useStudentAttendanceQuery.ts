import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const STUDENT_ATTENDANCE_QUERY_KEY = (nis?: string | null) => ['attendance', 'student', nis] as const;

// Attendance record from backend
export interface AttendanceRecord {
    id: number;
    date: string;
    attendance_date?: string;
    status: 'Present' | 'Absent' | 'Late' | 'Permission' | 'Sick' | string;
    check_in?: string;
    check_out?: string;
    notes?: string;
}

interface AttendanceResponse {
    data?: AttendanceRecord[];
    attendance?: AttendanceRecord[];
    records?: AttendanceRecord[];
}

export function useStudentAttendanceQuery(nis?: string | null) {
    return useQuery({
        queryKey: STUDENT_ATTENDANCE_QUERY_KEY(nis),
        queryFn: async (): Promise<AttendanceRecord[]> => {
            if (!nis) return [];

            try {
                const response = await apiClient.get<AttendanceResponse | AttendanceRecord[]>(`/api/v1/attendance/student/${nis}`);

                // Handle different response formats
                if (Array.isArray(response)) {
                    return response;
                }

                const data = response as AttendanceResponse;
                return data.data || data.attendance || data.records || [];
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
                return [];
            }
        },
        enabled: !!nis,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
}
