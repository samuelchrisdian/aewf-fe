import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceRecord {
    date: string;
    attendance_date?: string;
    status: string;
}

interface HeatmapChartProps {
    attendanceData?: AttendanceRecord[];
    title?: string;
    showMonthNavigator?: boolean;
    compact?: boolean;
    month?: string; // YYYY-MM, controlled by parent (optional)
    onMonthChange?: (month: string) => void;
}

interface DayCell {
    date: number;
    dateStr: string;
    dayName: string;
    status: number;
    isCurrentMonth: boolean;
}

const HeatmapChart = ({ attendanceData = [], title = 'Attendance Heatmap', showMonthNavigator = true, compact = false, month, onMonthChange }: HeatmapChartProps): React.ReactElement => {
    const [displayDate, setDisplayDate] = useState<Date>(new Date());

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const normalizeStatus = (raw?: string) => {
        const s = (raw || '').toString().trim().toLowerCase();
        if (!s) return 'unknown';
        if (['present', 'hadir', 'p'].includes(s)) return 'present';
        if (['late', 'terlambat', 'l'].includes(s)) return 'late';
        if (['absent', 'alpha', 'a', 'alpa'].includes(s)) return 'absent';
        if (['permission', 'izin', 'i', 'excused'].includes(s)) return 'permission';
        if (['sick', 'sakit', 's'].includes(s)) return 'sick';
        return s;
    };

    // Process attendance data into calendar format
    const { calendarDays, monthYear } = useMemo(() => {
        try {
            const year = displayDate.getFullYear();
            const month = displayDate.getMonth();

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
                                const normalizedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
                                attendanceMap.set(normalizedDate, normalizeStatus(record.status));
                            }
                        } catch {
                            // Skip invalid dates
                        }
                    }
                });
            }

            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            const days: DayCell[] = [];

            // Add previous month days
            for (let i = firstDay - 1; i >= 0; i--) {
                const date = daysInPrevMonth - i;
                const prevMonth = month === 0 ? 11 : month - 1;
                const prevYear = month === 0 ? year - 1 : year;
                const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

                days.push({
                    date,
                    dateStr,
                    dayName: dayNames[(firstDay - 1 - i) % 7],
                    status: -1,
                    isCurrentMonth: false
                });
            }

            // Add current month days
            for (let date = 1; date <= daysInMonth; date++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const status = attendanceMap.get(dateStr);

                let statusCode = -1;
                if (status) {
                    if (status === 'present') statusCode = 0;
                    else if (status === 'late') statusCode = 1;
                    else if (status === 'absent') statusCode = 2;
                    else if (status === 'permission' || status === 'sick' || status === 'excused') statusCode = 3;
                    else statusCode = 0;
                }

                days.push({
                    date,
                    dateStr,
                    dayName: dayNames[(firstDay + date - 1) % 7],
                    status: statusCode,
                    isCurrentMonth: true
                });
            }

            // Add next month days to fill grid
            const remainingCells = 42 - days.length; // 6 rows × 7 days
            for (let date = 1; date <= remainingCells; date++) {
                const nextMonth = month === 11 ? 0 : month + 1;
                const nextYear = month === 11 ? year + 1 : year;
                const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

                days.push({
                    date,
                    dateStr,
                    dayName: dayNames[(firstDay + daysInMonth + date - 1) % 7],
                    status: -1,
                    isCurrentMonth: false
                });
            }

            const monthYearStr = new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

            return { calendarDays: days, monthYear: monthYearStr };
        } catch (error) {
            console.error('Error processing heatmap data:', error);
            return { calendarDays: [], monthYear: '' };
        }
    }, [displayDate, attendanceData]);

    // Keep internal displayDate in sync with controlled month prop
    useEffect(() => {
        if (!month) return;
        const [y, m] = month.split('-').map(Number);
        if (!y || !m) return;
        const target = new Date(y, m - 1, 1);
        if (target.getFullYear() !== displayDate.getFullYear() || target.getMonth() !== displayDate.getMonth()) {
            setDisplayDate(target);
        }
    }, [month]);

    // Auto-jump to the most recent month that has records (only when uncontrolled)
    useEffect(() => {
        if (month) return; // parent controls month
        if (!Array.isArray(attendanceData) || attendanceData.length === 0) return;
        let latest: Date | null = null;
        for (const rec of attendanceData) {
            const dateStr = rec?.attendance_date || rec?.date;
            if (!dateStr) continue;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) continue;
            if (!latest || d > latest) latest = d;
        }
        if (latest) {
            const target = new Date(latest.getFullYear(), latest.getMonth(), 1);
            // Only jump if currently not in the same month-year
            if (
                target.getFullYear() !== displayDate.getFullYear() ||
                target.getMonth() !== displayDate.getMonth()
            ) {
                setDisplayDate(target);
            }
        }
    }, [attendanceData]);

    const getColor = (status: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return 'bg-gray-50 border-gray-100 text-gray-300 cursor-default';
        if (status === 0) return 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200 cursor-pointer';
        if (status === 1) return 'bg-yellow-100 border-yellow-200 text-yellow-700 hover:bg-yellow-200 cursor-pointer';
        if (status === 2) return 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200 cursor-pointer';
        if (status === 3) return 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 cursor-pointer';
        return 'bg-gray-50 border-gray-200 text-gray-400 cursor-pointer';
    };

    const getLabel = (status: number) => {
        if (status === 0) return 'P';
        if (status === 1) return 'L';
        if (status === 2) return 'A';
        if (status === 3) return 'E'; // Excused (Permission/Sick)
        return '-';
    };

    const getTooltip = (status: number, date: number) => {
        if (status === 0) return `${date} - Present`;
        if (status === 1) return `${date} - Late`;
        if (status === 2) return `${date} - Absent`;
        if (status === 3) return `${date} - Excused (Permission/Sick)`;
        return `${date} - No Data`;
    };

    const handlePrevMonth = () => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setDisplayDate(newDate);
        onMonthChange?.(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setDisplayDate(newDate);
        onMonthChange?.(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleToday = () => {
        const now = new Date();
        setDisplayDate(now);
        onMonthChange?.(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    };

    return (
        <div>
            {/* Title - Left aligned */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>

            {/* Month Navigator - Centered */}
            {showMonthNavigator && (
                <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                    >
                        {monthYear}
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Next month"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <div className={compact ? "min-w-[280px]" : "min-w-[600px]"}>
                    {/* Day names header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className={compact ? "text-center text-[10px] font-semibold text-gray-500 py-1" : "text-center text-xs font-semibold text-gray-500 py-2"}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => (
                            <div
                                key={idx}
                                className={`${compact ? "aspect-square" : "aspect-square"} rounded-md border flex flex-col items-center justify-center ${compact ? "text-[10px]" : "text-xs"} font-semibold transition-colors ${getColor(day.status, day.isCurrentMonth)}`}
                                title={getTooltip(day.status, day.date)}
                            >
                                <div className={compact ? "text-[10px] opacity-75" : "text-xs opacity-75"}>{day.date}</div>
                                <div>{getLabel(day.status)}</div>
                            </div>
                        ))}
                    </div>
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
