import React from 'react';
import { useModelInfo, useModelPerformance, useRetrainModel } from '@/features/ml';
import { Brain, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { notify } from '@/lib/notifications';

const ModelStatusCard: React.FC = () => {
    // Separate concerns:
    // - modelInfo: metadata statis (versi, algoritma, fitur, audit)
    // - modelPerformance: metrik evaluasi (accuracy, recall, f1, auc)
    const { data: modelInfo, isLoading: infoLoading, error: infoError } = useModelInfo();
    const { data: modelPerformance, isLoading: perfLoading } = useModelPerformance();
    const { mutate: retrain, isPending: isRetraining } = useRetrainModel();

    const isLoading = infoLoading || perfLoading;
    const hasError = infoError;

    const handleRetrain = async () => {
        const confirmed = await notify.confirm(
            'Proses ini mungkin memakan waktu beberapa menit.',
            {
                title: 'Melatih Ulang Model ML',
                confirmText: 'Mulai Training',
                cancelText: 'Batal',
                type: 'info'
            }
        );

        if (confirmed) {
            retrain(undefined, {
                onSuccess: () => {
                    notify.success('Model berhasil dilatih! Metrics telah diperbarui.');
                },
                onError: (error: any) => {
                    notify.error(error.message || 'Gagal melatih model');
                }
            });
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Belum dilatih';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'available'
            ? 'text-green-600 bg-green-100'
            : 'text-yellow-600 bg-yellow-100';
    };

    const getMetricStatus = (value: number, threshold: number) => {
        return value >= threshold ? 'text-green-600' : 'text-yellow-600';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">Model info unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    ML Model Status
                </h3>
                <button
                    onClick={handleRetrain}
                    disabled={isRetraining}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                    {isRetraining ? 'Training...' : 'Retrain'}
                </button>
            </div>

            <div className="space-y-4">
                {/* Status and Last Trained */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(modelInfo?.status || 'not_trained')}`}>
                            {modelInfo?.status === 'available' ? (
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Not Trained
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(modelInfo?.trained_at || null)}
                    </div>
                </div>

                {/* Model Type */}
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Model:</span>{' '}
                    <span className="text-gray-800">{modelInfo?.model_type || 'Logistic Regression + Decision Tree'}</span>
                </div>

                {/* Performance Metrics - from modelPerformance */}
                {modelPerformance && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className={`text-lg font-bold ${getMetricStatus(modelPerformance.recall, 0.7)}`}>
                                {(modelPerformance.recall * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500">Recall</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className={`text-lg font-bold ${getMetricStatus(modelPerformance.f1_score, 0.65)}`}>
                                {(modelPerformance.f1_score * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500">F1-Score</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className={`text-lg font-bold ${getMetricStatus(modelPerformance.auc_roc, 0.75)}`}>
                                {(modelPerformance.auc_roc * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500">AUC-ROC</p>
                        </div>
                    </div>
                )}

                {/* No metrics available message */}
                {!modelPerformance && modelInfo?.status === 'not_trained' && (
                    <div className="text-center text-sm text-gray-500 py-3">
                        Model belum dilatih. Klik "Retrain" untuk melatih model.
                    </div>
                )}

                {/* Threshold Info */}
                <div className="text-xs text-gray-500 text-center mt-2">
                    Threshold: {modelInfo?.threshold || 0.5}
                </div>
            </div>
        </div>
    );
};

export default ModelStatusCard;
