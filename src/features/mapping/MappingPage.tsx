import React, { useState, useMemo } from 'react';
import { Link2, RefreshCw, CheckSquare, AlertTriangle, AlertCircle } from 'lucide-react';
import { notify } from '@/lib/notifications.tsx';
import {
    MappingStats,
    UnmappedUsersList,
    BulkVerifyModal,
    ManualMappingModal
} from './components';
import {
    useMappingStats,
    useUnmappedUsers,
    useProcessMapping,
    useVerifyMapping,
    useBulkVerify
} from './queries';
import type { MappingSuggestion, Student, VerifyMappingRequest, BulkVerifyRequest } from '@/types/api';

// Mock students for manual mapping - in real app, fetch from API
const mockStudents: Student[] = [];

export const MappingPage: React.FC = () => {
    // State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [manualMappingTarget, setManualMappingTarget] = useState<MappingSuggestion | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'unmapped' | 'mapped'>('all');

    // Queries with error handling
    const { data: stats, isLoading: statsLoading, error: statsError } = useMappingStats();
    const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useUnmappedUsers();

    // Ensure suggestions is always an array
    const allSuggestions = useMemo(() => {
        if (!suggestionsData) return [];
        if (Array.isArray(suggestionsData)) return suggestionsData;
        return [];
    }, [suggestionsData]);

    // Filter suggestions based on active tab
    const suggestions = useMemo(() => {
        if (activeTab === 'unmapped') {
            return allSuggestions.filter(s => !s.is_mapped);
        } else if (activeTab === 'mapped') {
            return allSuggestions.filter(s => s.is_mapped);
        }
        return allSuggestions; // 'all' tab
    }, [allSuggestions, activeTab]);

    // Mutations
    const processMapping = useProcessMapping();
    const verifyMapping = useVerifyMapping();
    const bulkVerify = useBulkVerify();

    // Derived state - only unmapped can be selected
    const unmappedSuggestions = useMemo(() =>
        allSuggestions.filter(s => s && !s.is_mapped),
        [allSuggestions]
    );

    const selectedCount = selectedIds.size;

    const allUnmappedSelected = useMemo(() => {
        if (unmappedSuggestions.length === 0) return false;

        // Check if all unmapped items are selected using same ID resolution
        const result = unmappedSuggestions.every((s, index) => {
            const itemId = s?.id || s?.mapping_id || s?.machine_user?.machine_user_id || index;
            return selectedIds.has(itemId);
        });

        console.log('allUnmappedSelected check:', {
            unmappedCount: unmappedSuggestions.length,
            selectedCount: selectedIds.size,
            allSelected: result
        });

        return result;
    }, [unmappedSuggestions, selectedIds]);

    // Handlers
    const handleSelectionChange = (id: number, selected: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (selected) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (allUnmappedSelected) {
            // Deselect all
            setSelectedIds(new Set());
        } else {
            // Select all unmapped items - use same ID resolution as individual selection
            const idsToSelect = unmappedSuggestions.map((s, index) => {
                return s?.id || s?.mapping_id || s?.machine_user?.machine_user_id || index;
            });
            console.log('Select All - IDs:', idsToSelect);
            setSelectedIds(new Set(idsToSelect));
        }
    };

    const handleRunAutoMapping = async () => {
        try {
            await processMapping.mutateAsync({});
            notify.success('Auto-mapping completed successfully');
        } catch (error: any) {
            notify.error(error.message || 'Auto-mapping failed');
        }
    };

    const handleVerify = async (id: number) => {
        try {
            await verifyMapping.mutateAsync({ mapping_id: id, status: 'verified' });
            notify.success('Mapping verified successfully');
        } catch (error: any) {
            notify.error(error.message || 'Failed to verify mapping');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await verifyMapping.mutateAsync({ mapping_id: id, status: 'rejected' });
            notify.success('Mapping rejected');
        } catch (error: any) {
            notify.error(error.message || 'Failed to reject mapping');
        }
    };

    const handleBulkVerifyAll = async () => {
        try {
            const mappings: VerifyMappingRequest[] = Array.from(selectedIds).map(id => ({
                mapping_id: id,
                status: 'verified' as 'verified' | 'rejected',
            }));
            const request: BulkVerifyRequest = { mappings };
            await bulkVerify.mutateAsync(request);
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            notify.success(`${mappings.length} mappings verified successfully`);
        } catch (error: any) {
            notify.error(error.message || 'Bulk verify failed');
        }
    };

    const handleBulkRejectAll = async () => {
        try {
            const mappings: VerifyMappingRequest[] = Array.from(selectedIds).map(id => ({
                mapping_id: id,
                status: 'rejected' as 'verified' | 'rejected',
            }));
            const request: BulkVerifyRequest = { mappings };
            await bulkVerify.mutateAsync(request);
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            notify.success(`${mappings.length} mappings rejected`);
        } catch (error: any) {
            notify.error(error.message || 'Bulk reject failed');
        }
    };

    const handleManualMapping = (_machineUserId: number, _studentNis: string) => {
        // In a real app, this would call an API to create the mapping
        notify.success('Manual mapping created successfully');
        setManualMappingTarget(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-primary" />
                    </div>
                    Mapping Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Hubungkan ID mesin fingerprint ke NIS siswa untuk proses absensi
                </p>
            </div>

            {/* Error Banner */}
            {(statsError || suggestionsError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-900">
                            Gagal memuat data mapping
                        </p>
                        <p className="text-sm text-red-800">
                            Pastikan backend berjalan di localhost:5001.
                            {((statsError as any)?.message || (suggestionsError as any)?.message) && (
                                <> Error: {(statsError as any)?.message || (suggestionsError as any)?.message}</>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <MappingStats stats={stats} isLoading={statsLoading} />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={handleRunAutoMapping}
                    disabled={processMapping.isPending}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:from-primary/90 hover:to-blue-600/90 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                    <RefreshCw className={`w-4 h-4 ${processMapping.isPending ? 'animate-spin' : ''}`} />
                    {processMapping.isPending ? 'Running...' : 'Run Auto-Mapping'}
                </button>

                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    disabled={selectedCount === 0}
                    className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 shadow-sm hover:shadow-md"
                >
                    <CheckSquare className="w-4 h-4" />
                    Manual Mapping ({selectedCount})
                </button>
            </div>

            {/* Info Banner */}
            {stats && stats.unmapped_count > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">
                            {stats.unmapped_count} user(s) belum ter-mapping
                        </p>
                        <p className="text-sm text-amber-800">
                            Jalankan auto-mapping atau buat mapping manual untuk user yang belum memiliki pasangan.
                        </p>
                    </div>
                </div>
            )}

            {/* Mapping Suggestions List */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                {/* Tabs - Enhanced Styling with Proper Spacing */}
                <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-200 px-4 py-4">
                    <div className="flex gap-3 max-w-full">
                        {[
                            {
                                key: 'all',
                                label: 'All',
                                count: allSuggestions.length,
                                icon: '📊',
                                gradientFrom: 'from-blue-500',
                                gradientTo: 'to-blue-600',
                                bgColor: 'bg-blue-50',
                                bgHover: 'hover:bg-blue-100',
                                textColor: 'text-blue-700',
                                borderColor: 'border-blue-400',
                                shadowColor: 'shadow-blue-200',
                            },
                            {
                                key: 'unmapped',
                                label: 'Unmapped',
                                count: unmappedSuggestions.length,
                                icon: '⚠️',
                                gradientFrom: 'from-amber-500',
                                gradientTo: 'to-orange-500',
                                bgColor: 'bg-amber-50',
                                bgHover: 'hover:bg-amber-100',
                                textColor: 'text-amber-700',
                                borderColor: 'border-amber-400',
                                shadowColor: 'shadow-amber-200',
                            },
                            {
                                key: 'mapped',
                                label: 'Mapped',
                                count: allSuggestions.filter(s => s.is_mapped).length,
                                icon: '✅',
                                gradientFrom: 'from-green-500',
                                gradientTo: 'to-emerald-600',
                                bgColor: 'bg-green-50',
                                bgHover: 'hover:bg-green-100',
                                textColor: 'text-green-700',
                                borderColor: 'border-green-400',
                                shadowColor: 'shadow-green-200',
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`group flex-1 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                                    activeTab === tab.key
                                        ? `bg-white shadow-lg ${tab.shadowColor} border-2 ${tab.borderColor} scale-105 -translate-y-0.5`
                                        : `${tab.bgColor} ${tab.bgHover} border-2 border-transparent hover:scale-102 hover:shadow-md`
                                }`}
                            >
                                {/* Gradient overlay for active tab */}
                                {activeTab === tab.key && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradientFrom} ${tab.gradientTo} opacity-5`} />
                                )}

                                <div className="relative flex items-center justify-center gap-2.5">
                                    <span className="text-lg">{tab.icon}</span>
                                    <span className={activeTab === tab.key ? tab.textColor : 'text-gray-700'}>
                                        {tab.label}
                                    </span>
                                    <span
                                        className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-xs font-black transition-all ${
                                            activeTab === tab.key
                                                ? `${tab.bgColor} ${tab.textColor} ring-2 ring-white shadow-sm`
                                                : 'bg-white/80 text-gray-600 group-hover:bg-white'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </div>

                                {/* Active indicator bar */}
                                {activeTab === tab.key && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.gradientFrom} ${tab.gradientTo} rounded-b-xl`}>
                                        <div className="absolute inset-0 animate-pulse opacity-50" />
                                    </div>
                                )}

                                {/* Hover shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform -skew-x-12" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50/30">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            <div className={`w-1.5 h-7 rounded-full shadow-sm ${
                                activeTab === 'all' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                                activeTab === 'unmapped' ? 'bg-gradient-to-b from-amber-400 to-orange-600' : 
                                'bg-gradient-to-b from-green-400 to-emerald-600'
                            }`} />
                            <span>Mapping Suggestions</span>
                            {activeTab === 'all' && (
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    All Data
                                </span>
                            )}
                            {activeTab === 'unmapped' && (
                                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                    Needs Action
                                </span>
                            )}
                            {activeTab === 'mapped' && (
                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                    Completed
                                </span>
                            )}
                        </h2>
                        {activeTab === 'unmapped' && unmappedSuggestions.length > 0 && (
                            <div className="flex items-center gap-3">
                                {/* Select All Button - Moved to left */}
                                <button
                                    onClick={handleSelectAll}
                                    className="group px-5 py-2.5 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 text-amber-700 rounded-lg hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    <CheckSquare className={`w-4 h-4 transition-transform group-hover:scale-110 ${allUnmappedSelected ? 'text-amber-600' : 'text-amber-500'}`} />
                                    {allUnmappedSelected ? (
                                        <>
                                            <span>Deselect All</span>
                                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">
                                                {unmappedSuggestions.length}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Select All Unmapped</span>
                                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">
                                                {unmappedSuggestions.length}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Selection Counter */}
                                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                                    {selectedCount > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            {selectedCount} selected
                                        </span>
                                    ) : (
                                        'Select items to process'
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <UnmappedUsersList
                        suggestions={suggestions}
                        isLoading={suggestionsLoading}
                        selectedIds={selectedIds}
                        onSelectionChange={handleSelectionChange}
                        onVerify={handleVerify}
                        onReject={handleReject}
                        onManualEdit={setManualMappingTarget}
                        isVerifying={verifyMapping.isPending}
                    />
                </div>
            </div>

            {/* Bulk Verify Modal */}
            <BulkVerifyModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                selectedCount={selectedCount}
                onVerifyAll={handleBulkVerifyAll}
                onRejectAll={handleBulkRejectAll}
                isProcessing={bulkVerify.isPending}
            />

            {/* Manual Mapping Modal */}
            <ManualMappingModal
                isOpen={manualMappingTarget !== null}
                onClose={() => setManualMappingTarget(null)}
                machineUser={manualMappingTarget}
                students={mockStudents}
                onSubmit={handleManualMapping}
            />
        </div>
    );
};

