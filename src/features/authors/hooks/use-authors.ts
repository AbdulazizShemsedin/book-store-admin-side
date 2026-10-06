import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi, ListAuthorsParams } from '../api/authors-api';
import { AuthorFormData } from '../schemas/author-schema';

export const AUTHORS_QUERY_KEY = 'authors';

export function useAuthors(params: ListAuthorsParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const search = params.search || '';

  return useQuery({
    queryKey: [AUTHORS_QUERY_KEY, { page, pageSize, search }],
    queryFn: ({ signal }) => authorsApi.list({ page, pageSize, search }, signal),
    placeholderData: (prev) => prev,
  });
}

export function useCreateAuthor(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AuthorFormData) => authorsApi.create(data),
    onSuccess: () => {
      // Invalidate authors queries to refetch latest table data
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}
