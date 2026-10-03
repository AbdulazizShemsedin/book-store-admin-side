import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, ListBooksParams } from '../api/books-api';
import { BookFormData } from '../schemas/book-schema';

export const BOOKS_QUERY_KEY = 'books';

export function useBooks(params: ListBooksParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const search = params.search || '';
  const category = params.category || '';
  const status = params.status || '';

  return useQuery({
    queryKey: [BOOKS_QUERY_KEY, { page, pageSize, search, category, status }],
    queryFn: () => booksApi.list({ page, pageSize, search, category, status }),
    placeholderData: (prev) => prev,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: [BOOKS_QUERY_KEY, id],
    queryFn: () => booksApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateBook(onSuccessCallback?: (bookId: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookFormData) => booksApi.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback(result.id);
      }
    },
  });
}
