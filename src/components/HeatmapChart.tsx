import React, { useMemo } from 'react';

interface AttendanceRecord {
    date: string;
    attendance_date?: string;
    status: string;
}

interface HeatmapChartProps {
    attendanceData?: AttendanceRecord[];
    title?: string;
}

const HeatmapChart = ({ attendanceData = [], title = 'Attendance Heatmap (Last 30 Days)' }: HeatmapChartProps): React.ReactElement => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Process attendance data into heatmap format
    const { weeks, data } = useMemo(() => {
        try {
            const today = new Date();
            const last30Days: { date: Date; weekIndex: number; dayIndex: number }[] = [];

            // Generate last 28 days (4 weeks) for clean display
            for (let i = 27; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dayOfWeek = date.getDay();
                // Skip weekends (0 = Sunday, 6 = Saturday)
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    last30Days.push({
                        date,
                        weekIndex: Math.floor((27 - i) / 7),
                        dayIndex: dayOfWeek - 1 // 0 = Monday
                    });
                }
            }

            // Create attendance map by date
            const attendanceMap = new Map<string, string>();
            if (Array.isArray(attendanceData)) {
                attendanceData.forEach(record => {
                    if (!record) return;
                    const dateStr = record.attendance_date || record.date;
                    if (dateStr) {
                        try {
                            const parsedDate = new Date(dateStr);
                            if (!isNaN(parsedDate.getTime())) {
                                const normalizedDate = parsedDate.toISOString().split('T')[0];
                                attendanceMap.set(normalizedDate, (record.status || 'unknown').toLowerCase());
                            }
                        } catch {
                            // Skip invalid dates
                        }
                    }
                });
            }

            // Generate week labels
            const weekLabels: string[] = [];
            const gridData: number[][] = [];

            // Group by weeks
            const weekData: Map<number, { dayIndex: number; status: number }[]> = new Map();

            last30Days.forEach(({ date, weekIndex, dayIndex }) => {
                const dateStr = date.toISOString().split('T')[0];
                const status = attendanceMap.get(dateStr);

                let statusCode = -1; // -1 = no data
                if (status) {
                    if (status === 'present') statusCode = 0;
                    else if (status === 'late') statusCode = 1;
                    else if (status === 'absent') statusCode = 2;
                    else if (status === 'permission' || status === 'sick') statusCode = 3;
                    else statusCode = 0; // Default to present
                }

                if (!weekData.has(weekIndex)) {
                    weekData.set(weekIndex, []);
                }
                weekData.get(weekIndex)!.push({ dayIndex, status: statusCode });
            });

            // Convert to grid format
            weekData.forEach((dayStatuses, weekIndex) => {
                weekLabels.push(`Week ${weekIndex + 1}`);

                // Initialize week row with -1 (no data)
                const weekRow = [-1, -1, -1, -1, -1];
                dayStatuses.forEach(({ dayIndex, status }) => {
                    if (dayIndex >= 0 && dayIndex < 5) {
                        weekRow[dayIndex] = status;
                    }
                });
                gridData.push(weekRow);
            });

            // Ensure we have at least 4 weeks
            while (weekLabels.length < 4) {
                weekLabels.push(`Week ${weekLabels.length + 1}`);
                gridData.push([-1, -1, -1, -1, -1]);
            }

            return { weeks: weekLabels.slice(0, 4), data: gridData.slice(0, 4) };
        } catch (error) {
            console.error('Error processing heatmap data:', error);
            // Return default empty grid
            return {
                weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [
                    [-1, -1, -1, -1, -1],
                    [-1, -1, -1, -1, -1],
                    [-1, -1, -1, -1, -1],
                    [-1, -1, -1, -1, -1],
                ]
            };
        }
    }, [attendanceData]);

    const getColor = (status: number) => {
        if (status === 0) return 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200';
        if (status === 1) return 'bg-yellow-100 border-yellow-200 text-yellow-700 hover:bg-yellow-200';
        if (status === 2) return 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200';
        if (status === 3) return 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200';
        return 'bg-gray-50 border-gray-200 text-gray-400';
    };

    const getLabel = (status: number) => {
        if (status === 0) return 'P';
        if (status === 1) return 'L';
        if (status === 2) return 'A';
        if (status === 3) return 'E'; // Excused (Permission/Sick)
        return '-';
    };

    const getTooltip = (status: number) => {
        if (status === 0) return 'Present';
        if (status === 1) return 'Late';
        if (status === 2) return 'Absent';
        if (status === 3) return 'Excused (Permission/Sick)';
        return 'No Data';
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                    <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 mb-2">
                        <div className="font-semibold text-gray-500 text-sm"></div>
                        {days.map((d) => (
                            <div key={d} className="text-center text-sm font-semibold text-gray-500">
                                {d}
                            </div>
                        ))}
                    </div>
                    {weeks.map((week, wIndex) => (
                        <div key={week} className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 mb-2">
                            <div className="flex items-center text-sm font-medium text-gray-600">{week}</div>
                            {(data[wIndex] || [-1, -1, -1, -1, -1]).map((status, dIndex) => (
                                <div
                                    key={dIndex}
                                    className={`h-10 rounded-md border flex items-center justify-center cursor-pointer transition-colors text-xs font-bold ${getColor(status)}`}
                                    title={getTooltip(status)}
                                >
                                    {getLabel(status)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></div> Present
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-1"></div> Late
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></div> Absent
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-1"></div> Excused
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-1"></div> No Data
                </div>
            </div>
        </div>
    );
};

export default HeatmapChart;
