import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface PredictStudentResponse {
    success: boolean;
    message: string;
    data: {
        nis: string;
        risk_tier: string;
        risk_score: number;
        factors?: any;
        model_version?: string;
        data_quality?: {
            recording_completeness: number;
            is_low_quality: boolean;
            longest_gap_days: number;
        };
    };
}

/**
 * Hook to predict risk for a single student
 * GET /api/v1/models/predict/{nis}
 */
export function usePredictStudent() {
    return useMutation({
        mutationFn: async (nis: string): Promise<PredictStudentResponse> => {
            return await apiClient.get<PredictStudentResponse>(`/api/v1/models/predict/${nis}`);
        },
    });
}

