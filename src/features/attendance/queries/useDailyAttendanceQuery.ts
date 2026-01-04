import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const DAILY_ATTENDANCE_QUERY_KEY = ['attendance', 'daily'] as const;

// Frontend params (what the page will use)
export interface AttendanceQueryParams {
  month?: string;       // YYYY-MM format from the UI (legacy)
  start_date?: string;  // YYYY-MM-DD format
  end_date?: string;    // YYYY-MM-DD format
  class_id?: string;
  status?: string;
}

// Backend attendance record structure
interface BackendAttendanceRecord {
  id: number;
  student_nis: string;
  student_name?: string;
  class_name?: string;
  attendance_date?: string;  // Backend uses attendance_date
  date?: string;             // Or might use date
  status: string;
  check_in?: string;
  check_out?: string;
  notes?: string;
  recorded_by?: string;
}

// Frontend-friendly record
export interface AttendanceRecord {
  id: number;
  student_nis: string;
  student_name: string;
  class_name?: string;
  date: string;
  status: string;
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export function useDailyAttendanceQuery(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: [...DAILY_ATTENDANCE_QUERY_KEY, params],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      try {
        // Build API params
        const apiParams: Record<string, string> = {};

        // Use start_date and end_date directly if provided
        if (params?.start_date && params?.end_date) {
          apiParams.start_date = params.start_date;
          apiParams.end_date = params.end_date;
        } else if (params?.month) {
          // Fallback to month-based calculation for backward compatibility
          const [yearStr, monthStr] = params.month.split('-');
          const year = parseInt(yearStr);
          const month = parseInt(monthStr); // 1-12

          // Create dates
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0); // Last day of month provided

          // Format as YYYY-MM-DD using local time components
          const formatDate = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          apiParams.start_date = formatDate(startDate);
          apiParams.end_date = formatDate(endDate);
        }

        if (params?.class_id) {
          apiParams.class_id = params.class_id;
        }

        if (params?.status) {
          apiParams.status = params.status;
        }

        // Disable pagination to get all records
        apiParams.paginate = 'false';

        const response = await apiClient.get<any>('/api/v1/attendance/daily', { params: apiParams });

        // Extract array from response - handle multiple possible structures
        let records: BackendAttendanceRecord[] = [];
        if (Array.isArray(response)) {
          records = response;
        } else if (response.data && Array.isArray(response.data)) {
          records = response.data;
        } else if (response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response.attendance && Array.isArray(response.attendance)) {
          records = response.attendance;
        }

        // Transform to frontend format
        return records.map((record): AttendanceRecord => {
          // Handle date field - might be attendance_date or date
          const dateStr = record.attendance_date || record.date || '';

          return {
            id: record.id,
            student_nis: record.student_nis,
            student_name: record.student_name || 'Unknown',
            class_name: record.class_name,
            date: dateStr,
            status: (record.status || 'unknown').toLowerCase(),
            check_in: record.check_in,
            check_out: record.check_out,
            notes: record.notes,
          };
        });
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: false,
  });
}
