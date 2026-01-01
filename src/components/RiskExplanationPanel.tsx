import React from 'react';
import { AlertTriangle, TrendingDown, Clock, Calendar, Activity, Info } from 'lucide-react';

interface RiskExplanationPanelProps {
    explanationText?: string;
    factors?: {
        absent_count?: number;
        absent_ratio?: number;
        late_count?: number;
        late_ratio?: number;
        trend_score?: number;
        is_rule_triggered?: boolean;
        total_days?: number;
        attendance_ratio?: number;
        present_count?: number;
        permission_count?: number;
        sick_count?: number;
    };
    riskLevel?: string;
    className?: string;
}

interface ParsedExplanation {
    mainFactors: string[];
    rules: string[];
}

/**
 * Parses the ML-generated explanation text into structured sections
 */
const parseExplanation = (text?: string): ParsedExplanation => {
    if (!text) return { mainFactors: [], rules: [] };

    const sections = text.split('\n\n');
    const mainFactors: string[] = [];
    const rules: string[] = [];

    sections.forEach((section) => {
        if (section.includes('Faktor Utama') || section.includes('Berdasarkan Bobot')) {
            const lines = section.split('\n').slice(1);
            lines.forEach((line) => {
                const cleaned = line.replace(/^[-•]\s*/, '').trim();
                if (cleaned) mainFactors.push(cleaned);
            });
        } else if (section.includes('Logika Deteksi') || section.includes('Aturan')) {
            const lines = section.split('\n').slice(1);
            lines.forEach((line) => {
                const cleaned = line.replace(/^[-•]\s*/, '').trim();
                if (cleaned) rules.push(cleaned);
            });
        }
    });

    return { mainFactors, rules };
};

/**
 * RiskExplanationPanel - Displays ML-generated risk explanation in a structured format
 * 
 * Shows:
 * - Main risk factors with weighted contributions
 * - Rule-based detection triggers
 * - Fallback to raw factor display if no explanation text
 */
const RiskExplanationPanel: React.FC<RiskExplanationPanelProps> = ({
    explanationText,
    factors,
    riskLevel = 'low',
    className = '',
}) => {
    const { mainFactors, rules } = parseExplanation(explanationText);
    const hasContent = mainFactors.length > 0 || rules.length > 0 || factors;

    if (!hasContent) {
        return (
            <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
                <Info className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No risk factors identified.</p>
            </div>
        );
    }

    const getRiskColor = () => {
        const normalized = riskLevel?.toLowerCase();
        if (normalized === 'critical' || normalized === 'high' || normalized === 'red') {
            return { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500' };
        }
        if (normalized === 'medium' || normalized === 'yellow') {
            return { bg: 'bg-yellow-50', border: 'border-yellow-100', icon: 'text-yellow-500' };
        }
        return { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-500' };
    };

    const colors = getRiskColor();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Factors from ML Explanation */}
            {mainFactors.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <AlertTriangle className={`w-4 h-4 mr-1 ${colors.icon}`} />
                        Faktor Utama Risiko:
                    </p>
                    <div className="space-y-2">
                        {mainFactors.map((factor, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start p-3 ${colors.bg} border ${colors.border} rounded-lg`}
                            >
                                <div className="min-w-[4px] h-4 mt-1 bg-red-500 rounded-full mr-3" />
                                <p className="text-sm text-gray-800">{factor}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rule-based Triggers */}
            {rules.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-1 text-yellow-600" />
                        Logika Deteksi (Aturan):
                    </p>
                    <div className="space-y-2">
                        {rules.map((rule, idx) => (
                            <div
                                key={idx}
                                className="flex items-start p-3 bg-yellow-50 border border-yellow-100 rounded-lg"
                            >
                                <div className="min-w-[4px] h-4 mt-1 bg-yellow-500 rounded-full mr-3" />
                                <p className="text-sm text-gray-800 font-mono">{rule}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fallback: Raw Factor Display */}
            {!explanationText && !mainFactors.length && !rules.length && factors && (
                <div className="space-y-2">
                    {(factors.absent_count ?? 0) > 0 && (
                        <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-red-500 mr-3" />
                            <p className="text-sm text-gray-800">
                                Total Absences: <strong>{factors.absent_count} days</strong>
                                {factors.absent_ratio !== undefined && (
                                    <span className="text-gray-500 ml-1">
                                        ({(factors.absent_ratio * 100).toFixed(1)}%)
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {(factors.late_count ?? 0) > 0 && (
                        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                            <p className="text-sm text-gray-800">
                                Late Arrivals: <strong>{factors.late_count} days</strong>
                                {factors.late_ratio !== undefined && (
                                    <span className="text-gray-500 ml-1">
                                        ({(factors.late_ratio * 100).toFixed(1)}%)
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {factors.trend_score !== undefined && factors.trend_score !== 0 && (
                        <div
                            className={`flex items-center p-3 ${factors.trend_score < 0
                                    ? 'bg-red-50 border-red-100'
                                    : 'bg-green-50 border-green-100'
                                } rounded-lg border`}
                        >
                            <TrendingDown
                                className={`w-5 h-5 mr-3 ${factors.trend_score < 0 ? 'text-red-500' : 'text-green-500'
                                    }`}
                            />
                            <p className="text-sm text-gray-800">
                                7-Day Trend:{' '}
                                <strong>{factors.trend_score > 0 ? 'Improving' : 'Declining'}</strong>
                                <span className="text-gray-500 ml-1">
                                    ({factors.trend_score.toFixed(2)})
                                </span>
                            </p>
                        </div>
                    )}

                    {factors.is_rule_triggered && (
                        <div className="flex items-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                            <p className="text-sm text-gray-800 font-semibold">
                                Rule-based threshold exceeded (absent_ratio &gt; 15% or absent_count &gt; 5)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RiskExplanationPanel;
