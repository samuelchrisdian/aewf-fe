import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';

const OverviewPage = lazy(() => import('./features/overview'));
const AlertsFeature = lazy(() => import('./features/alerts').then(module => ({ default: module.AlertsFeature })));
const StudentDetailFeature = lazy(() => import('./features/alerts').then(module => ({ default: module.StudentDetailFeature })));

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
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
