import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardStats } from '../api/dashboard-api';

export const DASHBOARD_STATS_QUERY_KEY = 'dashboard_stats';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: [DASHBOARD_STATS_QUERY_KEY],
    queryFn: ({ signal }) => dashboardApi.getStats(signal),
    staleTime: 60 * 1000, // 1 minute fresh cache
  });
}
