import { apiClient } from '@/lib/api/client';
import { booksApi } from '@/features/books/api/books-api';
import { authorsApi } from '@/features/authors/api/authors-api';
import { categoriesApi } from '@/features/categories/api/categories-api';
import { publishersApi } from '@/features/publishers/api/publishers-api';
import { GetDashboardStatsResponseBody } from '@/types/api';

export interface DashboardStats {
  totalBooks: number;
  totalAuthors: number;
  totalCategories: number;
  rootCategoriesCount: number;
  subCategoriesCount: number;
  totalPublishers: number;
  booksBreakdown?: {
    bookOnly: number;
    audioOnly: number;
    both: number;
    neither: number;
    private: {
      total: number;
      bookOnly: number;
      audioOnly: number;
      both: number;
      neither: number;
    };
    public: {
      total: number;
      bookOnly: number;
      audioOnly: number;
      both: number;
    };
  };
}

export const dashboardApi = {
  /**
   * Fetches high-level KPI stats from the backend.
   * Directly queries the official endpoint `GET /admin/api/dashboard/stats`.
   * Maps authors, publishers, categories (roots + total), and books (with public/private breakdown).
   * If endpoint is temporarily unreachable, gracefully falls back to concurrent lightweight queries.
   */
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    try {
      const res = await apiClient.get<GetDashboardStatsResponseBody>('/admin/api/dashboard/stats', {
        signal,
      });

      if (res && res.books && res.authors) {
        const rootCount = res.categories?.roots ?? 0;
        const totalCat = res.categories?.total ?? 0;
        const subCount = Math.max(0, totalCat - rootCount);

        return {
          totalBooks: res.books.total ?? 0,
          totalAuthors: res.authors.total ?? 0,
          totalCategories: totalCat,
          rootCategoriesCount: rootCount,
          subCategoriesCount: subCount,
          totalPublishers: res.publishers?.total ?? 0,
          booksBreakdown: {
            bookOnly: res.books.book_only ?? 0,
            audioOnly: res.books.audio_only ?? 0,
            both: res.books.both ?? 0,
            neither: res.books.neither ?? 0,
            private: {
              total: res.books.private?.total ?? 0,
              bookOnly: res.books.private?.book_only ?? 0,
              audioOnly: res.books.private?.audio_only ?? 0,
              both: res.books.private?.both ?? 0,
              neither: res.books.private?.neither ?? 0,
            },
            public: {
              total: res.books.public?.total ?? 0,
              bookOnly: res.books.public?.book_only ?? 0,
              audioOnly: res.books.public?.audio_only ?? 0,
              both: res.books.public?.both ?? 0,
            },
          },
        };
      }
    } catch {
      // Endpoint error or network disconnect; proceed to fallback aggregator
    }

    // Fallback aggregator: executes concurrent lightweight queries with pageSize: 1
    const [booksRes, authorsRes, categoriesRes, publishersRes] = await Promise.all([
      booksApi.list({ page: 1, pageSize: 1 }, signal).catch(() => ({ total: 0, books: [], page: 1, pageSize: 1 })),
      authorsApi.list({ page: 1, pageSize: 1 }, signal).catch(() => ({ total: 0, authors: [], page: 1, pageSize: 1 })),
      categoriesApi.list({ page: 1, pageSize: 50 }).catch(() => ({ total: 0, categories: [], page: 1, pageSize: 50 })),
      publishersApi.list({ page: 1, pageSize: 1 }, signal).catch(() => ({ total: 0, publishers: [], page: 1, pageSize: 1 })),
    ]);

    const categoriesList = categoriesRes.categories || [];
    const rootCount = categoriesList.filter((c) => !c.parentId).length;
    const subCount = categoriesList.filter((c) => Boolean(c.parentId)).length;

    return {
      totalBooks: booksRes.total || 0,
      totalAuthors: authorsRes.total || 0,
      totalCategories: categoriesRes.total || categoriesList.length,
      rootCategoriesCount: rootCount,
      subCategoriesCount: subCount,
      totalPublishers: publishersRes.total || 0,
    };
  },
};
