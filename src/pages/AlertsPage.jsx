import React, { useEffect, useState } from 'react';
import { getAlertsList } from '../services/api';
import { Filter, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlertsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, HIGH, MEDIUM

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAlertsList('teacher123');
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching alerts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredStudents = students.filter(s => {
        if (filter === 'ALL') return true;
        return s.riskLevel === filter;
    });

    const getRiskColor = (level) => {
        if (level === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
        if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prioritized Alerts</h1>
                    <p className="text-gray-500">Manage student interventions based on risk factors.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('HIGH')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'HIGH' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        High Risk
                    </button>
                    <button
                        onClick={() => setFilter('MEDIUM')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Medium Risk
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Probability</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                {student.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-500">NIS: {student.nis} • {student.class}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(student.riskLevel)}`}>
                                            {student.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className={`h-2 rounded-full ${student.probability > 0.7 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${student.probability * 100}%` }}
                                                ></div>
                                            </div>
                                            <span>{(student.probability * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                to={`/students/${student.nis}`}
                                                className="text-primary hover:text-primary/80 flex items-center text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </Link>
                                            <button className="text-gray-400 hover:text-green-600 flex items-center text-sm font-medium transition-colors">
                                                <CheckCircle className="w-4 h-4 mr-1" /> Ack
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStudents.length === 0 && (
                    <div className="p-10 text-center text-gray-500">No students found matching the filter.</div>
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
