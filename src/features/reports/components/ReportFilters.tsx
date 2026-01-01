import React from 'react';
import { Calendar, Filter } from 'lucide-react';

interface Class {
    class_id: string;
    class_name: string;
}

interface ReportFiltersProps {
    startDate: string;
    endDate: string;
    classId: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onClassChange: (classId: string) => void;
    classes?: Class[];
    isLoading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
    startDate,
    endDate,
    classId,
    onStartDateChange,
    onEndDateChange,
    onClassChange,
    classes = [],
    isLoading = false,
}) => {
    return (
        <div className="flex flex-wrap gap-4 items-end">
            {/* Start Date */}
            <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Mulai
                </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    disabled={isLoading}
                />
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Akhir
                </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    disabled={isLoading}
                />
            </div>

            {/* Class Filter */}
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Kelas
                </label>
                <select
                    value={classId}
                    onChange={(e) => onClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white"
                    disabled={isLoading}
                >
                    <option value="">Semua Kelas</option>
                    {classes.map((cls) => (
                        <option key={cls.class_id} value={cls.class_id}>
                            {cls.class_name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ReportFilters;
