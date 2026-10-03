import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishersApi, ListPublishersParams } from '../api/publishers-api';
import { PublisherFormData } from '../schemas/publisher-schema';

export const PUBLISHERS_QUERY_KEY = 'publishers';

export function usePublishers(params: ListPublishersParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const search = params.search || '';

  return useQuery({
    queryKey: [PUBLISHERS_QUERY_KEY, { page, pageSize, search }],
    queryFn: () => publishersApi.list({ page, pageSize, search }),
    placeholderData: (prev) => prev,
  });
}

export function useCreatePublisher(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublisherFormData) => publishersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLISHERS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useDeletePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLISHERS_QUERY_KEY] });
    },
  });
}
