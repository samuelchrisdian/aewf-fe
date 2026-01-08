import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const STUDENT_ATTENDANCE_QUERY_KEY = (nis?: string | null, month?: string | null, startDate?: string | null, endDate?: string | null) => ['attendance', 'student', nis, month, startDate, endDate] as const;

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
export function useStudentAttendanceQuery(
    nis?: string | null,
    params?: { month?: string; startDate?: string; endDate?: string }
) {
    const month = params?.month ?? null;
    const startDate = params?.startDate ?? null;
    const endDate = params?.endDate ?? null;

    return useQuery({
        queryKey: STUDENT_ATTENDANCE_QUERY_KEY(nis, month, startDate, endDate),
        queryFn: async (): Promise<AttendanceRecord[]> => {
            if (!nis) return [];

            try {
                const searchParams = new URLSearchParams();
                if (month) searchParams.set('month', month); // format YYYY-MM
                if (startDate) searchParams.set('start_date', startDate); // YYYY-MM-DD
                if (endDate) searchParams.set('end_date', endDate); // YYYY-MM-DD

                const qs = searchParams.toString();
                const url = qs
                    ? `/api/v1/attendance/student/${nis}?${qs}`
                    : `/api/v1/attendance/student/${nis}`;

                const response = await apiClient.get<AttendanceResponse | AttendanceRecord[]>(url);

                // Handle different response formats
                if (Array.isArray(response)) {
                    return response;
                }

                const data = response as AttendanceResponse;

                // Handle nested response: { data: { records: [...] } }
                const innerData = data.data as unknown as { records?: AttendanceRecord[] };
                if (innerData && Array.isArray(innerData.records)) {
                    return innerData.records;
                }

                // Fallback for other formats
                if (Array.isArray(data.data)) {
                    return data.data;
                }

                return data.attendance || data.records || [];
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
                return [];
            }
        },
        enabled: !!nis,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: false,
    });
}
