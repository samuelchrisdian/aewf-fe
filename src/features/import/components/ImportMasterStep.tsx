import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { useImportMaster } from '../queries';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { notify } from '@/lib/notifications';

interface ImportMasterStepProps {
    onNext: () => void;
}

export const ImportMasterStep: React.FC<ImportMasterStepProps> = ({ onNext }) => {
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        recordsProcessed?: number;
    } | null>(null);

    const importMaster = useImportMaster();

    const handleFileSelect = async (file: File) => {
        setUploadResult(null);
        try {
            const result = await importMaster.mutateAsync(file);
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
                    Langkah 1: Import Master Data
                </h3>
                <p className="text-gray-600 mt-1">
                    Upload file rekap absensi manual sekolah untuk mengimport data Siswa, Kelas, dan Guru.
                </p>
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-900 font-medium">Download Template</p>
                    <p className="text-sm text-blue-700 mt-0.5">
                        Pastikan format file sesuai dengan template yang disediakan.
                    </p>
                    <a
                        href="/api/v1/export/template/master"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                    >
                        <Download className="w-4 h-4" />
                        Download Template Master Data
                    </a>
                </div>
            </div>

            {/* File Uploader */}
            <FileUploader
                onFileSelect={handleFileSelect}
                isLoading={importMaster.isPending}
                error={importMaster.error?.message}
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
                                {uploadResult.recordsProcessed} record berhasil diproses
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    onClick={onNext}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                    Lanjut ke Langkah 2
                </button>
            </div>
        </div>
    );
};
