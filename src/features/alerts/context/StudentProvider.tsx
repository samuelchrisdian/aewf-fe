import React, { createContext, useMemo, useContext, ReactNode } from 'react';
import { useStudentQuery } from '../queries/useStudentQuery';
import { useParams } from 'react-router-dom';
import { AlertsContext, AlertsContextType } from './AlertsProvider';
import { Student, StudentDetail } from '../models';

export const StudentContext = createContext<StudentDetail | Student | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const { nis } = useParams();
  const alertsCtx = useContext(AlertsContext as React.Context<AlertsContextType | null>);

  const alertsList = alertsCtx?.data || [];

  const studentFromAlerts = useMemo(() => {
    if (!nis || !Array.isArray(alertsList) || alertsList.length === 0) return null;
    return alertsList.find((s) => String(s.nis) === String(nis)) || null;
  }, [alertsList, nis]);

  const query = useStudentQuery(nis as string | undefined);

  const data = useMemo(() => {
    if (studentFromAlerts) return studentFromAlerts;
    if (!query.data) return null;
    return { ...query.data };
  }, [studentFromAlerts, query.data]);

  const isLoading = studentFromAlerts ? false : !!query.isLoading;

  return (
    <StudentContext.Provider value={data}>
      {children}
    </StudentContext.Provider>
  );
}
