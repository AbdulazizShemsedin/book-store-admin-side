import { apiClient } from '@/lib/api/client';
import {
  ListPublisherResponseBody,
  CreatePublisherRequestBody,
  CreatePublisherResponseBody,
  UpdatePublisherRequestBody,
  GetPublisherResponseBody,
} from '@/types/api';
import { Publisher } from '@/types/domain';
import { PublisherFormData } from '../schemas/publisher-schema';

export interface ListPublishersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ListPublishersResult {
  publishers: Publisher[];
  total: number;
  page: number;
  pageSize: number;
}

export const publishersApi = {
  /**
   * Retrieves paginated publishers from documented GET /admin/api/publisher.
   * Maps backend property "string" to domain property "name".
   */
  async list(params: ListPublishersParams = {}, signal?: AbortSignal): Promise<ListPublishersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };

    const response = await apiClient.get<ListPublisherResponseBody>('/admin/api/publisher', {
      params: queryParams,
      signal,
    });

    const rawPublishers = response.publishers || [];

    const publishers: Publisher[] = rawPublishers.map((item) => {
      const name = item.string || 'Unknown Publisher';
      const words = name.trim().split(/\s+/);
      const monogram = words
        .slice(0, 3)
        .map((w) => w[0]?.toUpperCase())
        .join('');

      return {
        id: item.id,
        name,
        monogram: monogram || 'PUB',
        booksCount: 0,
        status: 'Active',
      };
    });

    let filtered = publishers;
    if (params.search?.trim()) {
      const search = params.search.toLowerCase().trim();
      filtered = publishers.filter((p) => p.name.toLowerCase().includes(search));
    }

    return {
      publishers: filtered,
      total: response.total ?? publishers.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Retrieves single publisher details from GET /admin/api/publisher/{publisher_id}.
   */
  async getById(id: string): Promise<Publisher> {
    const raw = await apiClient.get<GetPublisherResponseBody>(`/admin/api/publisher/${id}`);
    const name = raw.string || 'Unknown Publisher';
    const words = name.trim().split(/\s+/);
    const monogram = words
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'PUB';

    return {
      id: raw.id || id,
      name,
      monogram,
      booksCount: 0,
      status: 'Active',
    };
  },

  /**
   * Creates a publisher via documented POST /admin/api/publisher.
   */
  async create(data: PublisherFormData): Promise<{ id: string }> {
    const requestBody: CreatePublisherRequestBody = {
      name: data.name.trim(),
    };

    const response = await apiClient.post<CreatePublisherResponseBody>(
      '/admin/api/publisher',
      requestBody
    );

    return { id: response.id };
  },

  /**
   * Updates an existing publisher via documented PATCH /admin/api/publisher/{publisher_id}.
   */
  async update(id: string, data: PublisherFormData): Promise<void> {
    const requestBody: UpdatePublisherRequestBody = {
      name: data.name.trim(),
    };

    await apiClient.patch(`/admin/api/publisher/${id}`, requestBody);
  },

  /**
   * Deletes a publisher via DELETE /admin/api/publisher/{publisher_id}.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/api/publisher/`);
  },
};
