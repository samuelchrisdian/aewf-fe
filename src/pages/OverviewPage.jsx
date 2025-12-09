import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import DashboardCards from '../components/DashboardCards';
import HeatmapChart from '../components/HeatmapChart';
import { getOverviewData } from '../services/api';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getOverviewData('10-A'); // Hardcoded classId for demo
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch overview data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex h-full items-center justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    if (!data) return <div className="p-10 text-center text-gray-500">Failed to load data.</div>;

    const chartData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                data: [data.riskDistribution.low, data.riskDistribution.medium, data.riskDistribution.high],
                backgroundColor: [
                    '#16a34a', // Green
                    '#d97706', // Amber
                    '#dc2626', // Red
                ],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
                <p className="text-gray-500">Welcome back, Teacher. Here is the summary for Class 10-A.</p>
            </div>

            <DashboardCards data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Distribution</h3>
                    <div className="h-64 relative">
                        <Doughnut data={chartData} options={chartOptions} />
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-800">{data.totalStudents}</span>
                            <span className="text-xs text-gray-500">Students</span>
                        </div>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="lg:col-span-2">
                    <HeatmapChart />
                </div>
            </div>

            {/* Recent Alerts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Recent Alerts</h3>
                    <Link to="/alerts" className="text-sm text-primary font-medium hover:text-primary/80 flex items-center">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {data.recentAlerts.map(alert => (
                        <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${alert.riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{alert.studentName}</p>
                                    <p className="text-xs text-gray-500">{alert.reason}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">{alert.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
