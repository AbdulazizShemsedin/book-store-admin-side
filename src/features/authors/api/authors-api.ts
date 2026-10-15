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

    const authors: Author[] = (response.authors || []).map((raw) => ({
      id: raw.id,
      name: raw.string || 'Unknown Author',
      nationality: raw.nationality || undefined,
      worksCount: typeof raw.works_count === 'number' ? raw.works_count : undefined,
      status: 'active',
      bio: raw.description || raw.bio || undefined,
      photoUrl: raw.avatar || raw.photo_url || undefined,
    }));

    return {
      authors,
      total: response.total ?? authors.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Registers a new author via POST /admin/api/author.
   * If an avatar file is provided, automatically uploads it via POST /admin/api/author/{author_id}/avatar.
   */
  async create(data: AuthorFormData, avatarFile?: File): Promise<{ id: string }> {
    const body: CreateAuthorRequestBody = {
      name: data.name.trim(),
      nationality: data.nationality?.trim() || undefined,
      description: data.bio?.trim() || undefined,
    };

    const response = await apiClient.post<CreateAuthorResponseBody>(
      '/admin/api/author',
      body
    );

    const authorId = response.id;

    if (avatarFile && authorId) {
      try {
        await this.uploadAvatar(authorId, avatarFile);
      } catch (uploadErr) {
        console.warn('Failed to upload author avatar:', uploadErr);
      }
    }

    return { id: authorId };
  },

  /**
   * Uploads author avatar image via POST /admin/api/author/{author_id}/avatar (multipart/form-data).
   */
  async uploadAvatar(authorId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('avatar', file);
    await apiClient.post(`/admin/api/author/${authorId}/avatar`, formData);
  },
};
