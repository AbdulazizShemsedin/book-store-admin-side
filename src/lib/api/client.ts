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
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    // When calling live tewba.et from browser, use local same-origin proxy to eliminate CORS errors
    if (typeof window !== 'undefined' && (raw.includes('tewba.et') || !raw)) {
      this.baseUrl = '';
    } else {
      this.baseUrl = (raw || 'http://localhost:8000').replace(/\/+$/, '');
    }
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
    const base =
      this.baseUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    const url = new URL(`${base}${normalizedEndpoint}`);

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
        credentials: 'include',
        ...fetchInit,
        headers,
        body: processedBody,
      });

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
          // Do not kick out if it's the signin attempt itself failing (to show invalid credentials message)
          if (!endpoint.includes('/signin')) {
            localStorage.removeItem('tewba_access_token');
            localStorage.removeItem('tewba_user_profile');
            localStorage.removeItem('tewba_session_active');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname);
            }
          }
        }
        throw await normalizeApiError(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const text = await response.text();
      if (!text || !text.trim()) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(text) as T;
        } catch {
          return {} as T;
        }
      }

      return text as unknown as T;
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

      // Network failures or unreachable backend
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Network error or backend unreachable'
      );
    }
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
