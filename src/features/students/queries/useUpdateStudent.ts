import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateStudentRequest, Student } from '@/types/api';
import { STUDENTS_QUERY_KEY } from './useStudentsQuery';
import { STUDENT_QUERY_KEY } from '../../alerts/queries/useStudentQuery';

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nis, data }: { nis: string; data: UpdateStudentRequest }) => {
      return apiClient.put<Student>(`/api/v1/students/${nis}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEY(variables.nis) });
    },
  });
};

