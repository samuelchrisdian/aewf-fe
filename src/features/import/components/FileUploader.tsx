import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    disabled?: boolean;
    isLoading?: boolean;
    error?: string;
}

const ACCEPTED_EXTENSIONS = ['.xls', '.xlsx', '.csv'];
const ACCEPTED_MIME_TYPES = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
];

export const FileUploader: React.FC<FileUploaderProps> = ({
    onFileSelect,
    accept = '.xls,.xlsx,.csv',
    disabled = false,
    isLoading = false,
    error,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(extension)) {
            setValidationError(`Invalid file type. Please upload ${ACCEPTED_EXTENSIONS.join(', ')} files only.`);
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    }, [disabled, onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    }, [onFileSelect]);

    const clearFile = useCallback(() => {
        setSelectedFile(null);
        setValidationError(null);
    }, []);

    const displayError = error || validationError;

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-gray-300 hover:border-gray-400'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${displayError ? 'border-red-300 bg-red-50' : ''}
        `}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600">Uploading...</p>
                    </div>
                ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-lg">
                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="ml-2 p-1 hover:bg-green-100 rounded-full transition"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-sm text-green-600">File siap untuk diupload</p>
                    </div>
                ) : (
                    <>
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={disabled}
                        />
                        <div className="flex flex-col items-center gap-4">
                            <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${isDragging ? 'bg-primary/20' : 'bg-gray-100'}
              `}>
                                <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">
                                    Drag & Drop file Excel di sini
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    atau <span className="text-primary font-medium">klik untuk browse</span>
                                </p>
                            </div>
                            <p className="text-xs text-gray-400">
                                Format: .xls, .xlsx, .csv
                            </p>
                        </div>
                    </>
                )}
            </div>

            {displayError && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{displayError}</span>
                </div>
            )}
        </div>
    );
};
