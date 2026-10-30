import { useQuery } from '@tanstack/react-query';
import { reportsApi, GetReportsParams } from '../api/reports-api';

export const REPORTS_QUERY_KEY = 'reports';

export function useReports(params: GetReportsParams | string = '30d') {
  const queryParams: GetReportsParams =
    typeof params === 'string' ? { period: params as any } : params;

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, queryParams],
    queryFn: () => reportsApi.getReports(queryParams),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000, // 1 minute fresh cache
  });
}
