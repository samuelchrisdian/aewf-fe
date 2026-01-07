import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentProvider } from '../alerts/context/StudentProvider';
import { StudentDetailView } from '../student-detail';

// Create QueryClient for students detail
const queryClient = new QueryClient();

const StudentDetailPage = (): React.ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <StudentProvider>
        <StudentDetailView backUrl="/students" backLabel="Back to Students" />
      </StudentProvider>
    </QueryClientProvider>
  );
};

export default StudentDetailPage;

