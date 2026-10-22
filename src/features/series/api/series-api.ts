import { apiClient } from '@/lib/api/client';
import {
  ListSeriesResponseBody,
  CreateSeriesRequestBody,
  CreateSeriesResponseBody,
  ListBookInSeriesAdminResponseBody,
  AddBookToSeriesRequestBody,
} from '@/types/api';
import { Series, SeriesBook } from '@/types/domain';
import { CreateSeriesFormData } from '../schemas/series-schema';

export interface ListSeriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ListSeriesResult {
  series: Series[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListSeriesBooksParams {
  page?: number;
  pageSize?: number;
}

export interface ListSeriesBooksResult {
  books: SeriesBook[];
  total: number;
  page: number;
  pageSize: number;
}

export const seriesApi = {
  /**
   * Retrieves paginated series from GET /admin/api/series.
   * Supports client-side search filtering.
   */
  async list(params: ListSeriesParams = {}, signal?: AbortSignal): Promise<ListSeriesResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };

    const response = await apiClient.get<ListSeriesResponseBody>('/admin/api/series', {
      params: queryParams,
      signal,
    });

    let rawSeries = response.series || [];

    // Client-side search filtering when backend does not have a search query parameter
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      rawSeries = rawSeries.filter((s) => s.name.toLowerCase().includes(q));
    }

    const series: Series[] = rawSeries.map((s) => ({
      id: s.id,
      name: s.name,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    return {
      series,
      total: response.total ?? series.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Retrieves a single series metadata by ID.
   */
  async getById(seriesId: string, signal?: AbortSignal): Promise<Series | null> {
    // Backend doesn't provide GET /admin/api/series/{id}, so we search the series catalog
    const result = await seriesApi.list({ pageSize: 100 }, signal);
    const found = result.series.find((s) => s.id === seriesId);
    return found || null;
  },

  /**
   * Creates a new series via POST /admin/api/series.
   */
  async create(data: CreateSeriesFormData): Promise<{ id: string }> {
    const payload: CreateSeriesRequestBody = {
      name: data.name.trim(),
    };
    const response = await apiClient.post<CreateSeriesResponseBody>('/admin/api/series', payload);
    return { id: response.id };
  },

  /**
   * Lists all books in a series sorted by volume position via GET /admin/api/series/{series_id}/book.
   */
  async listBooks(
    seriesId: string,
    params: ListSeriesBooksParams = {},
    signal?: AbortSignal
  ): Promise<ListSeriesBooksResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };

    const response = await apiClient.get<ListBookInSeriesAdminResponseBody>(
      `/admin/api/series/${seriesId}/book`,
      {
        params: queryParams,
        signal,
      }
    );

    const rawBooks = response.books || [];
    const books: SeriesBook[] = rawBooks
      .map((b) => ({
        id: b.id,
        name: b.name,
        position: b.position,
        author: b.author,
        rating: b.rating,
        thumbnail: b.thumbnail,
      }))
      .sort((a, b) => a.position - b.position);

    return {
      books,
      total: response.total ?? books.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Adds or reassigns a book to a series at a given volume position
   * via POST /admin/api/series/{series_id}/book.
   */
  async addBook(seriesId: string, data: { bookId: string; position: number }): Promise<void> {
    const payload: AddBookToSeriesRequestBody = {
      book_id: data.bookId,
      position: data.position,
    };
    await apiClient.post(`/admin/api/series/${seriesId}/book`, payload);
  },

  /**
   * Removes a book from a series via DELETE /admin/api/series/{series_id}/book/{book_id}.
   */
  async removeBook(seriesId: string, bookId: string): Promise<void> {
    await apiClient.delete(`/admin/api/series/${seriesId}/book/${bookId}`);
  },
};
