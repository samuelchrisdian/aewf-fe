import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============ Types ============
export interface ModelInfo {
    status: 'available' | 'not_trained' | string;
    trained_at: string | null;
    model_type: string;
    threshold: number;
    description?: string;
    config?: {
        class_weight?: string;
        smote_applied?: boolean;
        target_auc_roc?: number;
        target_f1?: number;
        target_recall?: number;
    };
    feature_columns?: string[];
}

export interface ModelPerformance {
    recall: number;
    f1_score: number;
    auc_roc: number;
    precision?: number;
    accuracy?: number;
    threshold?: number;
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

// ============ Hooks ============

/**
 * Hook to fetch ML model information (metadata & configuration)
 * GET /api/v1/models/info
 *
 * Returns: Metadata statis, versi, algoritma, fitur, audit model
 * Called: Saat retrain untuk update trained_at
 */
export function useModelInfo() {
    return useQuery({
        queryKey: ML_QUERY_KEYS.modelInfo,
        queryFn: async (): Promise<ModelInfo> => {
            const response = await apiClient.get<any>('/api/v1/models/info');

            // Handle nested structure: response.data.ews_model
            const dataWrapper = response.data || response;
            const ewsModel = dataWrapper.ews_model || dataWrapper;

            return {
                status: ewsModel.status || 'not_trained',
                trained_at: ewsModel.trained_at || null,
                model_type: dataWrapper.model_type || ewsModel.model_type || 'Unknown',
                threshold: ewsModel.threshold || 0.5,
                description: dataWrapper.description,
                config: ewsModel.config,
                feature_columns: ewsModel.feature_columns,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
}

/**
 * Hook to fetch ML model performance metrics
 * GET /api/v1/models/performance
 *
 * Returns: Metrik evaluasi (Accuracy, Recall, F1, AUC), validasi performa
 * Called: Saat retrain untuk update metrics
 */
export function useModelPerformance() {
    return useQuery({
        queryKey: ML_QUERY_KEYS.modelPerformance,
        queryFn: async (): Promise<ModelPerformance> => {
            const response = await apiClient.get<any>('/api/v1/models/performance');

            // Handle nested structure: response.data.ews_model.metrics
            const dataWrapper = response.data || response;
            const ewsModel = dataWrapper.ews_model || dataWrapper;
            const metricsData = ewsModel.metrics || dataWrapper.metrics || dataWrapper;

            return {
                recall: metricsData.recall || 0,
                f1_score: metricsData.f1_score || metricsData.f1 || 0,
                auc_roc: metricsData.auc_roc || metricsData.auc || 0,
                precision: metricsData.precision || 0,
                accuracy: metricsData.accuracy,
                threshold: metricsData.threshold,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
}

/**
 * Hook to trigger model retraining
 * POST /api/v1/models/retrain
 *
 * After retrain, we refetch both:
 * - /models/info for updated metadata (trained_at, status)
 * - /models/performance for updated metrics (recall, f1, auc)
 */
export function useRetrainModel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<RetrainResponse> => {
            const response = await apiClient.post<any>('/api/v1/models/retrain');

            // Extract data from nested structure
            const data = response.data || response;

            return {
                success: data.success || response.success || true,
                message: data.message || response.message || 'Model trained successfully',
                trained_at: data.trained_at,
                metrics: data.metrics,
            };
        },
        onSuccess: () => {
            // Invalidate both queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.modelInfo });
            queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.modelPerformance });

            // Force immediate refetch of both endpoints
            queryClient.refetchQueries({ queryKey: ML_QUERY_KEYS.modelInfo });
            queryClient.refetchQueries({ queryKey: ML_QUERY_KEYS.modelPerformance });
        },
    });
}
