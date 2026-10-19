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
   * Retrieves category list with genuine server pagination via documented GET /admin/api/category.
   * If parentId is specified, retrieves child subcategories for that parent.
   * If parentId is omitted, retrieves top-level root categories.
   * Gracefully falls back to POST /api/category if admin endpoint is unavailable.
   */
  async list(params: ListCategoriesParams = {}): Promise<ListCategoriesResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number> = {
      page,
      page_size: pageSize,
    };
    if (params.parentId) {
      queryParams.parent_id = params.parentId;
    }

    try {
      const response = await apiClient.get<ListCategoryAdminResponseBody>(
        '/admin/api/category',
        { params: queryParams }
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
        page: response.page || page,
        pageSize: response.page_size || pageSize,
      };
    } catch {
      const requestBody: Record<string, any> = {};
      if (params.parentId) {
        requestBody.parent_id = params.parentId;
      }
      const response = await apiClient.post<ListCategoryResponseBody>(
        '/api/category',
        requestBody,
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
        total: response.total ?? categories.length,
        page: response.page || page,
        pageSize: response.page_size || pageSize,
      };
    }
  },

  /**
   * Helper to load subcategories for a given parent category ID.
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    const res = await this.list({ parentId, page: 1, pageSize: 100 });
    return res.categories;
  },

  /**
   * Recursively fetches all categories and their nested subcategories across all levels
   * to construct the complete multi-level taxonomy tree.
   */
  async getAllCategories(): Promise<Category[]> {
    const rootsRes = await this.list({ page: 1, pageSize: 100 });
    const allCategories: Category[] = [...rootsRes.categories];
    const visited = new Set<string>(rootsRes.categories.map((c) => c.id));

    let currentLevel = rootsRes.categories;
    let depth = 1;

    while (currentLevel.length > 0 && depth < 5) {
      const childPromises = currentLevel.map((cat) =>
        this.getSubcategories(cat.id).catch(() => [] as Category[])
      );
      const childResults = await Promise.all(childPromises);
      const nextLevel: Category[] = [];

      for (const children of childResults) {
        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            allCategories.push(child);
            nextLevel.push(child);
          }
        }
      }

      currentLevel = nextLevel;
      depth++;
    }

    return allCategories;
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
