import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlertsPage from './AlertsPage';
import StudentDetailPage from './StudentDetailPage';
import { AlertsProvider } from './context/AlertsProvider';
import { StudentProvider } from './context/StudentProvider';

// Buat QueryClient untuk seluruh feature alerts
const queryClient = new QueryClient();

// Export komponen untuk halaman alerts list
export const AlertsFeature = (): React.ReactElement =>
    React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
            AlertsProvider,
            null,
            React.createElement(AlertsPage, null)
        )
    );

// Export komponen untuk halaman student detail
export const StudentDetailFeature = (): React.ReactElement =>
    React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
            StudentProvider,
            null,
            React.createElement(StudentDetailPage, null)
        )
    );

// Default export
export default AlertsFeature;