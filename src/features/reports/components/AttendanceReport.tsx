import React from 'react';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import type { AttendanceReportResponse } from '@/types/api';

interface AttendanceReportProps {
    data?: AttendanceReportResponse;
    isLoading?: boolean;
    error?: Error | null;
}

// Helper to safely get wali_kelas name (handles both string and object)
const getWaliKelasName = (waliKelas: any): string => {
    if (!waliKelas) return '';
    if (typeof waliKelas === 'string') return waliKelas;
    if (typeof waliKelas === 'object' && waliKelas.name) return waliKelas.name;
    return '';
};

// Helper to safely get number with fallback
const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
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

    // Support both field names: daily_breakdown (from API) or records
    const records = data?.daily_breakdown || data?.records || [];

    if (!data || records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p>Tidak ada data kehadiran untuk periode ini.</p>
                <p className="text-sm">Pilih rentang tanggal dan kelas, lalu klik "Generate Report".</p>
            </div>
        );
    }

    // Calculate summary stats with safe number handling
    const totalPresent = records.reduce((sum, r) => sum + safeNumber(r.present), 0);
    const totalAbsent = records.reduce((sum, r) => sum + safeNumber(r.absent), 0);
    const totalLate = records.reduce((sum, r) => sum + safeNumber(r.late), 0);
    const totalExcused = records.reduce((sum, r) => sum + safeNumber(r.sick) + safeNumber(r.excused), 0);
    const avgAttendance = safeNumber(data.summary?.average_attendance);

    const waliKelasDisplay = getWaliKelasName(data.wali_kelas);

    return (
        <div className="space-y-4">
            {/* Header Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Rekap Kehadiran Siswa
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Periode:</span>
                        <p className="font-medium">
                            {data.period?.start_date || '-'} - {data.period?.end_date || '-'}
                        </p>
                    </div>
                    {data.class_name && (
                        <div>
                            <span className="text-gray-500">Kelas:</span>
                            <p className="font-medium">{data.class_name}</p>
                        </div>
                    )}
                    {waliKelasDisplay && (
                        <div>
                            <span className="text-gray-500">Wali Kelas:</span>
                            <p className="font-medium">{waliKelasDisplay}</p>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-500">Total Siswa:</span>
                        <p className="font-medium">{safeNumber(data.summary?.total_students) || records.length}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">
                        {avgAttendance > 0 ? `${avgAttendance.toFixed(1)}%` : '-'}
                    </p>
                    <p className="text-xs text-green-600">Rata-rata Kehadiran</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{totalPresent}</p>
                    <p className="text-xs text-emerald-600">Hadir</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">{totalAbsent}</p>
                    <p className="text-xs text-red-600">Alpha</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{totalLate}</p>
                    <p className="text-xs text-yellow-600">Terlambat</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{totalExcused}</p>
                    <p className="text-xs text-blue-600">Izin/Sakit</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sakit</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records.map((record, index) => {
                            const attendanceRate = safeNumber(record.attendance_rate);
                            return (
                                <tr key={record.student_nis || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.student_nis || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{record.student_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{record.class_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{safeNumber(record.present)}</td>
                                    <td className="px-4 py-3 text-sm text-center text-blue-600">{safeNumber(record.sick)}</td>
                                    <td className="px-4 py-3 text-sm text-center text-purple-600">{safeNumber(record.excused) + safeNumber(record.permission)}</td>
                                    <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">{safeNumber(record.absent)}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className={`font-medium ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {attendanceRate > 0 ? `${attendanceRate.toFixed(1)}%` : '-'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceReport;
