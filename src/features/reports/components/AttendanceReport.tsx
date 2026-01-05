import React from 'react';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import type { AttendanceReportResponse } from '@/types/api';

interface DailyBreakdownItem {
    date: string;
    present: number;
    late: number;
    absent: number;
    sick: number;
    permission: number;
}

interface AttendanceReportProps {
    data?: AttendanceReportResponse & {
        statistics?: {
            total_school_days?: number;
            present_count?: number;
            late_count?: number;
            absent_count?: number;
            sick_count?: number;
            permission_count?: number;
            average_attendance_rate?: number;
        };
    };
    isLoading?: boolean;
    error?: Error | null;
}

// Helper to safely get number with fallback
const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};

// Format date from API response (e.g., "Mon, 01 Sep 2025 00:00:00 GMT" -> "01 Sep 2025")
const formatDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
    data,
    isLoading = false,
    error = null,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Memuat laporan...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>Error: {error.message || 'Gagal memuat laporan'}</span>
            </div>
        );
    }

    // Get daily breakdown from API response
    const dailyBreakdown: DailyBreakdownItem[] = (data?.daily_breakdown as any) || [];

    if (!data || dailyBreakdown.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mb-3 opacity-50" />
                <p>Tidak ada data kehadiran untuk periode ini.</p>
                <p className="text-sm">Pilih rentang tanggal dan kelas, lalu klik "Generate Report".</p>
            </div>
        );
    }

    // Calculate totals from daily breakdown
    const totalPresent = dailyBreakdown.reduce((sum, d) => sum + safeNumber(d.present), 0);
    const totalLate = dailyBreakdown.reduce((sum, d) => sum + safeNumber(d.late), 0);
    const totalAbsent = dailyBreakdown.reduce((sum, d) => sum + safeNumber(d.absent), 0);
    const totalSick = dailyBreakdown.reduce((sum, d) => sum + safeNumber(d.sick), 0);
    const totalPermission = dailyBreakdown.reduce((sum, d) => sum + safeNumber(d.permission), 0);
    const totalSchoolDays = data.statistics?.total_school_days || dailyBreakdown.length;

    return (
        <div className="space-y-4">
            {/* Header Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Rekap Kehadiran Harian
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Periode:</span>
                        <p className="font-medium">
                            {data.period?.start_date || '-'} s/d {data.period?.end_date || '-'}
                        </p>
                    </div>
                    {data.class_name && (
                        <div>
                            <span className="text-gray-500">Kelas:</span>
                            <p className="font-medium">{data.class_name}</p>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-500">Total Hari Sekolah:</span>
                        <p className="font-medium">{totalSchoolDays} hari</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Generated:</span>
                        <p className="font-medium text-xs">{data.generated_at ? new Date(data.generated_at).toLocaleString('id-ID') : '-'}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{totalPresent}</p>
                    <p className="text-xs text-emerald-600">Total Hadir</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{totalLate}</p>
                    <p className="text-xs text-yellow-600">Total Terlambat</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{totalSick}</p>
                    <p className="text-xs text-blue-600">Total Sakit</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-700">{totalPermission}</p>
                    <p className="text-xs text-purple-600">Total Izin</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">{totalAbsent}</p>
                    <p className="text-xs text-red-600">Total Alpha</p>
                </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Terlambat</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sakit</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dailyBreakdown.map((record, index) => {
                            const present = safeNumber(record.present);
                            const late = safeNumber(record.late);
                            const sick = safeNumber(record.sick);
                            const permission = safeNumber(record.permission);
                            const absent = safeNumber(record.absent);
                            const total = present + late + sick + permission + absent;

                            return (
                                <tr key={record.date || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{present}</td>
                                    <td className="px-4 py-3 text-sm text-center text-yellow-600 font-medium">{late}</td>
                                    <td className="px-4 py-3 text-sm text-center text-blue-600">{sick}</td>
                                    <td className="px-4 py-3 text-sm text-center text-purple-600">{permission}</td>
                                    <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">{absent}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-700 font-medium">{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                            <td className="px-4 py-3 text-sm text-center text-green-700 font-bold">{totalPresent}</td>
                            <td className="px-4 py-3 text-sm text-center text-yellow-700 font-bold">{totalLate}</td>
                            <td className="px-4 py-3 text-sm text-center text-blue-700 font-bold">{totalSick}</td>
                            <td className="px-4 py-3 text-sm text-center text-purple-700 font-bold">{totalPermission}</td>
                            <td className="px-4 py-3 text-sm text-center text-red-700 font-bold">{totalAbsent}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">
                                {totalPresent + totalLate + totalSick + totalPermission + totalAbsent}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default AttendanceReport;
