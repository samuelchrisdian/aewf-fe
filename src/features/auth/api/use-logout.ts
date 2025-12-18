import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.post('/api/v1/auth/logout');
    },
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Clear local storage even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};

