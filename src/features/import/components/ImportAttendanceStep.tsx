import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { useImportAttendance } from '../queries';
import { useMachinesQuery } from '../../machines/queries';
import { CheckCircle, AlertCircle, Server, Info } from 'lucide-react';
import { notify } from '@/lib/notifications';

interface ImportAttendanceStepProps {
    onBack: () => void;
    onComplete: () => void;
}

export const ImportAttendanceStep: React.FC<ImportAttendanceStepProps> = ({ onBack, onComplete }) => {
    const [selectedMachine, setSelectedMachine] = useState<string>('');
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        recordsProcessed?: number;
    } | null>(null);

    const { data: machines = [], isLoading: machinesLoading } = useMachinesQuery();
    const importAttendance = useImportAttendance();

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
            const result = await importAttendance.mutateAsync({ file, machineCode: selectedMachine });
            const success = result.success ?? true;
            const message = result.message ?? 'Import berhasil!';

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
                    Langkah 4: Import Log Absensi
                </h3>
                <p className="text-gray-600 mt-1">
                    Upload file log absensi dari mesin fingerprint untuk memproses data kehadiran harian.
                </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Format File yang Didukung:</p>
                        <ul className="mt-1 space-y-0.5 list-disc list-inside">
                            <li>Matrix Format: Attendance Log Report (.xls)</li>
                            <li>Flat Format: Transactional Log (.csv)</li>
                        </ul>
                        <p className="mt-2 text-blue-700">
                            <strong>Filter:</strong> Hanya user dengan Department = 'SMP' yang akan diproses.
                        </p>
                    </div>
                </div>
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
            </div>

            {/* File Uploader */}
            <FileUploader
                onFileSelect={handleFileSelect}
                isLoading={importAttendance.isPending}
                disabled={!selectedMachine}
                error={importAttendance.error?.message}
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
                                {uploadResult.recordsProcessed} log berhasil diproses
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
                    onClick={onComplete}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                    ✓ Selesai
                </button>
            </div>
        </div>
    );
};
