// Alerts models (placeholder)
// Define shapes, mappers, or helper functions related to alerts here.

interface RawAlert {
    id: string;
    studentName?: string;
    name?: string;
    nis?: string | number;
    studentNis?: string | number;
    class?: string;
    studentClass?: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    probability: number;
}

export interface Student {
    id: string;
    name: string;
    nis: string | number;
    class: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    probability: number;
}

export interface StudentDetail extends Student {
    attendanceStats?: { present: number; absent: number; late?: number; excuse?: number };
    triggeredRules?: string[];
    weeklyTrend?: number[];
    recommendations?: string[];
}

export function mapAlertToStudentModel(raw: RawAlert): Student {
    return {
        id: raw.id,
        name: raw.studentName || raw.name || '',
        nis: raw.nis || raw.studentNis || '',
        class: raw.class || raw.studentClass || '',
        riskLevel: raw.riskLevel,
        probability: raw.probability,
    };
}
