import axios from 'axios';

// Base Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
});

// Mock data for development
const MOCK_MODE = true;

// Mock user data
const mockUsers: Array<{id: number; email: string; password: string; name: string; role: 'teacher' | 'admin'}> = [
    { id: 1, email: 'teacher1@school.com', password: 'password123', name: 'Teacher One', role: 'teacher' },
    { id: 2, email: 'teacher2@school.com', password: 'password123', name: 'Teacher Two', role: 'teacher' },
    { id: 3, email: 'admin@school.com', password: 'admin123', name: 'School Admin', role: 'admin' },
];

const mockOverviewData = {
    totalStudents: 120,
    avgAttendance: 85.5,
    riskDistribution: {
        high: 15,
        medium: 30,
        low: 75,
    },
    recentAlerts: [
        { id: 1, studentName: 'John Doe', riskLevel: 'HIGH', date: '2023-10-25', reason: 'Absent 3 days in a row' },
        { id: 2, studentName: 'Jane Smith', riskLevel: 'MEDIUM', date: '2023-10-24', reason: 'Late arrival trend' },
        { id: 3, studentName: 'Alice Johnson', riskLevel: 'HIGH', date: '2023-10-23', reason: 'Grade drop + Attendance' },
    ],
};

const mockStudents = [
    { id: 101, name: 'John Doe', nis: '123456', class: '10-A', riskLevel: 'HIGH', probability: 0.85 },
    { id: 102, name: 'Jane Smith', nis: '123457', class: '10-A', riskLevel: 'MEDIUM', probability: 0.65 },
    { id: 103, name: 'Bob Wilson', nis: '123458', class: '10-B', riskLevel: 'HIGH', probability: 0.15 },
    { id: 104, name: 'Alice Johnson', nis: '123459', class: '10-A', riskLevel: 'HIGH', probability: 0.92 },
    { id: 105, name: 'Charlie Brown', nis: '123460', class: '10-C', riskLevel: 'HIGH', probability: 0.05 },
];

// Auth interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: 'teacher' | 'admin';
    };
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'teacher' | 'admin';
}

// Authentication APIs
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    if (MOCK_MODE) {
        return new Promise<AuthResponse>((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password);
                if (user) {
                    const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }));
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }));
                    resolve({
                        token,
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        },
                    });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 800);
        });
    }
    return api.post('/auth/login', credentials);
};

export const logout = async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return Promise.resolve();
};

export const refreshToken = async (): Promise<AuthResponse> => {
    if (MOCK_MODE) {
        return new Promise<AuthResponse>((resolve, reject) => {
            setTimeout(() => {
                const token = localStorage.getItem('auth_token');
                const userStr = localStorage.getItem('user');
                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    resolve({
                        token,
                        user,
                    });
                } else {
                    reject(new Error('No valid session'));
                }
            }, 300);
        });
    }
    return api.post('/auth/refresh');
};

export const getCurrentUser = async (): Promise<User> => {
    if (MOCK_MODE) {
        return new Promise<User>((resolve, reject) => {
            setTimeout(() => {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    resolve(JSON.parse(userStr));
                } else {
                    reject(new Error('Not authenticated'));
                }
            }, 200);
        });
    }
    return api.get('/auth/me').then((res) => res.data);
};

export const getOverviewData = async (classId?: string) => {
    if (MOCK_MODE) {
        return new Promise<{ data: typeof mockOverviewData }>((resolve) =>
            setTimeout(() => resolve({ data: mockOverviewData }), 500),
        );
    }
    return api.get(`/overview/${classId}`);
};

export const getAlertsList = async (teacherId?: string) => {
    if (MOCK_MODE) {
        const alerts = mockStudents.filter((s) => s.riskLevel !== 'LOW').sort((a, b) => b.probability - a.probability);
        return new Promise<{ data: typeof alerts }>((resolve) => setTimeout(() => resolve({ data: alerts }), 500));
    }
    return api.get(`/teachers/${teacherId}/students?risk_only=true`);
};

export const getStudentDetail = async (nis?: string) => {
    if (MOCK_MODE) {
        const student = mockStudents.find((s) => s.nis === nis) || mockStudents[0];
        const detail = {
            ...student,
            attendanceStats: { present: 25, absent: 5, late: 0, excuse: 0 },
            triggeredRules: ['Absent > 3 days in last 2 weeks', 'Math grade dropped below 60'],
            weeklyTrend: [0.95, 0.9, 0.85, 0.7],
            recommendations: ['Schedule parent meeting', 'Refer to school counselor'],
        };
        return new Promise<{ data: typeof detail }>((resolve) => setTimeout(() => resolve({ data: detail }), 500));
    }
    return api.get(`/students/${nis}`);
};

export default api;
