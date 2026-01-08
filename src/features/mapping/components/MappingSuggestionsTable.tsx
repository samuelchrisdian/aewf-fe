import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Edit, AlertCircle, Trash2 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { ConfidenceScoreBadge } from '.';
import type { MappingSuggestion } from '@/types/api';

interface MappingSuggestionsTableProps {
    suggestions: MappingSuggestion[];
    isLoading?: boolean;
    selectedIds: Set<number>;
    onSelectionChange: (id: number, selected: boolean) => void;
    onVerify: (id: number) => void;
    onReject: (id: number) => void;
    onManualEdit: (suggestion: MappingSuggestion) => void;
    onDelete?: (suggestion: MappingSuggestion) => void;
    onDeleteMapped?: (nis: string) => void;
    isVerifying?: boolean;
    isDeleting?: boolean;
    showCheckbox?: boolean;
    activeTab?: 'unmapped' | 'mapped';
}

export const MappingSuggestionsTable: React.FC<MappingSuggestionsTableProps> = ({
    suggestions,
    isLoading = false,
    selectedIds,
    onSelectionChange,
    onVerify,
    onReject,
    onManualEdit,
    onDelete,
    onDeleteMapped,
    isVerifying = false,
    isDeleting = false,
    showCheckbox = true,
    activeTab = 'unmapped',
}) => {
    const columns = useMemo<ColumnDef<MappingSuggestion>[]>(() => {
        const baseColumns: ColumnDef<MappingSuggestion>[] = [];

        // Checkbox column - only show if enabled
        if (showCheckbox) {
            baseColumns.push({
                id: 'select',
                header: '',
                cell: ({ row }) => {
                    const suggestion = row.original;
                    // Only show checkbox for unmapped items
                    if (suggestion.is_mapped) return null;

                    // Use numeric ID - prefer id, fallback to row.index
                    const itemId = suggestion?.id ?? row.index;
                    const isSelected = selectedIds.has(itemId);

                    return (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                onSelectionChange(itemId, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                    );
                },
                enableSorting: false,
                size: 50,
            });
        }

        // Machine User columns
        baseColumns.push({
            id: 'machine_user',
            header: 'Machine User',
            cell: ({ row }) => {
                const { machine_user } = row.original;
                if (!machine_user) return <span className="text-gray-400 text-sm italic">No data</span>;

                return (
                    <div className="min-w-[200px]">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {machine_user.machine_user_name}
                        </div>
                        <div className="text-xs text-gray-500">
                            ID: {machine_user.machine_user_id}
                            {machine_user.department && ` • ${machine_user.department}`}
                        </div>
                    </div>
                );
            },
            enableSorting: true,
        });

        // Arrow column
        baseColumns.push({
            id: 'arrow',
            header: '',
            cell: () => (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
            ),
            enableSorting: false,
            size: 50,
        });

        // Suggested Student column
        baseColumns.push({
            id: 'suggested_student',
            header: 'Suggested Student',
            cell: ({ row }) => {
                const { suggested_student } = row.original;
                const hasMatch = suggested_student !== null && suggested_student !== undefined;

                if (!hasMatch) {
                    return <div className="text-sm text-gray-500 italic min-w-[200px]">No match found</div>;
                }

                return (
                    <div className="min-w-[200px]">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {suggested_student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                            NIS: {suggested_student.nis}
                        </div>
                    </div>
                );
            },
            enableSorting: true,
        });

        // Confidence Score column
        baseColumns.push({
            id: 'confidence',
            header: 'Confidence',
            cell: ({ row }) => {
                const { suggested_student, confidence_score } = row.original;
                const hasMatch = suggested_student !== null && suggested_student !== undefined;

                if (!hasMatch) {
                    return <span className="text-xs text-gray-400">--</span>;
                }

                return <ConfidenceScoreBadge score={confidence_score} />;
            },
            enableSorting: true,
            size: 120,
        });

        // Status column
        baseColumns.push({
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status, is_mapped } = row.original;

                if (is_mapped) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Mapped
                        </span>
                    );
                }

                if (status === 'verified') {
                    return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                        </span>
                    );
                }

                if (status === 'rejected') {
                    return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                        </span>
                    );
                }

                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                );
            },
            enableSorting: true,
            size: 100,
        });

        // Actions column
        baseColumns.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const suggestion = row.original;

                // For unmapped tab
                if (activeTab === 'unmapped' && !suggestion.is_mapped) {
                    return (
                        <div className="flex items-center gap-1 justify-center">
                            {/* Manual Edit button */}
                            <button
                                onClick={() => onManualEdit(suggestion)}
                                disabled={isVerifying || isDeleting}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                                title="Manual mapping"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            {/* Delete button */}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(suggestion)}
                                    disabled={isVerifying || isDeleting}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                    title="Delete mapping"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                }

                // For mapped tab
                if (activeTab === 'mapped' && suggestion.is_mapped) {
                    return (
                        <div className="flex items-center gap-1 justify-center">
                            {/* Delete button */}
                            {onDeleteMapped && suggestion.suggested_student && (
                                <button
                                    onClick={() => onDeleteMapped(suggestion.suggested_student!.nis)}
                                    disabled={isVerifying || isDeleting}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                    title="Delete student mapping"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                }

                return null;
            },
            enableSorting: false,
            size: 150,
        });

        return baseColumns;
    }, [showCheckbox, selectedIds, onSelectionChange, onVerify, onReject, onManualEdit, onDelete, onDeleteMapped, isVerifying, isDeleting, activeTab]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="w-5 h-5 bg-gray-200 rounded" />
                            <div className="flex-1">
                                <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                                <div className="h-3 w-16 bg-gray-200 rounded" />
                            </div>
                            <div className="w-16 h-6 bg-gray-200 rounded-full" />
                        </div>
                    ))}
                </div>
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
        <DataTable<MappingSuggestion>
            columns={columns}
            data={suggestions}
            initialState={{
                pagination: {
                    pageSize: 10,
                },
            }}
            noDataMessage="No mapping suggestions available"
        />
    );
};

