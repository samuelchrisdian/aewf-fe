import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LoginRequest, LoginResponse } from '@/types/api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<any>('/api/v1/auth/login', credentials);
      // Extract data from response if wrapped
      return response.data || response;
    },
    onSuccess: (data) => {
      // Store tokens and user info
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set user data in cache
      queryClient.setQueryData(['currentUser'], data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

