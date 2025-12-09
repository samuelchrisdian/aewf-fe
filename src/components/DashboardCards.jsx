import React from 'react';
import { Users, TrendingDown, AlertTriangle, Activity } from 'lucide-react';

const Card = ({ title, value, subtext, icon: Icon, colorClass, trend }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && (
                    <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                        {trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                        <span>{subtext}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

const DashboardCards = ({ data }) => {
    const { totalStudents, avgAttendance, riskDistribution } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card
                title="Total Students"
                value={totalStudents}
                subtext="Tracking 10th Grade"
                icon={Users}
                colorClass="bg-blue-500"
            />
            <Card
                title="Avg. Attendance"
                value={`${avgAttendance}%`}
                subtext="-1.2% from last week"
                trend="down"
                icon={Activity}
                colorClass="bg-purple-500"
            />
            <Card
                title="High Risk Students"
                value={riskDistribution.high}
                subtext="Requires immediate attention"
                trend="down"
                icon={AlertTriangle}
                colorClass="bg-red-500"
            />
            <Card
                title="At Risk (Medium)"
                value={riskDistribution.medium}
                subtext="Monitor closely"
                icon={AlertTriangle}
                colorClass="bg-yellow-500"
            />
        </div>
    );
};

export default DashboardCards;
