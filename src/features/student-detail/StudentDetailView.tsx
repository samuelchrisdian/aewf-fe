import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentQuery, useRiskHistoryQuery, useStudentRiskQuery, useStudentAttendanceQuery } from '../alerts/queries';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertOctagon, CheckCircle, ArrowLeft, TrendingDown, TrendingUp, Clock, Calendar, AlertTriangle, Activity, BarChart3 } from 'lucide-react';
import HeatmapChart from '../../components/HeatmapChart';
import FeatureImportanceChart from '../alerts/components/FeatureImportanceChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StudentDetailViewProps {
  backUrl: string;
  backLabel?: string;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ backUrl, backLabel = 'Back to List' }) => {
  const navigate = useNavigate();
  const { nis } = useParams<{ nis: string }>();

  // Month selection state for attendance heatmap
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: student, isLoading: studentLoading } = useStudentQuery(nis);
  const { data: riskProfile, isLoading: riskLoading } = useStudentRiskQuery(nis);
  const { data: riskHistoryData, isLoading: historyLoading } = useRiskHistoryQuery(nis);
  const { data: attendanceData, isLoading: attendanceLoading } = useStudentAttendanceQuery(nis, { month: selectedMonth });

  // Format month title for display
  const monthTitle = useMemo(() => {
    try {
      const [y, m] = selectedMonth.split('-').map(Number);
      return new Date(y, m - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return 'Monthly';
    }
  }, [selectedMonth]);

  if (studentLoading || riskLoading || historyLoading || attendanceLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) return <div className="p-10 text-center">Student not found.</div>;

  // Ensure riskHistory is an array
  const riskHistory = Array.isArray(riskHistoryData)
    ? riskHistoryData
    : (riskHistoryData?.data && Array.isArray(riskHistoryData.data))
      ? riskHistoryData.data
      : [];

  const recentHistory = riskHistory.slice(-10);

  // Chart data for risk score trend
  const trendData = {
    labels: recentHistory.map((h: any) => {
      const date = h.calculated_at || h.date;
      return date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    }),
    datasets: [
      {
        label: 'Risk Score',
        data: recentHistory.map((h: any) => {
          const score = h.risk_score || 0;
          // If score is already percentage (e.g., 85), use as is; if decimal (e.g., 0.85), multiply by 100
          return score > 1 ? score : score * 100;
        }),
        borderColor: '#1a56db',
        backgroundColor: 'rgba(26, 86, 219, 0.5)',
        tension: 0.4,
      },
    ],
  } as any;

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Risk Score Trend (%)' },
    },
    scales: { y: { min: 0, max: 100 } },
  } as any;

  // Use risk profile data for current risk info
  const riskLevel = riskProfile?.risk_level || 'low';
  const riskScore = riskProfile?.risk_score || riskProfile?.probability || 0;
  const displayScore = riskScore > 1 ? riskScore : riskScore * 100;
  const factors = riskProfile?.factors;
  const explanationText = riskProfile?.explanation_text;

  // Risk level styling based on ML tier (RED/YELLOW/GREEN)
  const getRiskLevelStyle = (level: string) => {
    const normalized = level?.toLowerCase();
    if (normalized === 'critical' || normalized === 'high') {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        label: normalized === 'critical' ? 'CRITICAL' : 'HIGH',
        icon: '🔴',
      };
    } else if (normalized === 'medium') {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        label: 'MEDIUM',
        icon: '🟡',
      };
    }
    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'LOW',
      icon: '🟢',
    };
  };

  const riskStyle = getRiskLevelStyle(riskLevel);

  const handleMarkContacted = () => {
    alert(`Marked ${student.name} as contacted. This action would be recorded in the system.`);
  };

  // Parse explanation text into sections
  const parseExplanation = (text?: string) => {
    if (!text) return { mainFactors: [], rules: [] };

    const sections = text.split('\n\n');
    const mainFactors: string[] = [];
    const rules: string[] = [];

    sections.forEach(section => {
      if (section.includes('Faktor Utama') || section.includes('Berdasarkan Bobot')) {
        const lines = section.split('\n').slice(1);
        lines.forEach(line => {
          const cleaned = line.replace(/^[-•]\s*/, '').trim();
          if (cleaned) mainFactors.push(cleaned);
        });
      } else if (section.includes('Logika Deteksi') || section.includes('Aturan')) {
        const lines = section.split('\n').slice(1);
        lines.forEach(line => {
          const cleaned = line.replace(/^[-•]\s*/, '').trim();
          if (cleaned) rules.push(cleaned);
        });
      }
    });

    return { mainFactors, rules };
  };

  const { mainFactors, rules } = parseExplanation(explanationText);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(backUrl)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
      </button>

      {/* Header with Student Info and Risk Level */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
            {(student.name || '').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <span className="mr-3">NIS: {student.nis}</span>
              <span className="mr-3">•</span>
              <span className="mr-3">Class: {student.class_name || riskProfile?.class_name || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${riskStyle.bg} ${riskStyle.border} ${riskStyle.text}`}>
            <span className="text-xs font-semibold uppercase opacity-75">Risk Level</span>
            <span className="font-bold text-lg flex items-center gap-2">
              <span>{riskStyle.icon}</span>
              {riskStyle.label}
            </span>
          </div>
          <div className="px-4 py-2 rounded-lg border bg-gray-50 border-gray-100 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase text-gray-500">Risk Score</span>
            <span className="font-bold text-lg text-gray-900">{displayScore.toFixed(1)}%</span>
          </div>
          {riskProfile?.is_rule_overridden && (
            <div className="px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold">
              Rule Override
            </div>
          )}
          {riskProfile?.data_quality?.is_low_quality && (
            <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> Low Data Quality
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap moved to sidebar */}

          {/* Risk Factors from ML - Based on explanation_text */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertOctagon className="w-5 h-5 mr-2 text-red-500" /> Risk Factors (ML Analysis)
            </h3>

            {/* Main Factors from ML explanation */}
            {mainFactors.length > 0 ? (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-semibold text-gray-700">Faktor Utama Risiko:</p>
                {mainFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="min-w-[4px] h-4 mt-1 bg-red-500 rounded-full mr-3" />
                    <p className="text-sm text-gray-800">{factor}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Rule-based triggers */}
            {rules.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-yellow-600" />
                  Logika Deteksi (Aturan):
                </p>
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <div className="min-w-[4px] h-4 mt-1 bg-yellow-500 rounded-full mr-3" />
                    <p className="text-sm text-gray-800 font-mono">{rule}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback if no explanation text */}
            {!explanationText && !mainFactors.length && !rules.length && factors && (
              <div className="space-y-3">
                {factors.absent_count > 0 && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-red-500 mr-3" />
                    <p className="text-sm text-gray-800">Total Absences: <strong>{factors.absent_count} days</strong> ({(factors.absent_ratio * 100).toFixed(1)}%)</p>
                  </div>
                )}
                {factors.late_count > 0 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                    <p className="text-sm text-gray-800">Late Arrivals: <strong>{factors.late_count} days</strong> ({(factors.late_ratio * 100).toFixed(1)}%)</p>
                  </div>
                )}
                {factors.trend_score !== 0 && (
                  <div className={`flex items-center p-3 ${factors.trend_score < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} rounded-lg border`}>
                    {factors.trend_score < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-500 mr-3" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-green-500 mr-3" />
                    )}
                    <p className="text-sm text-gray-800">
                      7-Day Trend: <strong>{factors.trend_score > 0 ? 'Improving' : 'Declining'}</strong> ({factors.trend_score.toFixed(2)})
                    </p>
                  </div>
                )}
                {factors.is_rule_triggered && (
                  <div className="flex items-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                    <p className="text-sm text-gray-800 font-semibold">Rule-based threshold exceeded (absent_ratio &gt; 15% atau absent_count &gt; 5)</p>
                  </div>
                )}
              </div>
            )}

            {!explanationText && !factors && (
              <p className="text-gray-500 italic">No specific risk factors identified.</p>
            )}
          </div>

          {/* Attendance Statistics */}
          {factors && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" /> Attendance Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{factors.present_count}</p>
                  <p className="text-xs text-green-600 font-medium">Present</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-700">{factors.late_count}</p>
                  <p className="text-xs text-yellow-600 font-medium">Late</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{factors.absent_count}</p>
                  <p className="text-xs text-red-600 font-medium">Absent</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{(factors.permission_count || 0) + (factors.sick_count || 0)}</p>
                  <p className="text-xs text-blue-600 font-medium">Excused</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attendance Rate:</span>
                  <span className="font-bold text-gray-900">{((factors.attendance_ratio || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Total School Days:</span>
                  <span className="font-bold text-gray-900">{factors.total_days} days</span>
                </div>
                {(factors.recording_completeness !== undefined || riskProfile?.data_quality?.recording_completeness !== undefined) && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Recording Completeness:</span>
                    <span className={`font-bold ${((factors.recording_completeness ?? riskProfile?.data_quality?.recording_completeness ?? 0) < 0.7) ? 'text-amber-600' : 'text-gray-900'}`}>
                      {(((factors.recording_completeness ?? riskProfile?.data_quality?.recording_completeness) ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {(factors.longest_gap_days !== undefined || riskProfile?.data_quality?.longest_gap_days !== undefined) && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Longest Gap:</span>
                    <span className="font-bold text-gray-900">
                      {factors.longest_gap_days ?? riskProfile?.data_quality?.longest_gap_days ?? 0} days
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Prediction Method:</span>
                  <span className="font-bold text-gray-900 capitalize">{riskProfile?.prediction_method || 'ML'}</span>
                </div>
                {riskProfile?.model_version && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Model Version:</span>
                    <span className="font-bold text-gray-900">{riskProfile.model_version}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feature Importance Chart */}
          {factors && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" /> Feature Importance
              </h3>
              <FeatureImportanceChart factors={factors} />
            </div>
          )}

          {/* Risk Score Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Risk History Trend</h3>
            {riskHistory.length > 0 ? (
              <Line data={trendData} options={trendOptions} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No risk history data available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Risk scores will appear here once data is collected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Student Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">NIS:</span>
                <span className="font-medium">{student.nis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Class:</span>
                <span className="font-medium">{student.class_name || riskProfile?.class_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{student.parent_phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Attendance Heatmap (Monthly) - moved to sidebar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <HeatmapChart
              attendanceData={attendanceData || []}
              title={`Student Attendance Heatmap`}
              showMonthNavigator={true}
              compact
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>

          {/* Recommended Actions based on Risk Tier */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Recommended Actions
            </h3>
            {riskLevel === 'high' || riskLevel === 'critical' ? (
              <ul className="space-y-4">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold mr-3 mt-0.5">1</span>
                  <strong>Contact parent/guardian immediately</strong>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold mr-3 mt-0.5">2</span>
                  Schedule emergency meeting with BK counselor
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold mr-3 mt-0.5">3</span>
                  Document all interventions taken
                </li>
              </ul>
            ) : riskLevel === 'medium' ? (
              <ul className="space-y-4">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold mr-3 mt-0.5">1</span>
                  Schedule parent meeting within 1 week
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold mr-3 mt-0.5">2</span>
                  Monitor closely for the next 2 weeks
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold mr-3 mt-0.5">3</span>
                  Check-in with student weekly
                </li>
              </ul>
            ) : (
              <ul className="space-y-4">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold mr-3 mt-0.5">1</span>
                  Continue regular monitoring
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold mr-3 mt-0.5">2</span>
                  Positive reinforcement for good attendance
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold mr-3 mt-0.5">3</span>
                  Monthly check-in as needed
                </li>
              </ul>
            )}
            <button
              onClick={handleMarkContacted}
              className="mt-6 w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Mark as Contacted
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
