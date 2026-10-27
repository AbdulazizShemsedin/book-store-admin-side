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

export function useAuthor(id: string) {
  return useQuery({
    queryKey: [AUTHORS_QUERY_KEY, id],
    queryFn: () => authorsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAuthor(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, avatarFile }: { data: AuthorFormData; avatarFile?: File }) =>
      authorsApi.create(data, avatarFile),
    onSuccess: () => {
      // Invalidate authors queries to refetch latest table data
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useUpdateAuthor(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorId,
      data,
      avatarFile,
    }: {
      authorId: string;
      data: Partial<AuthorFormData>;
      avatarFile?: File;
    }) => {
      await authorsApi.update(authorId, data);
      if (avatarFile) {
        await authorsApi.uploadAvatar(authorId, avatarFile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useDeleteAuthor(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}
