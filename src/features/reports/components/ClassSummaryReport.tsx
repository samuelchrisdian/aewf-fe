import React from 'react';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import type { ClassSummaryResponse } from '@/types/api';

interface ClassSummaryReportProps {
    data?: ClassSummaryResponse;
    isLoading?: boolean;
    error?: Error | null;
}

// Helper to safely get wali_kelas name (handles both string and object)
const getWaliKelasName = (waliKelas: any): string => {
    if (!waliKelas) return '-';
    if (typeof waliKelas === 'string') return waliKelas;
    if (typeof waliKelas === 'object' && waliKelas.name) return waliKelas.name;
    return '-';
};

// Helper to safely get number with fallback
const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};

// Extract field from class object - API uses different field names
const getClassField = (cls: any, field: string): any => {
    // Map expected field names to actual API field names
    const fieldMap: Record<string, string[]> = {
        'total_students': ['student_count', 'total_students', 'students_count'],
        'high_risk_count': ['at_risk_students', 'high_risk_count', 'high_risk'],
        'medium_risk_count': ['medium_risk_count', 'medium_risk'],
        'average_attendance': ['attendance_statistics.average_rate', 'average_attendance', 'attendance_rate'],
    };

    const possibleNames = fieldMap[field] || [field];
    for (const name of possibleNames) {
        if (name.includes('.')) {
            // Handle nested fields like attendance_statistics.average_rate
            const parts = name.split('.');
            let value = cls;
            for (const part of parts) {
                value = value?.[part];
            }
            if (value !== undefined) return value;
        } else if (cls[name] !== undefined) {
            return cls[name];
        }
    }
    return null;
};

export const ClassSummaryReport: React.FC<ClassSummaryReportProps> = ({
    data,
    isLoading = false,
    error = null,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Memuat ringkasan kelas...</span>
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

    if (!data || !data.classes || data.classes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                <p>Tidak ada data kelas untuk periode ini.</p>
                <p className="text-sm">Pilih rentang tanggal, lalu klik "Generate Report".</p>
            </div>
        );
    }

    // Calculate overall stats with safe number handling using correct field names
    const totalStudents = data.classes.reduce((sum, c: any) => sum + safeNumber(getClassField(c, 'total_students')), 0);
    const classesWithAttendance = data.classes.filter((c: any) => {
        const rate = getClassField(c, 'average_attendance');
        return typeof rate === 'number' && !isNaN(rate);
    });
    const avgAttendance = classesWithAttendance.length > 0
        ? classesWithAttendance.reduce((sum, c: any) => sum + safeNumber(getClassField(c, 'average_attendance')), 0) / classesWithAttendance.length
        : 0;
    const totalHighRisk = data.classes.reduce((sum, c: any) => sum + safeNumber(getClassField(c, 'high_risk_count')), 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ringkasan Per Kelas
                </h3>
                <p className="text-sm text-gray-500">
                    Periode: {data.period?.start_date || '-'} - {data.period?.end_date || '-'}
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{data.classes.length}</p>
                    <p className="text-sm text-blue-600">Total Kelas</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-indigo-700">{totalStudents}</p>
                    <p className="text-sm text-indigo-600">Total Siswa</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">
                        {avgAttendance > 0 ? `${avgAttendance.toFixed(1)}%` : '-'}
                    </p>
                    <p className="text-sm text-green-600">Rata-rata Kehadiran</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-700">{totalHighRisk}</p>
                    <p className="text-sm text-red-600">Siswa Berisiko</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wali Kelas</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Siswa</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kehadiran</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa Berisiko</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.classes.map((cls: any, index: number) => {
                            const studentCount = safeNumber(getClassField(cls, 'total_students'));
                            const attendance = safeNumber(getClassField(cls, 'average_attendance'));
                            const atRisk = safeNumber(getClassField(cls, 'high_risk_count'));

                            return (
                                <tr key={cls.class_id || cls.class_name || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {cls.class_name || cls.class_id || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {getWaliKelasName(cls.wali_kelas)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {studentCount}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-medium ${attendance >= 80 ? 'text-green-600' : attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {attendance > 0 ? `${attendance.toFixed(1)}%` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {atRisk > 0 ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {atRisk}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
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

export default ClassSummaryReport;
