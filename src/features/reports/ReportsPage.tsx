import React, { useState, useMemo } from 'react';
import { FileText, BarChart3, AlertTriangle, BookOpen, RefreshCw, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ReportFilters, ExportButton, AttendanceReport, RiskReport, ClassSummaryReport } from './components';
import {
    useAttendanceReport,
    useRiskReport,
    useClassSummaryReport,
    useExportAttendance,
    useExportStudents,
    useDownloadTemplate,
    downloadBlob,
} from './queries';
import type { AttendanceReportParams, RiskReportParams, ClassSummaryParams } from '@/types/api';

// Report type definitions
type ReportType = 'attendance' | 'risk' | 'class-summary';

const REPORT_TABS: { id: ReportType; label: string; icon: React.ElementType }[] = [
    { id: 'attendance', label: 'Kehadiran', icon: BarChart3 },
    { id: 'risk', label: 'Risiko Siswa', icon: AlertTriangle },
    { id: 'class-summary', label: 'Ringkasan Kelas', icon: BookOpen },
];

// Helper to get date string in YYYY-MM-DD format
const formatDateToISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Get first and last day of current month
const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: formatDateToISO(firstDay),
        endDate: formatDateToISO(lastDay),
    };
};

export const ReportsPage: React.FC = () => {
    const defaultDates = useMemo(() => getDefaultDates(), []);

    // State
    const [activeTab, setActiveTab] = useState<ReportType>('attendance');
    const [startDate, setStartDate] = useState(defaultDates.startDate);
    const [endDate, setEndDate] = useState(defaultDates.endDate);
    const [classId, setClassId] = useState('');
    const [shouldFetch, setShouldFetch] = useState(false);

    // Fetch classes for filter dropdown
    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const response = await apiClient.get<any>('/api/v1/classes');
            const classes = response.data || response.classes || response || [];
            return Array.isArray(classes) ? classes : [];
        },
        staleTime: 1000 * 60 * 10,
    });

    // Build params based on active tab
    const attendanceParams: AttendanceReportParams | undefined = shouldFetch && activeTab === 'attendance'
        ? { start_date: startDate, end_date: endDate, class_id: classId || undefined }
        : undefined;

    const riskParams: RiskReportParams | undefined = shouldFetch && activeTab === 'risk'
        ? { class_id: classId || undefined }
        : undefined;

    const classSummaryParams: ClassSummaryParams | undefined = shouldFetch && activeTab === 'class-summary'
        ? { start_date: startDate, end_date: endDate }
        : undefined;

    // Query hooks
    const attendanceReport = useAttendanceReport(attendanceParams);
    const riskReport = useRiskReport(riskParams);
    const classSummaryReport = useClassSummaryReport(classSummaryParams);

    // Export mutations
    const exportAttendance = useExportAttendance();
    const exportStudents = useExportStudents();
    const downloadTemplate = useDownloadTemplate();

    // Handle generate report
    const handleGenerateReport = () => {
        setShouldFetch(true);
    };

    // Handle export attendance
    const handleExportAttendance = async () => {
        try {
            const blob = await exportAttendance.mutateAsync({
                start_date: startDate,
                end_date: endDate,
                class_id: classId || undefined,
            });
            const filename = `attendance_report_${startDate}_${endDate}.xlsx`;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error('Failed to export attendance:', error);
        }
    };

    // Handle export students
    const handleExportStudents = async () => {
        try {
            const blob = await exportStudents.mutateAsync({ class_id: classId || undefined });
            downloadBlob(blob, 'students_export.xlsx');
        } catch (error) {
            console.error('Failed to export students:', error);
        }
    };

    // Handle download template
    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadTemplate.mutateAsync();
            downloadBlob(blob, 'master_data_template.xlsx');
        } catch (error) {
            console.error('Failed to download template:', error);
        }
    };

    // Get current report state
    const getCurrentReportState = () => {
        switch (activeTab) {
            case 'attendance':
                return attendanceReport;
            case 'risk':
                return riskReport;
            case 'class-summary':
                return classSummaryReport;
            default:
                return { data: undefined, isLoading: false, error: null };
        }
    };

    const currentReport = getCurrentReportState();
    const isLoading = currentReport.isLoading || exportAttendance.isPending || exportStudents.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    Laporan & Export
                </h1>
                <p className="text-gray-600 mt-1">
                    Generate dan export laporan kehadiran, risiko, dan ringkasan kelas
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b">
                    {REPORT_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setShouldFetch(false);
                                }}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${isActive
                                        ? 'border-primary text-primary bg-primary/5'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filters Section */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <ReportFilters
                                startDate={startDate}
                                endDate={endDate}
                                classId={classId}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                                onClassChange={setClassId}
                                classes={classesData?.map((c: any) => ({
                                    class_id: c.class_id || c.id,
                                    class_name: c.class_name || c.name,
                                })) || []}
                                isLoading={isLoading}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-6">
                    {activeTab === 'attendance' && (
                        <AttendanceReport
                            data={attendanceReport.data}
                            isLoading={attendanceReport.isLoading}
                            error={attendanceReport.error}
                        />
                    )}
                    {activeTab === 'risk' && (
                        <RiskReport
                            data={riskReport.data}
                            isLoading={riskReport.isLoading}
                            error={riskReport.error}
                        />
                    )}
                    {activeTab === 'class-summary' && (
                        <ClassSummaryReport
                            data={classSummaryReport.data}
                            isLoading={classSummaryReport.isLoading}
                            error={classSummaryReport.error}
                        />
                    )}
                </div>

                {/* Export Actions Footer */}
                {shouldFetch && currentReport.data && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex flex-wrap gap-3 justify-end">
                        {activeTab === 'attendance' && (
                            <ExportButton
                                onClick={handleExportAttendance}
                                isLoading={exportAttendance.isPending}
                                label="Export Kehadiran"
                            />
                        )}
                        <ExportButton
                            onClick={handleExportStudents}
                            isLoading={exportStudents.isPending}
                            label="Export Siswa"
                            variant="secondary"
                        />
                    </div>
                )}
            </div>

            {/* Quick Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Export Data Siswa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Download daftar seluruh siswa dalam format Excel.
                    </p>
                    <ExportButton
                        onClick={handleExportStudents}
                        isLoading={exportStudents.isPending}
                        label="Export Siswa"
                        variant="secondary"
                    />
                </div>
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Export Kehadiran</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Download rekap kehadiran dalam format Excel.
                    </p>
                    <ExportButton
                        onClick={handleExportAttendance}
                        isLoading={exportAttendance.isPending}
                        label="Export Kehadiran"
                    />
                </div>
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Template Import</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Download template Excel untuk import data master.
                    </p>
                    <ExportButton
                        onClick={handleDownloadTemplate}
                        isLoading={downloadTemplate.isPending}
                        label="Download Template"
                        variant="secondary"
                        icon="download"
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
