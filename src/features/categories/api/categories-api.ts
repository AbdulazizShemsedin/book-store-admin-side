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

    const queryParams: Record<string, string | number | undefined> = {
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
      // Fallback to public catalog endpoint
      const requestBody: ListCategoryRequestBody = {
        parent_id: params.parentId || undefined,
      };

      const response = await apiClient.post<ListCategoryResponseBody>(
        '/api/category',
        requestBody,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      );

      const rawList = response.categories || [];

      // Map to domain model
      const categories: Category[] = rawList.map((item) => ({
        id: item.id,
        name: item.name,
        parentId: item.parent_id || undefined,
        color: item.color || undefined,
      }));

      return {
        categories,
        total: response.total || categories.length,
        page: response.page || page,
        pageSize: response.page_size || pageSize,
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
