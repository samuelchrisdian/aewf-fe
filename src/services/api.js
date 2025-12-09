import axios from 'axios';

// Base Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust base URL as needed
    timeout: 10000,
});

// Mock data for development when backend is not available
const MOCK_MODE = true;

const mockOverviewData = {
    totalStudents: 120,
    avgAttendance: 85.5,
    riskDistribution: {
        high: 15,
        medium: 30,
        low: 75,
    },
    recentAlerts: [
        { id: 1, studentName: "John Doe", riskLevel: "HIGH", date: "2023-10-25", reason: "Absent 3 days in a row" },
        { id: 2, studentName: "Jane Smith", riskLevel: "MEDIUM", date: "2023-10-24", reason: "Late arrival trend" },
        { id: 3, studentName: "Alice Johnson", riskLevel: "HIGH", date: "2023-10-23", reason: "Grade drop + Attendance" },
    ]
};

const mockStudents = [
    { id: 101, name: "John Doe", nis: "123456", class: "10-A", riskLevel: "HIGH", probability: 0.85 },
    { id: 102, name: "Jane Smith", nis: "123457", class: "10-A", riskLevel: "MEDIUM", probability: 0.65 },
    { id: 103, name: "Bob Wilson", nis: "123458", class: "10-B", riskLevel: "LOW", probability: 0.15 },
    { id: 104, name: "Alice Johnson", nis: "123459", class: "10-A", riskLevel: "HIGH", probability: 0.92 },
    { id: 105, name: "Charlie Brown", nis: "123460", class: "10-C", riskLevel: "LOW", probability: 0.05 },
];

export const getOverviewData = async (classId) => {
    if (MOCK_MODE) {
        return new Promise((resolve) => setTimeout(() => resolve({ data: mockOverviewData }), 500));
    }
    return api.get(`/overview/${classId}`);
};

export const getAlertsList = async (teacherId) => {
    if (MOCK_MODE) {
        // Filtered list mainly high/medium for alerts page
        const alerts = mockStudents.filter(s => s.riskLevel !== 'LOW').sort((a, b) => b.probability - a.probability);
        return new Promise((resolve) => setTimeout(() => resolve({ data: alerts }), 500));
    }
    return api.get(`/teachers/${teacherId}/students?risk_only=true`);
};

export const getStudentDetail = async (nis) => {
    if (MOCK_MODE) {
        const student = mockStudents.find(s => s.nis === nis) || mockStudents[0];
        const detail = {
            ...student,
            attendanceStats: { present: 25, absent: 5, late: 0, excuse: 0 },
            triggeredRules: [
                "Absent > 3 days in last 2 weeks",
                "Math grade dropped below 60",
            ],
            weeklyTrend: [0.95, 0.90, 0.85, 0.70], // Decreasing trend
            recommendations: [
                "Schedule parent meeting",
                "Refer to school counselor",
            ]
        };
        return new Promise((resolve) => setTimeout(() => resolve({ data: detail }), 500));
    }
    return api.get(`/students/${nis}`);
};

export default api;
