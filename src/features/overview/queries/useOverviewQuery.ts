import { useQuery } from '@tanstack/react-query';
import { getOverviewData } from '../../../services/api';

export const OVERVIEW_QUERY_KEY = ['overview'] as const;

export function useOverviewQuery(classId = '10-A') {
    return useQuery({
        queryKey: [...OVERVIEW_QUERY_KEY, classId],
        queryFn: async () => {
            const resp = await getOverviewData(classId);
            return resp.data;
        },
    });
}
