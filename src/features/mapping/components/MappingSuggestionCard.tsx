import React from 'react';
import { ArrowRight, Check, X, Edit } from 'lucide-react';
import { ConfidenceScoreBadge } from './ConfidenceScoreBadge';
import type { MappingSuggestion } from '@/types/api';

interface MappingSuggestionCardProps {
    suggestion: MappingSuggestion;
    isSelected?: boolean;
    onSelect?: (id: number, selected: boolean) => void;
    onVerify?: (id: number) => void;
    onReject?: (id: number) => void;
    onManualEdit?: (suggestion: MappingSuggestion) => void;
    isVerifying?: boolean;
    showCheckbox?: boolean;
}

export const MappingSuggestionCard: React.FC<MappingSuggestionCardProps> = ({
    suggestion,
    isSelected = false,
    onSelect,
    onVerify,
    onReject,
    onManualEdit,
    isVerifying = false,
    showCheckbox = false,
}) => {
    // Early return if suggestion is invalid
    if (!suggestion || !suggestion.machine_user) {
        return null;
    }

    const hasMatch = suggestion.suggested_student !== null && suggestion.suggested_student !== undefined;

    return (
        <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-center gap-4">
                {/* Checkbox - only show for unmapped items */}
                {showCheckbox && onSelect && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            // Pass 0 as placeholder - the wrapper in UnmappedUsersList will use the correct itemId
                            onSelect(0, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                )}

                {/* Machine User Info */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.machine_user.machine_user_name}
                    </div>
                    <div className="text-xs text-gray-500">
                        ID: {suggestion.machine_user.machine_user_id}
                        {suggestion.machine_user.department && ` • ${suggestion.machine_user.department}`}
                    </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

                {/* Student Info or No Match */}
                <div className="flex-1 min-w-0">
                    {hasMatch ? (
                        <>
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.suggested_student!.name}
                            </div>
                            <div className="text-xs text-gray-500">
                                NIS: {suggestion.suggested_student!.nis}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500 italic">No match found</div>
                    )}
                </div>

                {/* Confidence Score */}
                <div className="flex-shrink-0">
                    {hasMatch ? (
                        <ConfidenceScoreBadge score={suggestion.confidence_score} />
                    ) : (
                        <span className="text-xs text-gray-400">--</span>
                    )}
                </div>

                {/* Status Badge */}
                {suggestion.status !== 'pending' && (
                    <div className={`px-2 py-1 rounded text-xs font-medium ${suggestion.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {suggestion.status}
                    </div>
                )}

                {/* Action Buttons (only for pending) */}
                {suggestion.status === 'pending' && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {hasMatch && onVerify && (
                            <button
                                onClick={() => onVerify(suggestion.id)}
                                disabled={isVerifying}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Accept mapping"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                        {hasMatch && onReject && (
                            <button
                                onClick={() => onReject(suggestion.id)}
                                disabled={isVerifying}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Reject mapping"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        {onManualEdit && (
                            <button
                                onClick={() => onManualEdit(suggestion)}
                                disabled={isVerifying}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                                title="Manual mapping"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
