import React from 'react';

const HeatmapChart = () => {
    // Mock data for heatmap: 4 weeks x 5 days
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    // Generate random attendance status
    // 0: Present (Green), 1: Late (Yellow), 2: Absent (Red)
    const generateData = () => {
        return days.map(() => {
            const r = Math.random();
            if (r > 0.9) return 2; // Absent
            if (r > 0.8) return 1; // Late
            return 0; // Present
        });
    };

    const data = weeks.map(() => generateData());

    const getColor = (status) => {
        if (status === 0) return 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200';
        if (status === 1) return 'bg-yellow-100 border-yellow-200 text-yellow-700 hover:bg-yellow-200';
        if (status === 2) return 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200';
        return 'bg-gray-100';
    };

    const getLabel = (status) => {
        if (status === 0) return 'P';
        if (status === 1) return 'L';
        if (status === 2) return 'A';
        return '-';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Class Attendance Heatmap (Last 30 Days)</h3>
            <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                    <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 mb-2">
                        <div className="font-semibold text-gray-500 text-sm"></div>
                        {days.map(d => <div key={d} className="text-center text-sm font-semibold text-gray-500">{d}</div>)}
                    </div>
                    {weeks.map((week, wIndex) => (
                        <div key={week} className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 mb-2">
                            <div className="flex items-center text-sm font-medium text-gray-600">{week}</div>
                            {data[wIndex].map((status, dIndex) => (
                                <div
                                    key={dIndex}
                                    className={`h-10 rounded-md border flex items-center justify-center cursor-pointer transition-colors text-xs font-bold ${getColor(status)}`}
                                    title={`Status: ${getLabel(status)}`}
                                >
                                    {getLabel(status)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></div> Present</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-1"></div> Late</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></div> Absent</div>
            </div>
        </div>
    );
};

export default HeatmapChart;
