import { useQuery } from '@tanstack/react-query';
import { getStudentDetail } from '../../../services/api';

export const STUDENT_QUERY_KEY = (nis?: string | null) => ['student', nis] as const;

export function useStudentQuery(nis?: string | null) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEY(nis),
    queryFn: async () => {
      if (!nis) return null;
      const resp = await getStudentDetail(nis);
      return resp.data;
    },
    enabled: !!nis,
  });
}
