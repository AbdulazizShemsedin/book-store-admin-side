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

// Initial design dataset from approved Figma Slide 9
const INITIAL_PUBLISHERS: Publisher[] = [
  { id: 'PUB-001', name: 'Darussalam Publishers', monogram: 'DP', booksCount: 142, status: 'Active' },
  { id: 'PUB-002', name: 'Islamic Texts Society (Cambridge)', monogram: 'ITS', booksCount: 68, status: 'Active' },
  { id: 'PUB-003', name: 'Turath Publishing (London)', monogram: 'TP', booksCount: 54, status: 'Active' },
  { id: 'PUB-004', name: 'Kube Publishing', monogram: 'KP', booksCount: 89, status: 'Active' },
  { id: 'PUB-005', name: 'Hurst Publishers', monogram: 'HP', booksCount: 31, status: 'Active' },
  { id: 'PUB-006', name: 'Dar Al-Qalam', monogram: 'DQ', booksCount: 75, status: 'Active' },
];

let inMemoryPublishers = [...INITIAL_PUBLISHERS];

export const publishersApi = {
  /**
   * BACKEND GAP ISOLATION:
   * The current OpenAPI specification does not expose /admin/api/publisher endpoints.
   * This adapter provides clean separation so once endpoints are deployed, only this
   * method needs to be redirected to apiClient.get('/admin/api/publisher').
   */
  async list(params: ListPublishersParams = {}): Promise<ListPublishersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const search = params.search?.toLowerCase() || '';

    let filtered = inMemoryPublishers;
    if (search) {
      filtered = inMemoryPublishers.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search) ||
          p.monogram.toLowerCase().includes(search)
      );
    }

    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      publishers: paginated,
      total: filtered.length,
      page,
      pageSize,
    };
  },

  /**
   * Creates a publisher.
   * Isolates the missing POST /admin/api/publisher backend endpoint.
   */
  async create(data: PublisherFormData): Promise<Publisher> {
    const words = data.name.trim().split(/\s+/);
    const monogram = words
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase())
      .join('');

    const newPublisher: Publisher = {
      id: `PUB-${String(inMemoryPublishers.length + 1).padStart(3, '0')}`,
      name: data.name.trim(),
      monogram: monogram || 'PUB',
      booksCount: 0,
      status: 'Active',
    };

    inMemoryPublishers = [newPublisher, ...inMemoryPublishers];
    return newPublisher;
  },

  /**
   * Deletes a publisher.
   */
  async delete(id: string): Promise<void> {
    inMemoryPublishers = inMemoryPublishers.filter((p) => p.id !== id);
  },
};
