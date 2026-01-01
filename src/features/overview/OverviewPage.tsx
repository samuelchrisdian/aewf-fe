import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useOverviewQuery } from './queries/useOverviewQuery';
import { Activity, AlertTriangle, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import ModelStatusCard from './components/ModelStatusCard';
import HighRiskStudentsList from './components/HighRiskStudentsList';

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewPage = (): React.ReactElement => {
    const { data, isLoading, error } = useOverviewQuery();

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    if (error || !data) {
        return (
            <div className="p-10 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
                    <p className="text-sm text-red-600">
                        {error ? 'Error connecting to server. Please check if the backend is running.' : 'No data available.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Calculate total risk students
    const totalRiskStudents = (data.risk_summary?.low || 0) +
        (data.risk_summary?.medium || 0) +
        (data.risk_summary?.high || 0) +
        (data.risk_summary?.critical || 0);

    const chartData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
        datasets: [
            {
                data: [
                    data.risk_summary?.low || 0,
                    data.risk_summary?.medium || 0,
                    data.risk_summary?.high || 0,
                    data.risk_summary?.critical || 0,
                ],
                backgroundColor: ['#16a34a', '#d97706', '#dc2626', '#991b1b'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    } as any;

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        maintainAspectRatio: false,
    } as any;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                    title="Total Teachers"
                    value={data?.total_teachers || 0}
                    subtext="Active teachers"
                    Icon={Users}
                    colorClass="bg-green-500"
                />
                <Card
                    title="Total Students"
                    value={data?.total_students || 0}
                    subtext="Active students"
                    Icon={Users}
                    colorClass="bg-blue-500"
                />
                <Card
                    title="Attendance Today"
                    value={`${(data?.attendance_today?.percentage || 0).toFixed(1)}%`}
                    subtext={`${data?.attendance_today?.present || 0} of ${data?.total_students || 0} present`}
                    Icon={Activity}
                    colorClass="bg-purple-500"
                />
                <Card
                    title="High Risk Students"
                    value={data?.risk_summary?.high || 0}
                    subtext="Requires immediate attention"
                    trend="down"
                    Icon={AlertTriangle}
                    colorClass="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Distribution</h3>
                    <div className="h-64 relative flex items-center justify-center">
                        <Doughnut data={chartData} options={chartOptions} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-45px' }}>
                            <div className="text-center">
                                <span className="text-3xl font-bold text-gray-800 block leading-none">{totalRiskStudents}</span>
                                <span className="text-xs text-gray-500 block mt-0.5">Risk Students</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col items-center">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                <span className="text-gray-600">Low:</span>
                                <span className="font-semibold text-green-600">{data.risk_summary?.low || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                                <span className="text-gray-600">Medium:</span>
                                <span className="font-semibold text-yellow-600">{data.risk_summary?.medium || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                <span className="text-gray-600">High:</span>
                                <span className="font-semibold text-red-600">{data.risk_summary?.high || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-red-800"></div>
                                <span className="text-gray-600">Critical:</span>
                                <span className="font-semibold text-red-800">{data.risk_summary?.critical || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Recent Alerts</h3>
                        <Link to="/alerts" className="text-sm text-primary font-medium hover:text-primary/80 flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {data.recent_alerts && data.recent_alerts.length > 0 ? (
                            data.recent_alerts.map((alert) => (
                                <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${alert.risk_level === 'critical' || alert.risk_level === 'high'
                                                ? 'bg-red-500'
                                                : alert.risk_level === 'medium'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{alert.student_name}</p>
                                            <p className="text-xs text-gray-500">{alert.message || 'Risk alert'}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleDateString()}</div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p className="font-medium">No recent alerts</p>
                                <p className="text-xs mt-1">All students are doing well!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ML Model Status & High Risk Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModelStatusCard />
                <HighRiskStudentsList />
            </div>
        </div>
    );
};

export default OverviewPage;
