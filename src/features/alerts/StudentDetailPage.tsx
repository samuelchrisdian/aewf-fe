import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentQuery, useRiskHistoryQuery } from './queries';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertOctagon, CheckCircle, ArrowLeft } from 'lucide-react';
import HeatmapChart from '../../components/HeatmapChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StudentDetailPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { nis } = useParams<{ nis: string }>();

  const { data: student, isLoading: studentLoading } = useStudentQuery(nis);
  const { data: riskHistoryData, isLoading: historyLoading } = useRiskHistoryQuery(nis);

  if (studentLoading || historyLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!student) return <div className="p-10 text-center">Student not found.</div>;

  // Ensure riskHistory is an array
  const riskHistory = Array.isArray(riskHistoryData)
    ? riskHistoryData
    : (riskHistoryData?.data && Array.isArray(riskHistoryData.data))
    ? riskHistoryData.data
    : [];

  const recentHistory = riskHistory.slice(-10);

  const trendData = {
    labels: recentHistory.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Risk Score',
        data: recentHistory.map(h => h.risk_score * 100),
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

  const latestRisk = riskHistory.length > 0 ? riskHistory[riskHistory.length - 1] : null;
  const riskLevel = latestRisk?.risk_level || 'low';
  const riskScore = latestRisk?.risk_score || 0;

  const handleMarkContacted = () => {
    // This would typically call an API endpoint to record the contact
    alert(`Marked ${student.name} as contacted. This action would be recorded in the system.`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Alerts
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">{(student.name || '').substring(0, 2).toUpperCase()}</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <span className="mr-3">NIS: {student.nis}</span>
              <span className="mr-3">•</span>
              <span className="mr-3">Class: {student.class_name || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${
            riskLevel === 'critical' || riskLevel === 'high' 
              ? 'bg-red-50 border-red-100 text-red-700' 
              : riskLevel === 'medium' 
              ? 'bg-yellow-50 border-yellow-100 text-yellow-700' 
              : 'bg-green-50 border-green-100 text-green-700'
          }`}>
            <span className="text-xs font-semibold uppercase opacity-75">Risk Level</span>
            <span className="font-bold text-lg">{riskLevel.toUpperCase()}</span>
          </div>
          <div className="px-4 py-2 rounded-lg border bg-gray-50 border-gray-100 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase text-gray-500">Risk Score</span>
            <span className="font-bold text-lg text-gray-900">{(riskScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Heatmap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Pattern</h3>
            <HeatmapChart />
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><AlertOctagon className="w-5 h-5 mr-2 text-primary" /> Risk Factors</h3>
            <div className="space-y-3">
              {latestRisk?.factors?.map((factor: string, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="min-w-[4px] h-4 mt-1 bg-red-500 rounded-full mr-3" />
                  <p className="text-sm text-gray-800 font-medium">{factor}</p>
                </div>
              )) || <p className="text-gray-500 italic">No specific risk factors identified.</p>}
            </div>
          </div>

          {/* Risk Score Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                <span className="font-medium">{student.class_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{student.parent_phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Recommendations</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-gray-700">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-3 mt-0.5">1</span>
                Contact parent to discuss attendance patterns
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-3 mt-0.5">2</span>
                Schedule one-on-one meeting with student
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-3 mt-0.5">3</span>
                Monitor closely for the next 2 weeks
              </li>
            </ul>
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

export default StudentDetailPage;
