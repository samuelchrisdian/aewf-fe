import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MappingSuggestionCard } from './MappingSuggestionCard';
import type { MappingSuggestion } from '@/types/api';

interface UnmappedUsersListProps {
    suggestions: MappingSuggestion[];
    isLoading?: boolean;
    selectedIds: Set<number>;
    onSelectionChange: (id: number, selected: boolean) => void;
    onVerify: (id: number) => void;
    onReject: (id: number) => void;
    onManualEdit: (suggestion: MappingSuggestion) => void;
    isVerifying?: boolean;
}

export const UnmappedUsersList: React.FC<UnmappedUsersListProps> = ({
    suggestions,
    isLoading = false,
    selectedIds,
    onSelectionChange,
    onVerify,
    onReject,
    onManualEdit,
    isVerifying = false,
}) => {
    // Debug: log suggestions to see what we're getting
    React.useEffect(() => {
        console.log('UnmappedUsersList - suggestions count:', suggestions?.length);
        console.log('UnmappedUsersList - first suggestion:', suggestions?.[0]);
        console.log('UnmappedUsersList - suggestion keys:', suggestions?.[0] ? Object.keys(suggestions[0]) : 'no data');
        console.log('UnmappedUsersList - selectedIds:', Array.from(selectedIds));
    }, [suggestions, selectedIds]);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="w-5 h-5 bg-gray-200 rounded" />
                            <div className="flex-1">
                                <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                                <div className="h-3 w-16 bg-gray-200 rounded" />
                            </div>
                            <div className="w-16 h-6 bg-gray-200 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No mappings found</h3>
                <p className="text-gray-600">
                    {suggestions === undefined || suggestions === null
                        ? 'Loading data...'
                        : 'Run auto-mapping to generate suggestions, or import machine users first.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Suggestion Cards */}
            {suggestions.map((suggestion, index) => {
                // Try multiple possible ID fields from API
                const itemId = suggestion?.id
                    || suggestion?.mapping_id
                    || suggestion?.machine_user?.machine_user_id
                    || index;

                const isSelected = selectedIds.has(itemId);

                // Log for debugging
                if (index === 0) {
                    console.log('First item ID resolution:', {
                        'suggestion.id': suggestion?.id,
                        'suggestion.mapping_id': suggestion?.mapping_id,
                        'machine_user_id': suggestion?.machine_user?.machine_user_id,
                        'using itemId': itemId,
                        'suggestion keys': suggestion ? Object.keys(suggestion) : 'none'
                    });
                }

                // Create wrapper for onSelect to ensure we use the correct ID
                const handleSelect = (receivedId: number, selected: boolean) => {
                    console.log('Checkbox clicked:', {
                        itemId,
                        selected,
                        receivedId,
                        suggestionId: suggestion?.id,
                        allKeys: suggestion ? Object.keys(suggestion) : 'none'
                    });
                    onSelectionChange(itemId, selected);
                };

                return (
                    <MappingSuggestionCard
                        key={itemId}
                        suggestion={suggestion}
                        isSelected={isSelected}
                        onSelect={handleSelect}
                        onVerify={onVerify}
                        onReject={onReject}
                        onManualEdit={onManualEdit}
                        isVerifying={isVerifying}
                        showCheckbox={!suggestion?.is_mapped}
                    />
                );
            })}
        </div>
    );
};
