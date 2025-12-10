import { useQuery } from '@tanstack/react-query';
import { getAlertsList } from '../../../services/api';

export const ALERTS_QUERY_KEY = ['alerts'] as const;

export function useAlertsQuery(teacherId: string) {
    return useQuery({
        queryKey: ALERTS_QUERY_KEY,
        queryFn: async () => {
            const resp = await getAlertsList(teacherId);
            return resp.data;
        },
    });
}
