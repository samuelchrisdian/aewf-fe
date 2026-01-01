import React from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    label?: string;
    variant?: 'primary' | 'secondary';
    icon?: 'download' | 'excel';
    disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    onClick,
    isLoading = false,
    label = 'Export Excel',
    variant = 'primary',
    icon = 'excel',
    disabled = false,
}) => {
    const Icon = icon === 'excel' ? FileSpreadsheet : Download;

    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = variant === 'primary'
        ? "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500/20"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";

    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${variantClasses}`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Icon className="w-4 h-4" />
            )}
            {label}
        </button>
    );
};

export default ExportButton;
