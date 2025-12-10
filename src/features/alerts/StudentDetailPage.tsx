import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from './context/StudentProvider';
import { StudentDetail } from './models';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertOctagon, CheckCircle, ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StudentDetailPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const student = useContext(StudentContext);

  if (!student) return <div className="p-10 text-center">Student not found.</div>;

  // Type guard for extended student details
  const isDetail = (s: unknown): s is StudentDetail => {
    if (!s || typeof s !== 'object') return false;
    const o = s as Record<string, unknown>;
    return (Array.isArray(o.weeklyTrend) || Array.isArray(o.triggeredRules) || Array.isArray(o.recommendations) || !!o.attendanceStats);
  };

  const weeklyTrend = isDetail(student) && Array.isArray(student.weeklyTrend) ? student.weeklyTrend : [];
  const triggeredRules = isDetail(student) && Array.isArray(student.triggeredRules) ? student.triggeredRules : [];
  const recommendations = isDetail(student) && Array.isArray(student.recommendations) ? student.recommendations : [];
  const attendanceStats = isDetail(student) && student.attendanceStats ? student.attendanceStats : { present: 0, absent: 0 };

  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: weeklyTrend.map((val: number) => val * 100),
        borderColor: '#1a56db',
        backgroundColor: 'rgba(26, 86, 219, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Weekly Attendance Trend (%)' },
    },
    scales: { y: { min: 0, max: 100 } },
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
              <span className="mr-3">Class: {student.class}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${student.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100 text-red-700' : student.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
            <span className="text-xs font-semibold uppercase opacity-75">Risk Level</span>
            <span className="font-bold text-lg">{student.riskLevel}</span>
          </div>
          <div className="px-4 py-2 rounded-lg border bg-gray-50 border-gray-100 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase text-gray-500">Probability</span>
            <span className="font-bold text-lg text-gray-900">{(student.probability * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><AlertOctagon className="w-5 h-5 mr-2 text-primary" /> Risk Factors (Explainability)</h3>
            <div className="space-y-3">
              {triggeredRules.map((rule: string, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="min-w-[4px] h-4 mt-1 bg-red-500 rounded-full mr-3" />
                  <p className="text-sm text-gray-800 font-medium">{rule}</p>
                </div>
              ))}
              {triggeredRules.length === 0 && <p className="text-gray-500 italic">No specific risk rules triggered currently.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Present</p>
              <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Absent</p>
              <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Recommendations</h3>
            <ul className="space-y-4">
              {recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start text-sm text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-3 mt-0.5">{idx + 1}</span>
                  {rec}
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Mark as Contacted</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
