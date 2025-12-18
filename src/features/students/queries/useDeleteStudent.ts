import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { STUDENTS_QUERY_KEY } from './useStudentsQuery';
import { STUDENT_QUERY_KEY } from '../../alerts/queries/useStudentQuery';

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nis: string) => {
      return apiClient.delete(`/api/v1/students/${nis}`);
    },
    onSuccess: (_, nis) => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: STUDENT_QUERY_KEY(nis) });
    },
  });
};

