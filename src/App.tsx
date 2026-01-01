import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';

const OverviewPage = lazy(() => import('./features/overview'));
const AlertsFeature = lazy(() => import('./features/alerts').then(module => ({ default: module.AlertsFeature })));
const StudentDetailFeature = lazy(() => import('./features/alerts').then(module => ({ default: module.StudentDetailFeature })));
const StudentsPage = lazy(() => import('./features/students').then(module => ({ default: module.StudentsPage })));
const AttendancePage = lazy(() => import('./features/attendance').then(module => ({ default: module.AttendancePage })));
const AnalyticsPage = lazy(() => import('./features/analytics').then(module => ({ default: module.AnalyticsPage })));
const ClassesPage = lazy(() => import('./features/classes').then(module => ({ default: module.ClassesPage })));
const MachinesPage = lazy(() => import('./features/machines').then(module => ({ default: module.MachinesPage })));
const ImportPage = lazy(() => import('./features/import').then(module => ({ default: module.ImportPage })));
const MappingPage = lazy(() => import('./features/mapping').then(module => ({ default: module.MappingPage })));
const ReportsPage = lazy(() => import('./features/reports').then(module => ({ default: module.ReportsPage })));
const NotificationsPage = lazy(() => import('./features/notifications').then(module => ({ default: module.NotificationsPage })));

function App(): React.ReactElement {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <OverviewPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="alerts"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <AlertsFeature />
                                </Suspense>
                            }
                        />
                        <Route
                            path="alerts/:nis"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <StudentDetailFeature />
                                </Suspense>
                            }
                        />
                        <Route
                            path="students"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <StudentsPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="attendance"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <AttendancePage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="analytics"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <AnalyticsPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="classes"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <ClassesPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="machines"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <MachinesPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="import"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <ImportPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="mapping"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <MappingPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="reports"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <ReportsPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="notifications"
                            element={
                                <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                    <NotificationsPage />
                                </Suspense>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
