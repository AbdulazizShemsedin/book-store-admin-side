import { apiClient } from '@/lib/api/client';
import {
  ListCategoryRequestBody,
  ListCategoryResponseBody,
  ListCategoryAdminResponseBody,
  CreateCategoryRequestBody,
} from '@/types/api';
import { Category } from '@/types/domain';
import { CategoryFormData } from '../schemas/category-schema';

export interface ListCategoriesParams {
  page?: number;
  pageSize?: number;
  parentId?: string;
  search?: string;
}

export interface ListCategoriesResult {
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
}

export const categoriesApi = {
  /**
   * Retrieves category list via documented GET /admin/api/category.
   * Gracefully falls back to POST /api/category if admin endpoint is unavailable.
   */
  async list(params: ListCategoriesParams = {}): Promise<ListCategoriesResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;

    // If a specific parent branch is requested, fetch just that branch
    if (params.parentId) {
      try {
        const response = await apiClient.get<ListCategoryAdminResponseBody>(
          '/admin/api/category',
          { params: { parent_id: params.parentId } }
        );
        const rawList = response.categories || [];
        const categories: Category[] = rawList.map((item) => ({
          id: item.id,
          name: item.name,
          parentId: item.parent_id || undefined,
        }));
        return {
          categories,
          total: response.total ?? categories.length,
          page,
          pageSize,
        };
      } catch {
        const response = await apiClient.post<ListCategoryResponseBody>(
          '/api/category',
          { parent_id: params.parentId },
          { params: { page, page_size: pageSize } }
        );
        const rawList = response.categories || [];
        const categories: Category[] = rawList.map((item) => ({
          id: item.id,
          name: item.name,
          parentId: item.parent_id || undefined,
        }));
        return {
          categories,
          total: response.total || categories.length,
          page,
          pageSize,
        };
      }
    }

    // When fetching the full catalog taxonomy, recursively load all levels
    // (Roots -> Level 2 Subcategories -> Level 3 Sub-subcategories)
    try {
      // 1. Load Root Categories (Level 1)
      const rootsRes = await apiClient.get<ListCategoryAdminResponseBody>('/admin/api/category');
      const rootItems = rootsRes.categories || [];

      // 2. Load Level 2 Subcategories for each root in parallel
      const l2Promises = rootItems.map((r) =>
        apiClient
          .get<ListCategoryAdminResponseBody>('/admin/api/category', {
            params: { parent_id: r.id },
          })
          .catch(() => ({ categories: [] }))
      );
      const l2Responses = await Promise.all(l2Promises);
      const l2Items = l2Responses.flatMap((res) => res.categories || []);

      // 3. Load Level 3 Subcategories for each Level 2 item in parallel
      const l3Promises = l2Items.map((c) =>
        apiClient
          .get<ListCategoryAdminResponseBody>('/admin/api/category', {
            params: { parent_id: c.id },
          })
          .catch(() => ({ categories: [] }))
      );
      const l3Responses = await Promise.all(l3Promises);
      const l3Items = l3Responses.flatMap((res) => res.categories || []);

      // Combine and deduplicate
      const categoryMap = new Map<string, Category>();
      for (const item of [...rootItems, ...l2Items, ...l3Items]) {
        categoryMap.set(item.id, {
          id: item.id,
          name: item.name,
          parentId: item.parent_id || undefined,
        });
      }

      const allCategories = Array.from(categoryMap.values());

      return {
        categories: allCategories,
        total: allCategories.length,
        page: 1,
        pageSize: allCategories.length,
      };
    } catch {
      // Fallback via consumer endpoints:
      // 1. Root categories via POST /api/category with {}
      const rootsRes = await apiClient.post<ListCategoryResponseBody>('/api/category', {});
      const rootItems = rootsRes.categories || [];

      // 2. Level 2 subcategories
      const l2Promises = rootItems.map((r) =>
        apiClient
          .post<ListCategoryResponseBody>('/api/category', { parent_id: r.id })
          .catch(() => ({ categories: [] }))
      );
      const l2Responses = await Promise.all(l2Promises);
      const l2Items = l2Responses.flatMap((res) => res.categories || []);

      // 3. Level 3 subcategories
      const l3Promises = l2Items.map((c) =>
        apiClient
          .post<ListCategoryResponseBody>('/api/category', { parent_id: c.id })
          .catch(() => ({ categories: [] }))
      );
      const l3Responses = await Promise.all(l3Promises);
      const l3Items = l3Responses.flatMap((res) => res.categories || []);

      const categoryMap = new Map<string, Category>();
      for (const item of [...rootItems, ...l2Items, ...l3Items]) {
        categoryMap.set(item.id, {
          id: item.id,
          name: item.name,
          parentId: item.parent_id || undefined,
        });
      }

      const allCategories = Array.from(categoryMap.values());

      return {
        categories: allCategories,
        total: allCategories.length,
        page: 1,
        pageSize: allCategories.length,
      };
    }
  },

  /**
   * Creates a root category or subcategory via POST /admin/api/category.
   */
  async create(data: CategoryFormData): Promise<{ id: string }> {
    const requestBody: CreateCategoryRequestBody = {
      name: data.name.trim(),
      parent_id: data.parentId ? data.parentId : undefined,
    };

    const response = await apiClient.post<{ id?: string }>(
      '/admin/api/category',
      requestBody
    );

    return { id: response?.id || '' };
  },

  /**
   * Category update is documented as missing from backend contract (BLOCKER-05).
   */
  async update(id: string, name: string): Promise<{ id: string; name: string }> {
    try {
      return await apiClient.put<{ id: string; name: string }>(`/admin/api/category/${id}`, {
        name: name.trim(),
      });
    } catch {
      throw new Error('Category updating is not yet supported by the backend API contract.');
    }
  },

  /**
   * Category deletion is documented as missing from backend contract (BLOCKER-05).
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/api/category/${id}`);
    } catch {
      throw new Error('Category deletion is not yet supported by the backend API contract.');
    }
  },
};
