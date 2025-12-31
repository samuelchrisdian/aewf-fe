import React, { useState } from 'react';
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
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

    const filteredSuggestions = suggestions.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

    const pendingCount = suggestions.filter(s => s.status === 'pending').length;

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

    if (suggestions.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No mappings found</h3>
                <p className="text-gray-600">
                    Run auto-mapping to generate suggestions, or import machine users first.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b pb-2">
                {[
                    { key: 'all', label: 'All', count: suggestions.length },
                    { key: 'pending', label: 'Pending', count: pendingCount },
                    { key: 'verified', label: 'Verified', count: suggestions.filter(s => s.status === 'verified').length },
                    { key: 'rejected', label: 'Rejected', count: suggestions.filter(s => s.status === 'rejected').length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as typeof filter)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${filter === tab.key
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Suggestion Cards */}
            <div className="space-y-2">
                {filteredSuggestions.map((suggestion) => (
                    <MappingSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isSelected={selectedIds.has(suggestion.id)}
                        onSelect={onSelectionChange}
                        onVerify={onVerify}
                        onReject={onReject}
                        onManualEdit={onManualEdit}
                        isVerifying={isVerifying}
                    />
                ))}
            </div>

            {filteredSuggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No {filter} mappings found.
                </div>
            )}
        </div>
    );
};
