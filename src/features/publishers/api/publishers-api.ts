import { apiClient } from '@/lib/api/client';
import {
  ListPublisherResponseBody,
  CreatePublisherRequestBody,
  CreatePublisherResponseBody,
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
   * Deletion of publisher is not currently exposed in backend OpenAPI contract.
   */
  async delete(_id: string): Promise<void> {
    throw new Error('Publisher deletion is not supported by the backend API contract.');
  },
};
