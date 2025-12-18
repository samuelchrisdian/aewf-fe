import React, { useMemo, useCallback, useState } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { useRiskListQuery, useAlertAction } from './queries';

const AlertsPage = (): React.ReactElement => {
    const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [search, setSearch] = useState('');

    const { data: students = [], isLoading: loading } = useRiskListQuery({
        level: filter !== 'ALL' ? filter.toLowerCase() as any : undefined,
    });

    const getRiskColor = useCallback((level: string) => {
        const normalized = level?.toUpperCase();
        if (normalized === 'CRITICAL' || normalized === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
        if (normalized === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Student',
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {String(student.name || '').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">NIS: {student.nis} • {student.class_name || 'N/A'}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'risk_level',
            header: 'Risk Level',
            cell: ({ getValue }) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(getValue())}`}>
                    {String(getValue()).toUpperCase()}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'risk_score',
            header: 'Risk Score',
            cell: ({ getValue }) => {
                const score = getValue() as number;
                const percentage = Math.min(score * 100, 100);
                return (
                    <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className={`h-2 rounded-full ${score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span>{percentage.toFixed(0)}%</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <Link to={`/alerts/${student.nis}`} className="text-primary hover:text-primary/80 flex items-center text-sm font-medium">
                            <Eye className="w-4 h-4 mr-1" /> View
                        </Link>
                        <button className="text-gray-400 hover:text-green-600 flex items-center text-sm font-medium transition-colors">
                            <CheckCircle className="w-4 h-4 mr-1" /> Ack
                        </button>
                    </div>
                );
            },
            enableSorting: false,
        },
    ], [getRiskColor]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prioritized Alerts</h1>
                    <p className="text-gray-500">Manage student interventions based on risk factors.</p>
                    <div className="mt-3">
                        <div className="relative text-gray-400">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch && setSearch(e.target.value); }}
                                placeholder="Search name, NIS, or class..."
                                className="w-full md:w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={() => setFilter && setFilter('ALL')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
                    <button onClick={() => setFilter && setFilter('HIGH')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'HIGH' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>High Risk</button>
                    <button onClick={() => setFilter && setFilter('MEDIUM')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500 hover:bg-gray-50'}`}>Medium Risk</button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={students}
                    initialState={{ pagination: { pageSize: 10 }, sorting: [{ id: 'probability', desc: true }] }}
                    noDataMessage="No students found matching the filter."
                />
            </div>
        </div>
    );
};

export default AlertsPage;
