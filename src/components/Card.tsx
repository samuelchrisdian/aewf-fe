import React from 'react';
import { TrendingDown } from 'lucide-react';

type CardProps = {
    title: string;
    value: React.ReactNode;
    subtext?: string;
    Icon: React.ComponentType<any>;
    colorClass?: string;
    trend?: 'up' | 'down' | string;
};

const Card = ({ title, value, subtext, Icon, colorClass = '', trend }: CardProps): React.ReactElement => {
    void TrendingDown;
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

export default Card;
