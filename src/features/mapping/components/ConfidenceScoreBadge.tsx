import React from 'react';

interface ConfidenceScoreBadgeProps {
    score: number;
    showLabel?: boolean;
}

export const ConfidenceScoreBadge: React.FC<ConfidenceScoreBadgeProps> = ({ score, showLabel = true }) => {
    // Determine color based on confidence level
    const getColorClass = () => {
        if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const getLabel = () => {
        if (score >= 90) return 'High';
        if (score >= 70) return 'Medium';
        return 'Low';
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getColorClass()}`}>
            <span>{score}%</span>
            {showLabel && <span className="text-xs opacity-75">({getLabel()})</span>}
        </span>
    );
};
