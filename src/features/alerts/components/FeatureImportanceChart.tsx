import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FeatureImportanceChartProps {
    factors?: {
        absent_count?: number;
        late_count?: number;
        present_count?: number;
        trend_score?: number;
        absent_ratio?: number;
        late_ratio?: number;
        attendance_ratio?: number;
        is_rule_triggered?: boolean;
        recording_completeness?: number;
        longest_gap_days?: number;
        permission_count?: number;
        sick_count?: number;
        total_days?: number;
    };
    className?: string;
}

// Feature display names in Indonesian
const FEATURE_LABELS: Record<string, string> = {
    absent_count: 'Jumlah Absen',
    late_count: 'Jumlah Terlambat',
    present_count: 'Jumlah Hadir',
    trend_score: 'Tren Kehadiran',
    absent_ratio: 'Rasio Absen',
    late_ratio: 'Rasio Terlambat',
    attendance_ratio: 'Rasio Kehadiran',
    recording_completeness: 'Kelengkapan Data',
    longest_gap_days: 'Gap Terpanjang (Hari)',
    permission_count: 'Jumlah Izin',
    sick_count: 'Jumlah Sakit',
    total_days: 'Total Hari Sekolah',
};

// Approximate feature importance weights based on ML model
// These are relative importance values for visualization
// Note: recording_completeness and longest_gap_days are data quality indicators, not behavioral risk factors
const FEATURE_WEIGHTS: Record<string, number> = {
    absent_count: 2.08,
    present_count: -0.81,
    late_count: 0.45,
    trend_score: 0.35,
    absent_ratio: 1.2,
    late_ratio: 0.6,
    attendance_ratio: -0.9,
    recording_completeness: 0.1,  // Low weight - data quality, not risk
    longest_gap_days: 0.15,       // Low weight - data quality, not risk
    permission_count: -0.3,
    sick_count: -0.2,
    total_days: 0.05,
};

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ factors, className }) => {
    if (!factors) {
        return (
            <div className={`bg-gray-50 rounded-lg p-6 text-center ${className || ''}`}>
                <p className="text-gray-500 text-sm">No feature data available</p>
            </div>
        );
    }

    // Calculate weighted feature contributions
    const contributions: { label: string; value: number; weight: number; isNegative: boolean }[] = [];

    Object.entries(factors).forEach(([key, value]) => {
        if (key === 'is_rule_triggered' || value === undefined) return;

        const weight = FEATURE_WEIGHTS[key] || 0;
        const label = FEATURE_LABELS[key] || key;

        // Calculate contribution: value * weight (normalized for ratios)
        let normalizedValue = typeof value === 'number' ? value : 0;
        if (key.includes('ratio')) {
            normalizedValue = normalizedValue * 100; // Convert ratios to percentages
        }

        const contribution = Math.abs(normalizedValue * weight);

        if (contribution > 0.01) {
            contributions.push({
                label,
                value: normalizedValue,
                weight: contribution,
                isNegative: weight < 0,
            });
        }
    });

    // Sort by absolute contribution
    contributions.sort((a, b) => b.weight - a.weight);

    // Take top 5 contributors
    const topContributions = contributions.slice(0, 5);

    const chartData = {
        labels: topContributions.map((c) => c.label),
        datasets: [
            {
                label: 'Kontribusi Risiko',
                data: topContributions.map((c) => c.weight),
                backgroundColor: topContributions.map((c) =>
                    c.isNegative ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                ),
                borderColor: topContributions.map((c) =>
                    c.isNegative ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                ),
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Feature Importance (Kontribusi Faktor)',
                font: { size: 14, weight: 'bold' as const },
                color: '#374151',
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const contribution = topContributions[context.dataIndex];
                        const sign = contribution.isNegative ? '(-)' : '(+)';
                        return `${sign} Kontribusi: ${context.parsed.x.toFixed(2)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                title: {
                    display: true,
                    text: 'Bobot Kontribusi',
                    color: '#6b7280',
                    font: { size: 11 },
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 11 },
                },
            },
        },
    };

    return (
        <div className={`bg-white rounded-lg ${className || ''}`}>
            <div className="h-64">
                <Bar data={chartData} options={options} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>Meningkatkan Risiko</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Menurunkan Risiko</span>
                </div>
            </div>
        </div>
    );
};

export default FeatureImportanceChart;
