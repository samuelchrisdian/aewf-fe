import React, { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';

interface BulkVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onVerifyAll: () => void;
    onRejectAll: () => void;
    isProcessing?: boolean;
}

export const BulkVerifyModal: React.FC<BulkVerifyModalProps> = ({
    isOpen,
    onClose,
    selectedCount,
    onVerifyAll,
    onRejectAll,
    isProcessing = false,
}) => {
    const [action, setAction] = useState<'verify' | 'reject' | null>(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (action === 'verify') {
            onVerifyAll();
        } else if (action === 'reject') {
            onRejectAll();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Verification</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="text-gray-600">
                        You have selected <span className="font-semibold text-gray-900">{selectedCount}</span> mapping(s).
                        Choose an action to apply to all selected items:
                    </p>

                    {/* Action Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setAction('verify')}
                            className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${action === 'verify'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <Check className={`w-8 h-8 ${action === 'verify' ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={`font-medium ${action === 'verify' ? 'text-green-700' : 'text-gray-600'}`}>
                                Verify All
                            </span>
                        </button>
                        <button
                            onClick={() => setAction('reject')}
                            className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${action === 'reject'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-red-300'
                                }`}
                        >
                            <X className={`w-8 h-8 ${action === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
                            <span className={`font-medium ${action === 'reject' ? 'text-red-700' : 'text-gray-600'}`}>
                                Reject All
                            </span>
                        </button>
                    </div>

                    {/* Warning */}
                    {action && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg ${action === 'verify' ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${action === 'verify' ? 'text-green-600' : 'text-red-600'
                                }`} />
                            <p className={`text-sm ${action === 'verify' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {action === 'verify'
                                    ? `This will confirm ${selectedCount} mapping(s) as correct.`
                                    : `This will reject ${selectedCount} mapping(s). They will need to be manually remapped.`
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!action || isProcessing}
                        className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${action === 'verify'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : action === 'reject'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
