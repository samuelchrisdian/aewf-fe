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

export interface PredictError {
    nis: string;
    name?: string;
    error: string;
}

export interface PredictAllResponse {
    success: boolean;
    failed: PredictError[];
    totalStudents: number;
    successCount: number;
    errorCount: number;
}

export interface PredictResponse {
    success: boolean;
    message: string;
    nis: string;
    risk_tier?: string;
    risk_score?: number;
    factors?: any;
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

/**
 * Hook to recalculate risk for all students (batch operation)
 * POST /api/v1/risk/recalculate
 *
 * This is called after successful retrain to update all risk predictions in batch.
 * More efficient than calling /models/predict/{nis} for each student individually.
 */
export function useRecalculateRisk() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params?: { class_id?: string; student_nis?: string }): Promise<RecalculateResponse> => {
            const response = await apiClient.post<any>('/api/v1/risk/recalculate', params || {});

            const data = response.data || response;

            return {
                success: data.success !== false,
                message: data.message || 'Risk recalculated successfully',
                students_processed: data.students_processed || data.processed || 0,
                errors: data.errors || [],
            };
        },
        onSuccess: () => {
            // Invalidate risk-related queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['risk'] });
        },
    });
}

export interface RecalculateResponse {
    success: boolean;
    message: string;
    students_processed?: number;
    errors?: { nis: string; error: string }[];
}

/**
 * @deprecated Use useRecalculateRisk instead for batch risk recalculation.
 * Hook to predict risk for all students one by one (legacy - less efficient).
 * GET /api/v1/models/predict/{nis} for each student
 */
export function usePredictAllStudents() {
    return useMutation({
        mutationFn: async (): Promise<PredictAllResponse> => {
            // First, fetch all students
            const studentsResponse = await apiClient.get<any>('/api/v1/students', {
                params: { per_page: 9999 } // Get all students
            });

            const students = studentsResponse.data || [];
            const failed: PredictError[] = [];
            const totalStudents = students.length;

            // Call predict for each student
            const predictPromises = students.map(async (student: any) => {
                try {
                    const nis = student.nis || student.student_nis;
                    const name = student.name || student.student_name;

                    if (!nis) {
                        throw new Error('NIS not found');
                    }

                    await apiClient.get<any>(`/api/v1/models/predict/${nis}`);
                    return { success: true, nis, name };
                } catch (error: any) {
                    const nis = student.nis || student.student_nis || 'unknown';
                    const name = student.name || student.student_name;

                    // Extract error message from API response
                    let errorMessage = 'Unknown error';
                    if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    failed.push({
                        nis,
                        name,
                        error: errorMessage,
                    });

                    return { success: false, nis, name, error: errorMessage };
                }
            });

            await Promise.all(predictPromises);

            return {
                success: failed.length === 0,
                failed,
                totalStudents,
                successCount: totalStudents - failed.length,
                errorCount: failed.length,
            };
        },
    });
}

