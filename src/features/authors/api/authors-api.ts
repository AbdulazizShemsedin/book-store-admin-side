import { apiClient } from '@/lib/api/client';
import {
  ListAuthorResponseBody,
  CreateAuthorRequestBody,
  CreateAuthorResponseBody,
} from '@/types/api';
import { Author } from '@/types/domain';
import { AuthorFormData } from '../schemas/author-schema';

export interface ListAuthorsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ListAuthorsResult {
  authors: Author[];
  total: number;
  page: number;
  pageSize: number;
}

export const authorsApi = {
  /**
   * Retrieves paginated authors from GET /admin/api/author.
   * Normalizes the backend's "string" property to frontend domain "name".
   */
  async list(params: ListAuthorsParams = {}): Promise<ListAuthorsResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const response = await apiClient.get<ListAuthorResponseBody>('/admin/api/author', {
      params: {
        page,
        page_size: pageSize,
      },
    });

    const authors: Author[] = (response.authors || []).map((raw, idx) => ({
      id: raw.id,
      name: raw.string || 'Unknown Author',
      nationality: 'Yemeni', // Domain default until backend stores nationality
      worksCount: 4,
      status: 'active',
    }));

    return {
      authors,
      total: response.total || authors.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Registers a new author via POST /admin/api/author.
   */
  async create(data: AuthorFormData): Promise<{ id: string }> {
    const body: CreateAuthorRequestBody = {
      name: data.name.trim(),
    };

    const response = await apiClient.post<CreateAuthorResponseBody>(
      '/admin/api/author',
      body
    );

    return { id: response.id };
  },
};
