import { ErrorModel } from '@/types/api';

/**
 * Normalized application error class.
 * Translates backend RFC 7807 / OpenAPI ErrorModel responses into
 * a predictable error object with field-level mappings for forms.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly title?: string;
  public readonly detail?: string;
  public readonly fieldErrors: Record<string, string>;
  public readonly rawError?: ErrorModel;

  constructor(status: number, message: string, raw?: ErrorModel) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.title = raw?.title;
    this.detail = raw?.detail;
    this.rawError = raw;
    this.fieldErrors = {};

    if (raw?.errors && Array.isArray(raw.errors)) {
      for (const err of raw.errors) {
        if (err.location && err.message) {
          // Normalize location e.g. "body.name" -> "name" or "body.author_id" -> "author_id"
          const fieldKey = err.location.replace(/^body\./, '');
          this.fieldErrors[fieldKey] = err.message;
        }
      }
    }
  }

  /**
   * Helper to check if this is an unauthorized (401) error.
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Helper to check if this is a forbidden (403) error.
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Helper to check if this is a validation (400 or 422) error.
   */
  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

/**
 * Parses HTTP responses and converts them into normalized ApiError instances.
 */
export async function normalizeApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  let rawJson: ErrorModel | null = null;
  let textFallback = '';

  try {
    const text = await response.text();
    textFallback = text;
    if (text) {
      rawJson = JSON.parse(text) as ErrorModel;
    }
  } catch {
    // Non-JSON response (e.g. gateway timeout or proxy error)
  }

  const message =
    rawJson?.detail ||
    rawJson?.title ||
    textFallback ||
    `HTTP Error ${status}: ${response.statusText}`;

  return new ApiError(status, message, rawJson || undefined);
}
