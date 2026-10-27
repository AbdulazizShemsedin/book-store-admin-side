import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi, ListPlansParams } from '../api/plans-api';

export const PLANS_QUERY_KEY = 'plans';

export function usePlans(params: ListPlansParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  return useQuery({
    queryKey: [PLANS_QUERY_KEY, { page, pageSize }],
    queryFn: ({ signal }) => plansApi.list({ page, pageSize }, signal),
    placeholderData: (prev) => prev,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: [PLANS_QUERY_KEY, id],
    queryFn: () => plansApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useUpdatePlan(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { price?: string; discount?: number };
    }) => plansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLANS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}
