import React, { useState, useMemo } from 'react';
import { Link2, RefreshCw, CheckSquare, AlertTriangle, AlertCircle } from 'lucide-react';
import { notify } from '@/lib/notifications';
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
import type { MappingSuggestion, Student } from '@/types/api';

// Mock students for manual mapping - in real app, fetch from API
const mockStudents: Student[] = [];

export const MappingPage: React.FC = () => {
    // State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [manualMappingTarget, setManualMappingTarget] = useState<MappingSuggestion | null>(null);

    // Queries with error handling
    const { data: stats, isLoading: statsLoading, error: statsError } = useMappingStats();
    const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useUnmappedUsers();

    // Ensure suggestions is always an array
    const suggestions = useMemo(() => {
        if (!suggestionsData) return [];
        if (Array.isArray(suggestionsData)) return suggestionsData;
        return [];
    }, [suggestionsData]);

    // Mutations
    const processMapping = useProcessMapping();
    const verifyMapping = useVerifyMapping();
    const bulkVerify = useBulkVerify();

    // Derived state
    const pendingSuggestions = useMemo(() =>
        suggestions.filter(s => s && s.status === 'pending'),
        [suggestions]
    );

    const selectedCount = selectedIds.size;

    const allPendingSelected = pendingSuggestions.length > 0 &&
        pendingSuggestions.every(s => selectedIds.has(s.id));

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
        if (allPendingSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingSuggestions.map(s => s.id)));
        }
    };

    const handleRunAutoMapping = async () => {
        try {
            await processMapping.mutateAsync();
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
            const mappings = Array.from(selectedIds).map(id => ({
                mapping_id: id,
                status: 'verified' as const,
            }));
            await bulkVerify.mutateAsync({ mappings });
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            notify.success(`${mappings.length} mappings verified successfully`);
        } catch (error: any) {
            notify.error(error.message || 'Bulk verify failed');
        }
    };

    const handleBulkRejectAll = async () => {
        try {
            const mappings = Array.from(selectedIds).map(id => ({
                mapping_id: id,
                status: 'rejected' as const,
            }));
            await bulkVerify.mutateAsync({ mappings });
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            notify.success(`${mappings.length} mappings rejected`);
        } catch (error: any) {
            notify.error(error.message || 'Bulk reject failed');
        }
    };

    const handleManualMapping = (machineUserId: number, studentNis: string) => {
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
                    className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${processMapping.isPending ? 'animate-spin' : ''}`} />
                    {processMapping.isPending ? 'Running...' : 'Run Auto-Mapping'}
                </button>

                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    disabled={selectedCount === 0}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    <CheckSquare className="w-4 h-4" />
                    Bulk Verify ({selectedCount})
                </button>

                {pendingSuggestions.length > 0 && (
                    <button
                        onClick={handleSelectAll}
                        className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition text-sm"
                    >
                        {allPendingSelected ? 'Deselect All' : 'Select All Pending'}
                    </button>
                )}
            </div>

            {/* Info Banner */}
            {stats && stats.unmapped > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">
                            {stats.unmapped} user(s) belum ter-mapping
                        </p>
                        <p className="text-sm text-amber-800">
                            Jalankan auto-mapping atau buat mapping manual untuk user yang belum memiliki pasangan.
                        </p>
                    </div>
                </div>
            )}

            {/* Mapping Suggestions List */}
            <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mapping Suggestions</h2>
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

export default MappingPage;
