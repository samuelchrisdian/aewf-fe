import React, { useState } from 'react';
import { useBatchesQuery, useBatchQuery, useRollbackBatch, useDeleteBatch } from '../queries';
import { FileSpreadsheet, Eye, RotateCcw, Trash2, X, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ImportBatch } from '@/types/api';

export const ImportBatchHistory: React.FC = () => {
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
    const { data: batches = [], isLoading, refetch } = useBatchesQuery();
    const { data: batchDetail } = useBatchQuery(selectedBatchId ?? undefined);
    const rollbackBatch = useRollbackBatch();
    const deleteBatch = useDeleteBatch();

    const handleRollback = async (id: number) => {
        if (!confirm('Yakin ingin rollback batch ini? Data yang diimport akan dihapus.')) return;
        try {
            await rollbackBatch.mutateAsync(id);
            refetch();
        } catch (e) {
            // Error handled by mutation
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus batch ini?')) return;
        try {
            await deleteBatch.mutateAsync(id);
            refetch();
        } catch (e) {
            // Error handled by mutation
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'processing':
                return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'partial':
                return <AlertCircle className="w-4 h-4 text-amber-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-800',
            processing: 'bg-blue-100 text-blue-800',
            failed: 'bg-red-100 text-red-800',
            partial: 'bg-amber-100 text-amber-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {getStatusIcon(status)}
                {status}
            </span>
        );
    };

    const getFileTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            master: 'bg-purple-100 text-purple-800',
            users: 'bg-blue-100 text-blue-800',
            logs: 'bg-teal-100 text-teal-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
                {type}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                    Riwayat Import
                </h3>
                <button
                    onClick={() => refetch()}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : batches.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Belum ada riwayat import</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Filename</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Records</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {batches.map((batch: ImportBatch) => (
                                <tr key={batch.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-600">#{batch.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                        {batch.filename}
                                    </td>
                                    <td className="px-4 py-3">{getFileTypeBadge(batch.file_type)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{batch.records_processed}</td>
                                    <td className="px-4 py-3">{getStatusBadge(batch.status)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(batch.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => setSelectedBatchId(batch.id)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => handleRollback(batch.id)}
                                                className="p-1.5 hover:bg-amber-100 rounded-lg transition"
                                                title="Rollback"
                                                disabled={rollbackBatch.isPending}
                                            >
                                                <RotateCcw className="w-4 h-4 text-amber-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(batch.id)}
                                                className="p-1.5 hover:bg-red-100 rounded-lg transition"
                                                title="Delete"
                                                disabled={deleteBatch.isPending}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Batch Detail Modal */}
            {selectedBatchId && batchDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Detail Batch #{batchDetail.id}</h4>
                            <button
                                onClick={() => setSelectedBatchId(null)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Filename</p>
                                    <p className="font-medium">{batchDetail.filename}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Type</p>
                                    <p>{getFileTypeBadge(batchDetail.file_type)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <p>{getStatusBadge(batchDetail.status)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Records Processed</p>
                                    <p className="font-medium">{batchDetail.records_processed}</p>
                                </div>
                            </div>

                            {batchDetail.error_log && batchDetail.error_log.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Error Log:</p>
                                    <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {batchDetail.error_log.map((err: any, idx: number) => (
                                            <div key={idx} className="text-sm text-red-800 py-1">
                                                {err.row && <span className="font-medium">Row {err.row}: </span>}
                                                {err.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
