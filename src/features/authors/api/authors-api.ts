import { apiClient } from '@/lib/api/client';
import {
  ListAuthorResponseBody,
  CreateAuthorRequestBody,
  CreateAuthorResponseBody,
  UpdateAuthorRequestBody,
  GetAuthorResponseBody,
} from '@/types/api';
import { Author } from '@/types/domain';
import { AuthorFormData } from '../schemas/author-schema';
import { prepareAvatarFile } from '@/lib/upload/image-utils';

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
   * Retrieves single author details via GET /admin/api/author/{author_id}.
   */
  async getById(id: string): Promise<Author> {
    const raw = await apiClient.get<GetAuthorResponseBody>(`/admin/api/author/${id}`);
    return {
      id: raw.id || id,
      name: raw.string || 'Unknown Author',
      nationality: raw.nationality || undefined,
      bio: raw.description || undefined,
      photoUrl: raw.avatar || undefined,
      status: 'active',
    };
  },

  /**
   * Step 1: Submits author metadata to POST /admin/api/author and returns the assigned authorId.
   */
  async createRecord(data: AuthorFormData): Promise<{ id: string }> {
    const body: CreateAuthorRequestBody = {
      name: data.name.trim(),
      nationality: data.nationality?.trim() || undefined,
      description: data.bio?.trim() || undefined,
    };

    const response = await apiClient.post<CreateAuthorResponseBody>(
      '/admin/api/author',
      body
    );

    return { id: response.id };
  },

  /**
   * Registers a new author via POST /admin/api/author.
   * If an avatar file is provided, automatically uploads it via POST /admin/api/author/{author_id}/avatar.
   */
  async create(data: AuthorFormData, avatarFile?: File): Promise<{ id: string }> {
    const { id } = await this.createRecord(data);

    if (avatarFile && id) {
      try {
        await this.uploadAvatar(id, avatarFile);
      } catch (uploadErr) {
        console.warn('Failed to upload author avatar:', uploadErr);
      }
    }

    return { id };
  },

  /**
   * Updates existing author metadata via PATCH /admin/api/author/{author_id}.
   */
  async update(id: string, data: Partial<AuthorFormData>): Promise<void> {
    const body: UpdateAuthorRequestBody = {
      name: data.name?.trim(),
      nationality: data.nationality?.trim(),
      description: data.bio?.trim(),
    };
    await apiClient.patch(`/admin/api/author/${id}`, body);
  },

  /**
   * Uploads author avatar image via POST /admin/api/author/{author_id}/avatar (multipart/form-data).
   */
  async uploadAvatar(authorId: string, file: File): Promise<void> {
    const preparedFile = await prepareAvatarFile(file);
    const formData = new FormData();
    formData.append('avatar', preparedFile, preparedFile.name);
    await apiClient.post(`/admin/api/author/${authorId}/avatar`, formData);
  },
};
