import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AlertActionRequest } from '@/types/api';
import { ALERTS_QUERY_KEY } from './useAlertsQuery';

export const useAlertAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, action }: { alertId: number; action: AlertActionRequest }) => {
      return apiClient.post(`/api/v1/risk/alerts/${alertId}/action`, action);
    },
    onSuccess: () => {
      // Invalidate alerts list to refetch
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
    },
  });
};

