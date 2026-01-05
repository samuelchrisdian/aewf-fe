import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { useImportSync } from '../queries';
import { useMachinesQuery } from '../../machines/queries';
import { CheckCircle, AlertCircle, Server } from 'lucide-react';
import { notify } from '@/lib/notifications.tsx';

interface ImportUsersStepProps {
    onNext: () => void;
    onBack: () => void;
}

export const ImportUsersStep: React.FC<ImportUsersStepProps> = ({ onNext, onBack }) => {
    const [selectedMachine, setSelectedMachine] = useState<string>('');
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        recordsProcessed?: number;
    } | null>(null);

    const { data: machines = [], isLoading: machinesLoading } = useMachinesQuery();
    const importSync = useImportSync();

    const handleFileSelect = async (file: File) => {
        if (!selectedMachine) {
            const errorMsg = 'Pilih mesin terlebih dahulu';
            setUploadResult({
                success: false,
                message: errorMsg,
            });
            notify.warning(errorMsg);
            return;
        }

        setUploadResult(null);
        try {
            const result = await importSync.mutateAsync({ file, machineCode: selectedMachine });
            const success = result.success ?? true;
            const message = result.message ?? 'Sync berhasil!';

            setUploadResult({
                success,
                message,
                recordsProcessed: result.records_processed,
            });

            if (success) {
                notify.success(message);
            } else {
                notify.warning(message);
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Terjadi kesalahan saat upload';
            setUploadResult({
                success: false,
                message: errorMsg,
            });
            notify.error(errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Langkah 2: Sync User Mesin
                </h3>
                <p className="text-gray-600 mt-1">
                    Upload file export dari mesin absensi fingerprint untuk mensinkronkan data user mesin.
                </p>
            </div>

            {/* Machine Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Server className="w-4 h-4 inline mr-2" />
                    Pilih Mesin
                </label>
                {machinesLoading ? (
                    <div className="text-sm text-gray-500">Memuat daftar mesin...</div>
                ) : (
                    <select
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="">-- Pilih Mesin --</option>
                        {machines.map((machine: any) => (
                            <option key={machine.id} value={machine.machine_code}>
                                {machine.machine_code} - {machine.location || 'No location'}
                            </option>
                        ))}
                    </select>
                )}
                {machines.length === 0 && !machinesLoading && (
                    <p className="text-sm text-amber-600 mt-2">
                        Belum ada mesin terdaftar. Silakan tambahkan mesin terlebih dahulu di halaman Machines.
                    </p>
                )}
            </div>

            {/* File Uploader */}
            <FileUploader
                onFileSelect={handleFileSelect}
                isLoading={importSync.isPending}
                disabled={!selectedMachine}
                error={importSync.error?.message}
            />

            {/* Upload Result */}
            {uploadResult && (
                <div className={`rounded-lg p-4 flex items-start gap-3 ${uploadResult.success ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    {uploadResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                        <p className={`text-sm font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {uploadResult.message}
                        </p>
                        {uploadResult.recordsProcessed !== undefined && (
                            <p className="text-sm text-green-700 mt-1">
                                {uploadResult.recordsProcessed} user berhasil disinkronkan
                            </p>
                        )}
                    </div>
                </div>
            )}

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
                    Lanjut ke Langkah 3
                </button>
            </div>
        </div>
    );
};
