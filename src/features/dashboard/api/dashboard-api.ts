import { apiClient } from '@/lib/api/client';
import { booksApi } from '@/features/books/api/books-api';
import { authorsApi } from '@/features/authors/api/authors-api';
import { categoriesApi } from '@/features/categories/api/categories-api';
import { publishersApi } from '@/features/publishers/api/publishers-api';

export interface DashboardStats {
  totalBooks: number;
  totalAuthors: number;
  totalCategories: number;
  rootCategoriesCount: number;
  subCategoriesCount: number;
  totalPublishers: number;
}

interface BackendDashboardStatsResponse {
  total_books?: number;
  total_authors?: number;
  total_categories?: number;
  root_categories?: number;
  sub_categories?: number;
  total_publishers?: number;
}

export const dashboardApi = {
  /**
   * Fetches high-level KPI stats.
   * First attempts to query single aggregated endpoint `GET /admin/api/dashboard/stats`.
   * If endpoint is not yet implemented by backend (404), gracefully aggregates
   * using existing cached count endpoints without breaking the UI.
   */
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    try {
      const res = await apiClient.get<BackendDashboardStatsResponse>('/admin/api/dashboard/stats', {
        signal,
      });

      if (res && (res.total_books !== undefined || res.total_authors !== undefined)) {
        return {
          totalBooks: res.total_books ?? 0,
          totalAuthors: res.total_authors ?? 0,
          totalCategories: res.total_categories ?? 0,
          rootCategoriesCount: res.root_categories ?? 0,
          subCategoriesCount: res.sub_categories ?? 0,
          totalPublishers: res.total_publishers ?? 0,
        };
      }
    } catch {
      // Endpoint not deployed yet on backend; proceed to fallback aggregator
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
