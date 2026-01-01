// Reports System React Query hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    AttendanceReportParams,
    AttendanceReportResponse,
    RiskReportParams,
    RiskReportResponse,
    ClassSummaryParams,
    ClassSummaryResponse,
    ExportParams,
} from '@/types/api';

export const REPORTS_QUERY_KEY = ['reports'] as const;

// Helper to normalize API response - handles various wrapper formats
function normalizeResponse<T>(response: any, reportType: string): T {
    console.log(`[Reports:${reportType}] Raw API response:`, response);

    let result = response;

    // If response has success wrapper: { success: true, data: {...} }
    if (response && response.success !== undefined && response.data) {
        console.log(`[Reports:${reportType}] Extracted from success wrapper`);
        result = response.data;
    }
    // If response has status wrapper: { status: "success", data: {...} }
    else if (response && response.status === 'success' && response.data) {
        console.log(`[Reports:${reportType}] Extracted from status wrapper`);
        result = response.data;
    }
    // If response has nested data property
    else if (response && response.data) {
        console.log(`[Reports:${reportType}] Extracted from data property`);
        result = response.data;
    }

    // Log the first item in any array to see field names
    if (result) {
        console.log(`[Reports:${reportType}] Result keys:`, Object.keys(result));

        // Log first student/class item to see its structure
        if (result.students && result.students.length > 0) {
            console.log(`[Reports:${reportType}] First student object:`, result.students[0]);
            console.log(`[Reports:${reportType}] First student keys:`, Object.keys(result.students[0]));
        }
        if (result.classes && result.classes.length > 0) {
            console.log(`[Reports:${reportType}] First class object:`, result.classes[0]);
            console.log(`[Reports:${reportType}] First class keys:`, Object.keys(result.classes[0]));
        }
        if (result.daily_breakdown && result.daily_breakdown.length > 0) {
            console.log(`[Reports:${reportType}] First attendance record:`, result.daily_breakdown[0]);
        }
        if (result.summary) {
            console.log(`[Reports:${reportType}] Summary:`, result.summary);
        }
    }

    return result as T;
}

// Attendance Report
export function useAttendanceReport(params?: AttendanceReportParams) {
    return useQuery({
        queryKey: [...REPORTS_QUERY_KEY, 'attendance', params],
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/reports/attendance', { params });
            return normalizeResponse<AttendanceReportResponse>(response, 'Attendance');
        },
        enabled: !!params?.start_date && !!params?.end_date,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Risk Report
export function useRiskReport(params?: RiskReportParams) {
    return useQuery({
        queryKey: [...REPORTS_QUERY_KEY, 'risk', params],
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/reports/risk', { params });
            return normalizeResponse<RiskReportResponse>(response, 'Risk');
        },
        staleTime: 1000 * 60 * 5,
    });
}

// Class Summary Report
export function useClassSummaryReport(params?: ClassSummaryParams) {
    return useQuery({
        queryKey: [...REPORTS_QUERY_KEY, 'class-summary', params],
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/reports/class-summary', { params });
            return normalizeResponse<ClassSummaryResponse>(response, 'ClassSummary');
        },
        enabled: !!params?.start_date && !!params?.end_date,
        staleTime: 1000 * 60 * 5,
    });
}

// Export mutations - these return blob data for file download
export function useExportAttendance() {
    return useMutation({
        mutationFn: async (params: ExportParams) => {
            const response = await apiClient.axios.get('/api/v1/export/attendance', {
                params,
                responseType: 'blob',
            });
            return response.data;
        },
    });
}

export function useExportStudents() {
    return useMutation({
        mutationFn: async (params?: { class_id?: string }) => {
            const response = await apiClient.axios.get('/api/v1/export/students', {
                params,
                responseType: 'blob',
            });
            return response.data;
        },
    });
}

export function useDownloadTemplate() {
    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.axios.get('/api/v1/export/template/master', {
                responseType: 'blob',
            });
            return response.data;
        },
    });
}

// Utility function to trigger file download from blob
export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
