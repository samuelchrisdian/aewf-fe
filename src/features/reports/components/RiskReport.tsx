import React from 'react';
import { Loader2, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import type { RiskReportResponse } from '@/types/api';

interface RiskReportProps {
    data?: RiskReportResponse;
    isLoading?: boolean;
    error?: Error | null;
}

// Helper to safely get number with fallback
const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};

// Extract field from student object - API uses different field names
const getStudentField = (student: any, field: string): any => {
    // Map expected field names to actual API field names
    const fieldMap: Record<string, string[]> = {
        'student_nis': ['nis', 'student_nis', 'id'],
        'student_name': ['name', 'student_name', 'nama'],
        'class_name': ['class_id', 'class_name', 'kelas'],
        'risk_level': ['risk_level', 'level'],
        'risk_score': ['risk_score', 'score'],
        'absent_count': ['absent_count', 'factors.absent_count', 'absences'],
        'late_count': ['late_count', 'factors.late_count', 'lates'],
        'last_calculated': ['last_updated', 'last_calculated', 'updated_at'],
    };

    const possibleNames = fieldMap[field] || [field];
    for (const name of possibleNames) {
        if (name.includes('.')) {
            // Handle nested fields like factors.absent_count
            const parts = name.split('.');
            let value = student;
            for (const part of parts) {
                value = value?.[part];
            }
            if (value !== undefined) return value;
        } else if (student[name] !== undefined) {
            return student[name];
        }
    }
    return null;
};

const getRiskBadgeClass = (level: string | undefined | null): string => {
    if (!level) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (level.toLowerCase()) {
        case 'critical':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const RiskReport: React.FC<RiskReportProps> = ({
    data,
    isLoading = false,
    error = null,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Memuat laporan risiko...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
                <AlertCircle className="w-8 h-8 mb-2" />
                <span className="font-medium">Gagal memuat laporan</span>
                <span className="text-sm text-gray-500 mt-1">{error.message || 'Terjadi kesalahan pada server'}</span>
            </div>
        );
    }

    // Support both field names: students (from API) or at_risk_students
    const students = data?.students || data?.at_risk_students || [];

    if (!data || students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mb-3 opacity-50 text-green-500" />
                <p className="text-green-600 font-medium">Tidak ada siswa berisiko tinggi.</p>
                <p className="text-sm">Semua siswa dalam kondisi baik.</p>
            </div>
        );
    }

    // Extract summary - API uses high_risk/medium_risk/low_risk
    const summary = {
        total_high_risk: safeNumber(data.summary?.high_risk ?? data.summary?.total_high_risk),
        total_medium_risk: safeNumber(data.summary?.medium_risk ?? data.summary?.total_medium_risk),
        total_low_risk: safeNumber(data.summary?.low_risk ?? data.summary?.total_low_risk),
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Laporan Siswa Berisiko
                </h3>
                <p className="text-sm text-gray-500">
                    Generated: {data.generated_at ? new Date(data.generated_at).toLocaleString('id-ID') : '-'}
                    {' • '}Total: {students.length} siswa
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-700">{summary.total_high_risk}</p>
                    <p className="text-sm text-red-600">Risiko Tinggi/Kritis</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-700">{summary.total_medium_risk}</p>
                    <p className="text-sm text-yellow-600">Risiko Sedang</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">{summary.total_low_risk}</p>
                    <p className="text-sm text-green-600">Risiko Rendah</p>
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
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Level Risiko</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student: any, index: number) => {
                            const nis = getStudentField(student, 'student_nis') || '-';
                            const name = getStudentField(student, 'student_name') || '-';
                            const className = getStudentField(student, 'class_name') || '-';
                            const riskLevel = getStudentField(student, 'risk_level');
                            const riskScore = safeNumber(getStudentField(student, 'risk_score'));

                            return (
                                <tr key={nis + '-' + index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{nis}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{className}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeClass(riskLevel)}`}>
                                            {(riskLevel || 'unknown').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center font-medium">{riskScore}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RiskReport;
