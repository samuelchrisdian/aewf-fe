import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============ Types ============
export interface ModelInfo {
    status: 'available' | 'not_trained';
    trained_at: string | null;
    model_type: string;
    threshold: number;
    feature_count?: number;
}

export interface ModelPerformance {
    recall: number;
    f1_score: number;
    auc_roc: number;
    precision?: number;
    accuracy?: number;
    feature_importance?: Record<string, number>;
}

export interface RetrainResponse {
    success: boolean;
    message: string;
    trained_at?: string;
    metrics?: ModelPerformance;
}

// ============ Query Keys ============
export const ML_QUERY_KEYS = {
    modelInfo: ['ml', 'model-info'] as const,
    modelPerformance: ['ml', 'model-performance'] as const,
};

// ============ API Response Wrappers ============
interface ApiModelInfoResponse {
    status?: string;
    data?: ModelInfo;
    model_type?: string;
    trained_at?: string;
    threshold?: number;
}

interface ApiModelPerformanceResponse {
    data?: ModelPerformance;
    metrics?: ModelPerformance;
    recall?: number;
    f1_score?: number;
    auc_roc?: number;
}

// ============ Hooks ============

/**
 * Hook to fetch ML model information
 * GET /api/v1/models/info
 */
export function useModelInfo() {
    return useQuery({
        queryKey: ML_QUERY_KEYS.modelInfo,
        queryFn: async (): Promise<ModelInfo> => {
            const response = await apiClient.get<ApiModelInfoResponse>('/api/v1/models/info');

            // Handle various response structures
            const data = (response as any).data || response;

            return {
                status: data.status || 'not_trained',
                trained_at: data.trained_at || null,
                model_type: data.model_type || 'Unknown',
                threshold: data.threshold || 0.5,
                feature_count: data.feature_count,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
}

/**
 * Hook to fetch ML model performance metrics
 * GET /api/v1/models/performance
 */
export function useModelPerformance() {
    return useQuery({
        queryKey: ML_QUERY_KEYS.modelPerformance,
        queryFn: async (): Promise<ModelPerformance> => {
            const response = await apiClient.get<ApiModelPerformanceResponse>('/api/v1/models/performance');

            // Handle various response structures
            const data = (response as any).data || (response as any).metrics || response;

            return {
                recall: data.recall || 0,
                f1_score: data.f1_score || data.f1 || 0,
                auc_roc: data.auc_roc || data.auc || 0,
                precision: data.precision,
                accuracy: data.accuracy,
                feature_importance: data.feature_importance,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
}

/**
 * Hook to trigger model retraining
 * POST /api/v1/models/retrain
 */
export function useRetrainModel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<RetrainResponse> => {
            const response = await apiClient.post<RetrainResponse>('/api/v1/models/retrain');
            return response;
        },
        onSuccess: () => {
            // Invalidate model queries to refetch latest data
            queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.modelInfo });
            queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.modelPerformance });
        },
    });
}
