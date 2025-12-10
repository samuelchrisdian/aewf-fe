import React, { createContext, useMemo, useState, ReactNode } from 'react';
import { useAlertsQuery } from '../queries/useAlertsQuery';
import { Student } from '../models';

export interface AlertsContextType {
    data: Student[];
    isLoading: boolean;
    error?: Error | null;
    filter: string;
    setFilter: (filter: string) => void;
    search: string;
    setSearch: (search: string) => void;
}

export const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children, teacherId = 'teacher123' }: { children: ReactNode; teacherId?: string }) {
    const query = useAlertsQuery(teacherId);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const normalizedSearch = (search || '').trim().toLowerCase();

    const data = useMemo(() => {
        if (!query.data) return [];
        return query.data
            .map((item) => ({
                id: item.id,
                name: item.studentName || item.name,
                nis: item.nis || item.studentNis,
                class: item.class || item.studentClass,
                riskLevel: item.riskLevel,
                probability: item.probability,
            }))
            .filter((s) => {
                if (filter !== 'ALL' && s.riskLevel !== filter) return false;
                if (normalizedSearch) {
                    const name = (s.name || '').toString().toLowerCase();
                    const nis = (s.nis || '').toString().toLowerCase();
                    const cls = (s.class || '').toString().toLowerCase();
                    if (!name.includes(normalizedSearch) && !nis.includes(normalizedSearch) && !cls.includes(normalizedSearch)) return false;
                }
                return true;
            });
    }, [query.data, filter, normalizedSearch]);

    // Explicitly define the context value
    const contextValue: AlertsContextType = {
        data,
        isLoading: query.isLoading,
        error: query.error,
        filter,
        setFilter,
        search,
        setSearch,
    };

    return (
        <AlertsContext.Provider value={contextValue}>
            {children}
        </AlertsContext.Provider>
    );
}