import React, { createContext, useMemo, ReactNode } from 'react';
import { useOverviewQuery } from '../queries/useOverviewQuery';
import { mapOverviewResponse } from '../models';

export interface OverviewContextType {
    data: ReturnType<typeof mapOverviewResponse> | null;
    isLoading: boolean;
    error?: Error | null;
}

export const OverviewContext = createContext<OverviewContextType | null>(null);

export function OverviewProvider({ children, classId = '10-A' }: { children: ReactNode; classId?: string }) {
    const query = useOverviewQuery(classId);

    const data = useMemo(() => {
        if (!query.data) return null;
        try {
            return mapOverviewResponse(query.data);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('OverviewProvider: failed to map overview response', err);
            return null;
        }
    }, [query.data]);

    return (
        <OverviewContext.Provider value={{ data, isLoading: query.isLoading, error: query.error }}>
            {children}
        </OverviewContext.Provider>
    );
}
