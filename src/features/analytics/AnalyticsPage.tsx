import React, { useState } from 'react';
import { useAttendanceTrendsQuery, useClassComparisonQuery } from './queries';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, BarChart3, Calendar, Download } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsPage = (): React.ReactElement => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [comparisonMonth, setComparisonMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: trendsData, isLoading: trendsLoading } = useAttendanceTrendsQuery(period);
  const { data: classComparisonData, isLoading: comparisonLoading } = useClassComparisonQuery(comparisonMonth);

  // Ensure data is always arrays
  const trends = Array.isArray(trendsData)
    ? trendsData
    : (trendsData?.data && Array.isArray(trendsData.data))
    ? trendsData.data
    : [];

  const classComparison = Array.isArray(classComparisonData)
    ? classComparisonData
    : (classComparisonData?.data && Array.isArray(classComparisonData.data))
    ? classComparisonData.data
    : [];

  // Attendance Trends Chart Data
  const trendChartData = {
    labels: trends.map(t => t?.date || ''),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: trends.map(t => t?.attendance_rate || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Attendance Trends - ${period === 'weekly' ? 'Weekly' : 'Monthly'}`,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  // Class Comparison Chart Data
  const comparisonChartData = {
    labels: classComparison.map(c => c?.class_name || ''),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: classComparison.map(c => c?.attendance_rate || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Class Comparison - Attendance Rate',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  // Calculate overall stats
  const overallAttendanceRate = trends.length > 0
    ? (trends.reduce((sum, t) => sum + (t?.attendance_rate || 0), 0) / trends.length).toFixed(1)
    : '0';

  const bestClass = classComparison.length > 0
    ? classComparison.reduce((best, current) =>
        (current?.attendance_rate || 0) > (best?.attendance_rate || 0) ? current : best
      )
    : null;

  const worstClass = classComparison.length > 0
    ? classComparison.reduce((worst, current) =>
        (current?.attendance_rate || 100) < (worst?.attendance_rate || 100) ? current : worst
      )
    : null;

  const handleExportReport = () => {
    if (!classComparison || classComparison.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Class Name', 'Attendance Rate (%)', 'Total Students', 'Risk Students'];
    const rows = classComparison.map(cls => [
      cls.class_name,
      cls.attendance_rate.toFixed(2),
      cls.total_students,
      cls.risk_students
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_report_${comparisonMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Analyze attendance trends and class performance</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Overall Attendance</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{overallAttendanceRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Average rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Best Class</p>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{bestClass?.class_name || '-'}</p>
          <p className="text-xs text-gray-500 mt-1">{bestClass?.attendance_rate.toFixed(1)}% rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Needs Attention</p>
            <BarChart3 className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{worstClass?.class_name || '-'}</p>
          <p className="text-xs text-gray-500 mt-1">{worstClass?.attendance_rate.toFixed(1)}% rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Classes</p>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{classComparison?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Being tracked</p>
        </div>
      </div>

      {/* Attendance Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Attendance Trends</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                period === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                period === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {trendsLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-80">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        )}
      </div>

      {/* Class Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Class Performance</h3>
            <input
              type="month"
              value={comparisonMonth}
              onChange={(e) => setComparisonMonth(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {comparisonLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-80">
              <Bar data={comparisonChartData} options={comparisonChartOptions} />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Breakdown</h3>
          <div className="space-y-3">
            {comparisonLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : classComparison && classComparison.length > 0 ? (
              classComparison.map((cls) => (
                <div
                  key={cls.class_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cls.class_name}</p>
                    <p className="text-sm text-gray-500">
                      {cls.total_students} students • {cls.risk_students} at risk
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {cls.attendance_rate.toFixed(1)}%
                    </p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          cls.attendance_rate >= 90
                            ? 'bg-green-500'
                            : cls.attendance_rate >= 75
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${cls.attendance_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

