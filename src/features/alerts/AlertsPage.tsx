import React, { useMemo, useCallback, useState } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { useRiskListQuery, useAlertAction, useAlertsQuery } from './queries';
import { useRecalculateRisk } from '@/features/ml';
import { AcknowledgeModal } from './components/AcknowledgeModal';
import { useUpdateStudent } from '../students/queries';
import { notify } from '@/lib/notifications';
import { apiClient } from '@/lib/api-client';
import type { RiskStudent } from '@/types/api';

const AlertsPage = (): React.ReactElement => {
    const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [search, setSearch] = useState('');
    const [isAckModalOpen, setIsAckModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<RiskStudent | null>(null);

    const { data: students = [], isLoading: loading } = useRiskListQuery({
        level: filter !== 'ALL' ? (filter.toLowerCase() as any) : undefined,
        per_page: 9999,
    });

    // Fetch pending alerts to determine which students can be acknowledged
    const { data: pendingAlerts = [] } = useAlertsQuery({ status: 'pending', per_page: 9999 });

    // Create a set of student NIS with pending alerts for quick lookup
    const pendingAlertNisSet = useMemo(() => {
        return new Set(pendingAlerts.map((a: any) => String(a.student_nis)));
    }, [pendingAlerts]);

    const alertAction = useAlertAction();
    const updateStudent = useUpdateStudent();
    const recalculateRisk = useRecalculateRisk();

    // Handler to open acknowledge modal
    const handleAckClick = useCallback((student: RiskStudent) => {
        setSelectedStudent(student);
        setIsAckModalOpen(true);
    }, []);

    // Handler to close acknowledge modal
    const handleCloseModal = useCallback(() => {
        setIsAckModalOpen(false);
        setSelectedStudent(null);
    }, []);

    // Handler for modal submit
    const handleAckSubmit = async (data: { phone: string; action: string; notes: string; followUpDate?: string }) => {
        if (!selectedStudent) return;

        try {
            // Fetch pending alerts and locate the student's latest alert
            const alertsData = await apiClient.get<{ alerts?: any[]; data?: any[] }>(
                '/api/v1/risk/alerts',
                { params: { status: 'pending', per_page: 9999 } }
            );
            const alertsList = alertsData.alerts || alertsData.data || [];

            const studentAlerts = alertsList.filter((a: any) => String(a.student_nis) === String(selectedStudent.nis));
            if (studentAlerts.length === 0) {
                throw new Error('No pending alert found for this student');
            }

            // Choose the most recent alert by created_at
            const alert = studentAlerts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const alertId = alert.id;
            const classIdFromAlert = alert.class_id || selectedStudent.class_id;

            // Update student's parent phone and class_id from alert
            await updateStudent.mutateAsync({
                nis: selectedStudent.nis,
                data: {
                    name: selectedStudent.name,
                    class_id: String(classIdFromAlert),
                    parent_phone: data.phone,
                },
            });

            // Create alert action
            await alertAction.mutateAsync({
                alertId,
                action: {
                    action: data.action as any,
                    notes: data.notes,
                    follow_up_date: data.followUpDate,
                },
            });

            // Targeted risk recalculation for the acknowledged student
            await recalculateRisk.mutateAsync({ student_nis: String(selectedStudent.nis) });

            // Close modal
            handleCloseModal();

            // Show success notification
            notify.success(`Alert untuk ${selectedStudent.name} berhasil di-acknowledge`);

            // Format phone for WhatsApp (remove non-digits and ensure it starts correctly)
            let waPhone = data.phone.replace(/\D/g, '');
            if (waPhone.startsWith('0')) {
                waPhone = '62' + waPhone.substring(1);
            } else if (!waPhone.startsWith('62')) {
                waPhone = '62' + waPhone;
            }

            // Small delay to let notification show before redirect
            setTimeout(() => {
                // Redirect to WhatsApp with pre-filled message
                const message = encodeURIComponent(
                    `Halo, saya dari sekolah ingin menginformasikan mengenai ${selectedStudent.name} (${selectedStudent.nis}). ${data.notes}`
                );
                window.open(`https://wa.me/${waPhone}?text=${message}`, '_blank');
            }, 500); // 500ms delay to show notification

        } catch (error: any) {
            console.error('Error acknowledging alert:', error);
            notify.error(error.message || 'Gagal melakukan acknowledge. Silakan coba lagi.');
        }
    };

    const getRiskColor = useCallback((level: string) => {
        const normalized = level?.toUpperCase();
        if (normalized === 'CRITICAL' || normalized === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
        if (normalized === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Student',
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {String(student.name || '').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">NIS: {student.nis} • {student.class_name || 'N/A'}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'risk_level',
            header: 'Risk Level',
            cell: ({ getValue }) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(getValue())}`}>
                    {String(getValue()).toUpperCase()}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'risk_score',
            header: 'Risk Score',
            cell: ({ getValue }) => {
                const score = getValue() as number;
                // If score is > 1 (e.g. 85), use it directly. If <= 1 (e.g. 0.85), multiply by 100
                const percentage = score > 1 ? score : score * 100;
                return (
                    <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className={`h-2 rounded-full ${score > 0.7 && percentage > 70 ? 'bg-red-500' : (score > 0.4 && percentage > 40) ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <span>{percentage.toFixed(0)}%</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <Link to={`/alerts/${student.nis}`} className="text-primary hover:text-primary/80 flex items-center text-sm font-medium">
                            <Eye className="w-4 h-4 mr-1" /> View
                        </Link>
                        {/* Only show Acknowledge button for students with pending alerts */}
                        {pendingAlertNisSet.has(String(student.nis)) && (
                            <button
                                onClick={() => handleAckClick(student)}
                                className="text-gray-400 hover:text-green-600 flex items-center text-sm font-medium transition-colors"
                            >
                                <CheckCircle className="w-4 h-4 mr-1" /> Ack
                            </button>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
    ], [getRiskColor, handleAckClick, pendingAlertNisSet]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prioritized Alerts</h1>
                    <p className="text-gray-500">Manage student interventions based on risk factors.</p>
                    <div className="mt-3">
                        <div className="relative text-gray-400">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch && setSearch(e.target.value); }}
                                placeholder="Search name, NIS, or class..."
                                className="w-full md:w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={() => setFilter && setFilter('ALL')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
                    <button onClick={() => setFilter && setFilter('HIGH')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'HIGH' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>High Risk</button>
                    <button onClick={() => setFilter && setFilter('MEDIUM')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500 hover:bg-gray-50'}`}>Medium Risk</button>
                    <button onClick={() => setFilter && setFilter('LOW')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'LOW' ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>Low Risk</button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={students}
                    initialState={{ pagination: { pageSize: 10 }, sorting: [{ id: 'probability', desc: true }] }}
                    noDataMessage="No students found matching the filter."
                />
            </div>

            {/* Acknowledge Modal */}
            <AcknowledgeModal
                isOpen={isAckModalOpen}
                onClose={handleCloseModal}
                student={selectedStudent}
                onSubmit={handleAckSubmit}
                isProcessing={updateStudent.isPending || alertAction.isPending}
            />
        </div>
    );
};

export default AlertsPage;
