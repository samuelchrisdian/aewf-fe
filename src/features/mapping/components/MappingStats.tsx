import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { MappingStats as MappingStatsType } from '@/types/api';

interface MappingStatsProps {
    stats: MappingStatsType | undefined;
    isLoading?: boolean;
}

export const MappingStats: React.FC<MappingStatsProps> = ({ stats, isLoading }) => {
    const statCards = [
        {
            label: 'Total Users',
            value: stats?.total_users ?? 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Mapped',
            value: stats?.mapped ?? 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            percentage: stats ? Math.round((stats.mapped / stats.total_users) * 100) : 0,
        },
        {
            label: 'Pending',
            value: stats?.pending ?? 0,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            percentage: stats ? Math.round((stats.pending / stats.total_users) * 100) : 0,
        },
        {
            label: 'Unmapped',
            value: stats?.unmapped ?? 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            percentage: stats ? Math.round((stats.unmapped / stats.total_users) * 100) : 0,
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                        <div className="h-6 w-16 bg-gray-200 rounded mb-1" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                            {stat.label}
                            {stat.percentage !== undefined && stat.percentage > 0 && (
                                <span className={`text-xs ${stat.color}`}>({stat.percentage}%)</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
