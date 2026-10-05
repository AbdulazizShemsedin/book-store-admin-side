import { apiClient } from '@/lib/api/client';
import {
  ListCategoryRequestBody,
  ListCategoryResponseBody,
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
   * Retrieves category list via POST /api/category.
   * Isolates category taxonomy read operations from admin writes.
   */
  async list(params: ListCategoriesParams = {}): Promise<ListCategoriesResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;

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
      parentId: item.parent_id,
    }));

    return {
      categories,
      total: response.total || categories.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Creates a root category or subcategory via POST /admin/api/category.
   */
  async create(data: CategoryFormData): Promise<{ id: string }> {
    const requestBody: CreateCategoryRequestBody = {
      name: data.name.trim(),
      parent_id: data.parentId ? data.parentId : undefined,
    };

    const response = await apiClient.post<{ id: string }>(
      '/admin/api/category',
      requestBody
    );

    return response;
  },

  /**
   * Updates an existing category via PUT /admin/api/category/:id.
   */
  async update(id: string, name: string): Promise<{ id: string; name: string }> {
    return apiClient.put<{ id: string; name: string }>(`/admin/api/category/${id}`, {
      name: name.trim(),
    });
  },

  /**
   * Deletes a category and its subcategories via DELETE /admin/api/category/:id.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/api/category/${id}`);
  },
};
