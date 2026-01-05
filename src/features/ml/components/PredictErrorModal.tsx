import React from 'react';
import { X, AlertCircle, User, AlertTriangle } from 'lucide-react';

interface PredictError {
    nis: string;
    name?: string;
    error: string;
}

interface PredictErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    errors: PredictError[];
    totalStudents: number;
}

export const PredictErrorModal: React.FC<PredictErrorModalProps> = ({
    isOpen,
    onClose,
    errors,
    totalStudents,
}) => {
    if (!isOpen) return null;

    const successCount = totalStudents - errors.length;
    const errorCount = errors.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Predict Failed
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                {errorCount} dari {totalStudents} siswa gagal diprediksi
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Berhasil</span>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">✓</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {successCount}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Gagal</span>
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                            {errorCount}
                        </p>
                    </div>
                </div>

                {/* Error List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        Detail Error
                    </h3>
                    <div className="space-y-3">
                        {errors.map((error, index) => (
                            <div
                                key={`${error.nis}-${index}`}
                                className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">
                                                NIS: {error.nis}
                                            </span>
                                            {error.name && (
                                                <>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-600 text-sm">
                                                        {error.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 leading-relaxed">
                                                {error.error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Catatan:</span> Siswa yang berhasil telah diperbarui prediksinya.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

