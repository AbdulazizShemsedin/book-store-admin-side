import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports-api';

export const REPORTS_QUERY_KEY = 'reports';

export function useReports(period: string = '30d') {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, period],
    queryFn: () => reportsApi.getReports(period),
  });
}
