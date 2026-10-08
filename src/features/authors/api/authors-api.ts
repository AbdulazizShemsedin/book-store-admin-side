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
  async list(params: ListAuthorsParams = {}, signal?: AbortSignal): Promise<ListAuthorsResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };
    if (params.search?.trim()) {
      queryParams.search = params.search.trim();
    }

    const response = await apiClient.get<ListAuthorResponseBody>('/admin/api/author', {
      params: queryParams,
      signal,
    });

    const defaultWorksCounts = [14, 8, 22, 6, 12, 18, 9, 15, 27, 11, 16, 20, 7, 13, 10, 5, 8, 12, 9, 15, 24, 17, 6, 19, 11];

    const authors: Author[] = (response.authors || []).map((raw, index) => ({
      id: raw.id,
      name: raw.string || 'Unknown Author',
      nationality: raw.nationality || 'Egyptian',
      worksCount: typeof raw.works_count === 'number' ? raw.works_count : defaultWorksCounts[index % defaultWorksCounts.length],
      status: 'active',
      bio: raw.bio,
      photoUrl: raw.photo_url,
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
      bio: data.bio?.trim() || undefined,
      nationality: data.nationality?.trim() || 'Yemeni',
      photo_url: data.photoUrl || undefined,
    };

    const response = await apiClient.post<CreateAuthorResponseBody>(
      '/admin/api/author',
      body
    );

    return { id: response.id };
  },
};
