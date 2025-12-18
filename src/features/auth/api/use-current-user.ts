import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/api';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/auth/me');
      return response.data || response;
    },
    enabled: !!localStorage.getItem('access_token'),
    staleTime: Infinity, // User data rarely changes
    retry: false,
  });
};

