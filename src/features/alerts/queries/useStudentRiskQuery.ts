import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const STUDENT_RISK_QUERY_KEY = (nis?: string | null) => ['risk', 'student', nis] as const;

// Backend response structure for /api/v1/risk/<nis>
interface BackendRiskProfile {
    student_nis: string;
    student_name?: string;
    class_name?: string;
    risk_tier?: string;
    risk_level?: string;
    risk_score?: number;
    risk_probability?: number;
    probability?: number;
    explanation_text?: string;
    model_version?: string;
    factors?: {
        absent_ratio?: number;
        absent_count?: number;
        late_ratio?: number;
        late_count?: number;
        trend_score?: number;
        total_days?: number;
        attendance_ratio?: number;
        present_count?: number;
        permission_count?: number;
        sick_count?: number;
        is_rule_triggered?: boolean;
        recording_completeness?: number;
        longest_gap_days?: number;
    };
    data_quality?: {
        recording_completeness: number;
        is_low_quality: boolean;
        longest_gap_days: number;
    };
    prediction_method?: string;
    is_rule_overridden?: boolean;
    model_threshold?: number;
}

// Backend response structure for /api/v1/risk/list
interface BackendRiskListItem {
    student_nis: string;
    student_name: string;
    class_id?: string;
    class_name?: string;
    risk_level: string;
    risk_score: number;
    probability?: number;
    factors?: string[];
}

// Frontend model
export interface StudentRiskProfile {
    nis: string;
    name?: string;
    class_name?: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    probability: number;
    explanation_text?: string;
    model_version?: string;
    factors: {
        absent_ratio: number;
        absent_count: number;
        late_ratio: number;
        late_count: number;
        trend_score: number;
        total_days: number;
        attendance_ratio: number;
        present_count: number;
        permission_count: number;
        sick_count: number;
        is_rule_triggered: boolean;
        recording_completeness?: number;
        longest_gap_days?: number;
    };
    data_quality?: {
        recording_completeness: number;
        is_low_quality: boolean;
        longest_gap_days: number;
    };
    prediction_method: string;
    is_rule_overridden: boolean;
}

function normalizeRiskLevel(tier: string): StudentRiskProfile['risk_level'] {
    const normalized = (tier || '').toLowerCase().replace('_risk', '');
    if (normalized === 'red' || normalized === 'high' || normalized === 'critical' || normalized.includes('high') || normalized.includes('critical')) {
        return 'high';
    } else if (normalized === 'yellow' || normalized === 'medium' || normalized.includes('medium')) {
        return 'medium';
    }
    return 'low';
}

export function useStudentRiskQuery(nis?: string | null) {
    return useQuery({
        queryKey: STUDENT_RISK_QUERY_KEY(nis),
        queryFn: async (): Promise<StudentRiskProfile | null> => {
            if (!nis) return null;

            // Try the individual endpoint first
            try {
                const response = await apiClient.get<BackendRiskProfile>(`/api/v1/risk/${nis}`);
                const data = (response as any).data || response;

                if (data && (data.risk_tier || data.risk_level || data.risk_score)) {
                    return {
                        nis: data.student_nis || nis,
                        name: data.student_name,
                        class_name: data.class_name,
                        risk_level: normalizeRiskLevel(data.risk_tier || data.risk_level || ''),
                        risk_score: data.risk_score || data.risk_probability || data.probability || 0,
                        probability: data.risk_probability || data.probability || data.risk_score || 0,
                        explanation_text: data.explanation_text,
                        model_version: data.model_version,
                        factors: {
                            absent_ratio: data.factors?.absent_ratio || 0,
                            absent_count: data.factors?.absent_count || 0,
                            late_ratio: data.factors?.late_ratio || 0,
                            late_count: data.factors?.late_count || 0,
                            trend_score: data.factors?.trend_score || 0,
                            total_days: data.factors?.total_days || 0,
                            attendance_ratio: data.factors?.attendance_ratio || 0,
                            present_count: data.factors?.present_count || 0,
                            permission_count: data.factors?.permission_count || 0,
                            sick_count: data.factors?.sick_count || 0,
                            is_rule_triggered: data.factors?.is_rule_triggered || data.is_rule_overridden || false,
                            recording_completeness: data.factors?.recording_completeness ?? data.data_quality?.recording_completeness,
                            longest_gap_days: data.factors?.longest_gap_days ?? data.data_quality?.longest_gap_days,
                        },
                        data_quality: data.data_quality,
                        prediction_method: data.prediction_method || 'ml',
                        is_rule_overridden: data.is_rule_overridden || false,
                    };
                }
            } catch (error) {
                console.warn('Individual risk endpoint failed, trying list endpoint as fallback:', error);
            }

            // Fallback: Try to find the student in the risk list
            try {
                const listResponse = await apiClient.get<{ data: BackendRiskListItem[] }>('/api/v1/risk/list');
                const listData = (listResponse as any).data || listResponse;
                const students = Array.isArray(listData) ? listData : (listData?.data || []);

                const studentRisk = students.find((s: BackendRiskListItem) => s.student_nis === nis);

                if (studentRisk) {
                    const score = studentRisk.risk_score || studentRisk.probability || 0;
                    return {
                        nis: studentRisk.student_nis,
                        name: studentRisk.student_name,
                        class_name: studentRisk.class_name,
                        risk_level: normalizeRiskLevel(studentRisk.risk_level),
                        risk_score: score,
                        probability: score,
                        explanation_text: undefined,
                        factors: {
                            absent_ratio: 0,
                            absent_count: 0,
                            late_ratio: 0,
                            late_count: 0,
                            trend_score: 0,
                            total_days: 0,
                            attendance_ratio: 0,
                            present_count: 0,
                            permission_count: 0,
                            sick_count: 0,
                            is_rule_triggered: score > 0.7,
                        },
                        prediction_method: 'ml',
                        is_rule_overridden: false,
                    };
                }
            } catch (error) {
                console.error('Both risk endpoints failed:', error);
            }

            return null;
        },
        enabled: !!nis,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: false,
    });
}
