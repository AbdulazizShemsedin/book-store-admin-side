import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesApi, ListSeriesParams, ListSeriesBooksParams } from '../api/series-api';
import { CreateSeriesFormData } from '../schemas/series-schema';

export const SERIES_QUERY_KEY = 'series';
export const SERIES_BOOKS_QUERY_KEY = 'series-books';

export function useSeries(params: ListSeriesParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const search = params.search || '';

  return useQuery({
    queryKey: [SERIES_QUERY_KEY, { page, pageSize, search }],
    queryFn: ({ signal }) => seriesApi.list({ page, pageSize, search }, signal),
    placeholderData: (prev) => prev,
  });
}

export function useAllSeries() {
  return useQuery({
    queryKey: [SERIES_QUERY_KEY, 'all'],
    queryFn: async ({ signal }) => {
      const res = await seriesApi.list({ pageSize: 100 }, signal);
      return res.series;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeriesDetail(seriesId: string) {
  return useQuery({
    queryKey: [SERIES_QUERY_KEY, 'detail', seriesId],
    queryFn: ({ signal }) => seriesApi.getById(seriesId, signal),
    enabled: Boolean(seriesId),
  });
}

export function useSeriesBooks(seriesId: string, params: ListSeriesBooksParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;

  return useQuery({
    queryKey: [SERIES_BOOKS_QUERY_KEY, seriesId, { page, pageSize }],
    queryFn: ({ signal }) => seriesApi.listBooks(seriesId, { page, pageSize }, signal),
    enabled: Boolean(seriesId),
  });
}

export function useCreateSeries(onSuccessCallback?: (newId: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeriesFormData) => seriesApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [SERIES_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback(res.id);
      }
    },
  });
}

export function useAddBookToSeries(seriesId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bookId: string; position: number }) =>
      seriesApi.addBook(seriesId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERIES_BOOKS_QUERY_KEY, seriesId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useRemoveBookFromSeries(seriesId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => seriesApi.removeBook(seriesId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERIES_BOOKS_QUERY_KEY, seriesId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}
