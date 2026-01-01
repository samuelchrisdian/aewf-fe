import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Users } from 'lucide-react';

interface HighRiskStudent {
    student_nis: string;
    student_name: string;
    class_id?: string;
    class_name?: string;
    risk_level: string;
    risk_score: number;
    probability?: number;
}

interface RiskListResponse {
    data?: HighRiskStudent[];
    students?: HighRiskStudent[];
}

const HighRiskStudentsList: React.FC = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['risk', 'high-risk-list'],
        queryFn: async (): Promise<HighRiskStudent[]> => {
            const response = await apiClient.get<RiskListResponse>('/api/v1/risk/list?level=high');
            const students = (response as any).data || (response as any).students || response || [];

            // Sort by risk score descending and take top 5
            return (Array.isArray(students) ? students : [])
                .sort((a, b) => (b.risk_score || b.probability || 0) - (a.risk_score || a.probability || 0))
                .slice(0, 5);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: 1,
    });

    const getRiskBadgeColor = (level: string) => {
        const normalized = level?.toLowerCase();
        if (normalized === 'critical' || normalized === 'high' || normalized === 'red') {
            return 'bg-red-100 text-red-700';
        }
        if (normalized === 'medium' || normalized === 'yellow') {
            return 'bg-yellow-100 text-yellow-700';
        }
        return 'bg-green-100 text-green-700';
    };

    const formatScore = (student: HighRiskStudent) => {
        const score = student.risk_score || student.probability || 0;
        // If score is decimal (0-1), convert to percentage
        return score > 1 ? score.toFixed(0) : (score * 100).toFixed(0);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        High Risk Students
                    </h3>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Unable to load risk data</span>
                </div>
            </div>
        );
    }

    const students = data || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    High Risk Students
                </h3>
                <Link
                    to="/alerts"
                    className="text-sm text-primary font-medium hover:text-primary/80 flex items-center"
                >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            <div className="divide-y divide-gray-100">
                {students.length > 0 ? (
                    students.map((student) => (
                        <Link
                            key={student.student_nis}
                            to={`/alerts/${student.student_nis}`}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
                                    {(student.student_name || 'N').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{student.student_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {student.class_name || student.class_id || 'N/A'} • NIS: {student.student_nis}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-red-600">{formatScore(student)}%</p>
                                    <p className="text-xs text-gray-500">Risk Score</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(student.risk_level)}`}>
                                    {student.risk_level?.toUpperCase() || 'HIGH'}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-2 text-green-300" />
                        <p className="font-medium text-gray-600">No high-risk students</p>
                        <p className="text-xs text-gray-400 mt-1">All students are doing well!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighRiskStudentsList;
