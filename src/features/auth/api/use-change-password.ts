import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ChangePasswordRequest } from '@/types/api';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      return apiClient.post('/api/v1/auth/change-password', data);
    },
  });
};

