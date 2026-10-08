import { normalizeApiError, ApiError } from './error-handler';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string;
  skipAuth?: boolean;
}

/**
 * Centralized typed HTTP API Client.
 * Handles base URL configuration, query serialization, auth header injection,
 * and unified error normalization.
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
  }

  /**
   * Retrieves active auth token from local storage or returns null.
   * Client-side only.
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tewba_access_token');
  }

  /**
   * Core request dispatch method.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, token, skipAuth, ...fetchInit } = options;

    // Build URL with query params
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${normalizedEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = new Headers(customHeaders);

    // Attach Bearer token unless explicitly skipped
    if (!skipAuth) {
      const activeToken = token || this.getStoredToken();
      if (activeToken) {
        headers.set('Authorization', `Bearer ${activeToken}`);
      }
    }

    // Set JSON header if body is an object and not FormData
    let processedBody: BodyInit | undefined = undefined;
    if (body !== undefined && body !== null) {
      if (typeof FormData !== 'undefined' && body instanceof FormData) {
        processedBody = body;
      } else if (typeof body === 'string') {
        processedBody = body;
      } else {
        headers.set('Content-Type', 'application/json');
        processedBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url.toString(), {
        ...fetchInit,
        headers,
        body: processedBody,
      });

      if (!response.ok) {
        throw await normalizeApiError(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // If the request was intentionally aborted (e.g. user navigation or unmount),
      // re-throw genuine AbortError so TanStack Query handles it without retrying
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        Boolean(fetchInit.signal?.aborted)
      ) {
        const abortErr = error instanceof Error ? error : new Error('Request was aborted');
        abortErr.name = 'AbortError';
        throw abortErr;
      }

      // If backend is unreachable or not running, fallback to persistent mockStore in development
      const isMockEnabled =
        process.env.NODE_ENV !== 'production' &&
        (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
          process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ||
          process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false');

      if (isMockEnabled) {
        try {
          const fallbackData = await this.fallbackToMockStore<T>(
            fetchInit.method || 'GET',
            normalizedEndpoint,
            options
          );
          if (fallbackData !== undefined) {
            return fallbackData;
          }
        } catch (mockErr) {
          if (mockErr instanceof ApiError) throw mockErr;
          throw new ApiError(400, (mockErr as Error).message);
        }
      }

      // Network failures or unreachable backend
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Network error or backend unreachable'
      );
    }
  }

  /**
   * Seamless fallback to persistent mockStore when real backend port 8000 is not active.
   */
  private async fallbackToMockStore<T>(
    method: string,
    endpoint: string,
    options: RequestOptions
  ): Promise<T | undefined> {
    const { mockStore } = await import('@/mocks/store');
    const upperMethod = method.toUpperCase();
    const params = options.params || {};

    // Authors
    if (endpoint === '/admin/api/author') {
      if (upperMethod === 'GET') {
        const page = typeof params.page === 'number' ? params.page : parseInt(String(params.page || '1'), 10);
        const pageSize = typeof params.page_size === 'number' ? params.page_size : parseInt(String(params.page_size || '10'), 10);
        const search = params.search ? String(params.search) : undefined;
        return mockStore.getAuthors({ page, pageSize, search }) as unknown as T;
      }
      if (upperMethod === 'POST') {
        const body = (options.body as { name?: string; bio?: string; nationality?: string; photo_url?: string }) || {};
        return mockStore.createAuthor(body.name || '', body.bio, body.nationality, body.photo_url) as unknown as T;
      }
    }

    if (endpoint.startsWith('/admin/api/author/')) {
      const id = endpoint.replace('/admin/api/author/', '');
      if (upperMethod === 'DELETE') {
        mockStore.deleteAuthor(id);
        return {} as T;
      }
    }

    // Books
    if (endpoint === '/admin/api/book') {
      if (upperMethod === 'GET') {
        const page = typeof params.page === 'number' ? params.page : parseInt(String(params.page || '1'), 10);
        const pageSize = typeof params.page_size === 'number' ? params.page_size : parseInt(String(params.page_size || '10'), 10);
        const search = params.search ? String(params.search) : undefined;
        const status = params.status ? String(params.status) : undefined;
        return mockStore.getBooks({ page, pageSize, search, status }) as unknown as T;
      }
      if (upperMethod === 'POST') {
        const body = (options.body as { name?: string; author_id?: string; description?: string; thumbnail_id?: string }) || {};
        return mockStore.createBook({
          name: body.name || '',
          author_id: body.author_id,
          description: body.description,
          thumbnail_id: body.thumbnail_id,
        }) as unknown as T;
      }
    }

    if (endpoint.startsWith('/api/book/') || endpoint.startsWith('/admin/api/book/')) {
      const id = endpoint.split('/').pop() || '';
      if (upperMethod === 'GET') {
        const book = mockStore.getBookById(id);
        if (book) return book as unknown as T;
      }
      if (upperMethod === 'DELETE') {
        mockStore.deleteBook(id);
        return {} as T;
      }
    }

    // Categories
    if (endpoint === '/api/category' || endpoint === '/admin/api/category') {
      if (upperMethod === 'POST') {
        const body = (options.body as { name?: string; parent_id?: string }) || {};
        // Read listing: POST /api/category
        if (endpoint === '/api/category' && !body.name) {
          const page = typeof params.page === 'number' ? params.page : parseInt(String(params.page || '1'), 10);
          const pageSize = typeof params.page_size === 'number' ? params.page_size : parseInt(String(params.page_size || '50'), 10);
          return mockStore.getCategories({ page, pageSize, parentId: body.parent_id }) as unknown as T;
        }
        // Creation: POST /admin/api/category
        return mockStore.createCategory(body.name || '', body.parent_id) as unknown as T;
      }
    }

    if (endpoint.startsWith('/admin/api/category/')) {
      const id = endpoint.replace('/admin/api/category/', '');
      if (upperMethod === 'PUT') {
        const body = (options.body as { name?: string }) || {};
        return mockStore.updateCategory(id, body.name || '') as unknown as T;
      }
      if (upperMethod === 'DELETE') {
        mockStore.deleteCategory(id);
        return {} as T;
      }
    }

    // Tags
    if (endpoint === '/admin/api/tag') {
      if (upperMethod === 'GET') {
        return { tags: mockStore.getTags() } as unknown as T;
      }
      if (upperMethod === 'POST') {
        const body = (options.body as { name?: string }) || {};
        return mockStore.createTag(body.name || '') as unknown as T;
      }
    }

    // Book Asset / Tag bindings
    if ((endpoint === '/admin/api/book/add-asset' || endpoint.includes('/asset')) && upperMethod === 'POST') {
      const body = (options.body as { book_id?: string; asset_type?: 'book' | 'audio' }) || {};
      const match = endpoint.match(/\/admin\/api\/book\/([^/]+)\/asset/);
      const bookId = body.book_id || (match ? match[1] : undefined);
      if (bookId && body.asset_type) {
        mockStore.attachAsset(bookId, body.asset_type);
      }
      return {} as T;
    }

    if ((endpoint === '/admin/api/book/add-tag' || endpoint.includes('/tag')) && upperMethod === 'POST') {
      const body = (options.body as { book_id?: string; tag_id?: string }) || {};
      const match = endpoint.match(/\/admin\/api\/book\/([^/]+)\/tag/);
      const bookId = body.book_id || (match ? match[1] : undefined);
      if (bookId && body.tag_id) {
        mockStore.attachTag(bookId, body.tag_id);
      }
      return {} as T;
    }

    // Upload endpoints
    if (endpoint === '/admin/api/upload/init' && upperMethod === 'POST') {
      const sessionId = `sess_${Date.now()}`;
      return {
        key: `uploads/${sessionId}/asset`,
        session_id: sessionId,
        upload_id: `upload_${Date.now()}`,
      } as unknown as T;
    }

    if (endpoint === '/admin/api/upload/get-part' && upperMethod === 'POST') {
      return { url: `/mock-upload-storage/part` } as unknown as T;
    }

    if (endpoint === '/admin/api/upload/complete' && upperMethod === 'POST') {
      return {} as T;
    }

    return undefined;
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
