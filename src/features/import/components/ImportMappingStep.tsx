import React, { useMemo, useState } from 'react';
import { Link2, AlertTriangle, RefreshCw, CheckCircle, XCircle, AlertCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { notify } from '@/lib/notifications';
import {
    useMappingStats,
    useUnmappedUsers,
    useProcessMapping,
    useVerifyMapping
} from '../../mapping/queries';

interface ImportMappingStepProps {
    onNext: () => void;
    onBack: () => void;
}

const ITEMS_PER_PAGE = 10;

export const ImportMappingStep: React.FC<ImportMappingStepProps> = ({ onNext, onBack }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    // Queries
    const { data: stats, isLoading: statsLoading, error: statsError } = useMappingStats();
    const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useUnmappedUsers();

    // Mutations
    const processMapping = useProcessMapping();
    const verifyMapping = useVerifyMapping();

    // Ensure suggestions is always an array
    // suggestionsData is { data: [...], total: number } from useUnmappedUsers
    const suggestions = useMemo(() => {
        if (!suggestionsData) return [];
        if (Array.isArray(suggestionsData)) return suggestionsData;
        if (suggestionsData.data && Array.isArray(suggestionsData.data)) return suggestionsData.data;
        return [];
    }, [suggestionsData]);

    // Handlers
    const handleRunAutoMapping = async () => {
        try {
            await processMapping.mutateAsync();
            notify.success('Auto-mapping berhasil dijalankan');
        } catch (error: any) {
            notify.error(error.message || 'Auto-mapping gagal');
        }
    };

    const handleVerify = async (id: number) => {
        try {
            await verifyMapping.mutateAsync({ mapping_id: id, status: 'verified' });
            notify.success('Mapping disetujui');
        } catch (error: any) {
            notify.error(error.message || 'Gagal menyetujui mapping');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await verifyMapping.mutateAsync({ mapping_id: id, status: 'rejected' });
            notify.success('Mapping ditolak');
        } catch (error: any) {
            notify.error(error.message || 'Gagal menolak mapping');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Langkah 3: Mapping (Pencocokan ID Mesin ↔ NIS Siswa)
                </h3>
                <p className="text-gray-600 mt-1">
                    Sebelum lanjut ke import log absensi, pastikan semua user mesin sudah ter-mapping ke data siswa.
                </p>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">Mengapa perlu Mapping?</p>
                        <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                            <li>Mesin hanya mencatat ID internal (misal: ID 195)</li>
                            <li>Database siswa menyimpan NIS (misal: NIS 2024099)</li>
                            <li>Mapping menghubungkan ID mesin → NIS siswa</li>
                            <li>Tanpa mapping, log absensi tidak bisa diproses</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {(statsError || suggestionsError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-900">Gagal memuat data mapping</p>
                        <p className="text-sm text-red-800">
                            Pastikan backend berjalan dengan benar.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">{stats.verified_count || 0}</p>
                        <p className="text-sm text-green-600">Terverifikasi</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-amber-700">{stats.suggested_count || 0}</p>
                        <p className="text-sm text-amber-600">Pending</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-700">{stats.unmapped_count || 0}</p>
                        <p className="text-sm text-red-600">Belum Mapping</p>
                    </div>
                </div>
            )}

            {/* Auto Mapping Action */}
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Auto Mapping</h4>
                            <p className="text-sm text-gray-600">
                                Sistem akan mencocokkan nama mesin dengan nama siswa menggunakan fuzzy logic.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRunAutoMapping}
                        disabled={processMapping.isPending}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${processMapping.isPending ? 'animate-spin' : ''}`} />
                        {processMapping.isPending ? 'Processing...' : 'Jalankan Auto Mapping'}
                    </button>
                </div>
            </div>

            {/* Unmapped Users Table */}
            <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    User Belum Ter-mapping ({suggestions.length})
                </h4>
                {statsLoading || suggestionsLoading ? (
                    <div className="text-center py-6 text-gray-500">Memuat data...</div>
                ) : suggestions.length === 0 ? (
                    <div className="text-center py-6 text-green-600">
                        ✓ Semua user sudah ter-mapping!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">ID Mesin</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Nama Mesin</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Kode Mesin</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Suggested NIS</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Suggested Name</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Kelas</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Confidence</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {suggestions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-900">
                                            {item.machine_user?.machine_user_id || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-900">
                                            {item.machine_user?.machine_user_name || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {(item.machine_user as any)?.machine_code || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {item.suggested_student?.nis || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {item.suggested_student?.name || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {(item.suggested_student as any)?.class_id || '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.confidence_score ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.confidence_score >= 80 ? 'bg-green-100 text-green-700' :
                                                    item.confidence_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.confidence_score.toFixed(0)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.suggested_student && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerify(item.id)}
                                                        disabled={verifyMapping.isPending}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                                        title="Setujui"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id)}
                                                        disabled={verifyMapping.isPending}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Tolak"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        {suggestions.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-between pt-4 border-t mt-4">
                                <p className="text-sm text-gray-600">
                                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, suggestions.length)} dari {suggestions.length} user
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-700 px-2">
                                        Halaman {currentPage} dari {Math.ceil(suggestions.length / ITEMS_PER_PAGE)}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(suggestions.length / ITEMS_PER_PAGE), p + 1))}
                                        disabled={currentPage >= Math.ceil(suggestions.length / ITEMS_PER_PAGE)}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Note */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <strong>Catatan:</strong> Langkah ini opsional jika Anda sudah melakukan mapping sebelumnya.
                Klik "Lanjut" untuk melanjutkan ke import log absensi.
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                    ← Kembali
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                    Lanjut ke Langkah 4
                </button>
            </div>
        </div>
    );
};
