/**
 * TypeScript API Types derived directly from the backend OpenAPI contract.
 * Source: references/openapi.yaml
 */

export interface ErrorDetail {
  location?: string;
  message?: string;
  value?: unknown;
}

export interface ErrorModel {
  detail?: string;
  errors?: ErrorDetail[] | null;
  instance?: string;
  status?: number;
  title?: string;
  type?: string;
}

export interface SigninRequestBody {
  phone: string;
  pin: string;
}

export interface TokenResponseBody {
  access_token: string;
  token_type: string;
  refresh_token?: string | null;
}

// AUTHORS
export interface ListAuthorItem {
  id: string; // uuid
  string: string; // Backend calls display name "string"
  bio?: string;
  nationality?: string;
  photo_url?: string;
  works_count?: number;
}

export interface ListAuthorResponseBody {
  authors: ListAuthorItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreateAuthorRequestBody {
  name: string;
  bio?: string;
  nationality?: string;
  photo_url?: string;
}

export interface CreateAuthorResponseBody {
  id: string;
  name: string;
}

// BOOKS
export interface ListBookItem {
  author?: string | null;
  created_at: string; // ISO date-time
  id: string; // uuid
  name: string;
  status: string;
  updated_at: string; // ISO date-time
  has_audio?: boolean;
  publisher?: string;
}

export interface ListBookResponseBody {
  books: ListBookItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreateBookRequestBody {
  author_id?: string;
  description?: string;
  name: string;
  thumbnail_id?: string;
}

export interface CreateBookResponseBody {
  id: string;
  name: string;
  description: string | null;
  author_id?: string;
  thumbnail_id?: string;
}

export interface GetBookResponseBody {
  author?: string | null;
  description: string;
  has_audio: boolean;
  has_book: boolean;
  id: string;
  name: string;
  rating?: string | null;
  tags?: string[] | null;
}

// BOOK ASSETS & TAGS
export interface AddBookAssetRequestBody {
  asset_type: 'book' | 'audio';
  file_id: string; // uuid
}

export interface AddBookTagRequestBody {
  tag_id: string; // uuid
}

// CATEGORIES
export interface ListCategoryRequestBody {
  parent_id?: string;
}

export interface ListCategoryResponseItem {
  id: string;
  name: string;
  parent_id?: string | null;
}

export interface ListCategoryResponseBody {
  categories: ListCategoryResponseItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreateCategoryRequestBody {
  name: string;
  parent_id?: string;
}

// UPLOADS
export interface InitBookUploadRequestBody {
  content_type: 'application/epub+zip' | 'audio/mpeg' | 'image/png' | 'image/jpeg' | 'image/webp';
  expected_parts: number;
  session_id?: string;
}

export interface InitBookUploadResponseBody {
  key: string;
  session_id?: string;
  upload_id: string;
}

export interface GetBookUploadPartURLRequestBody {
  key: string;
  part_number: number;
  upload_id: string;
}

export interface GetBookUploadPartURLResponseBody {
  url: string;
}

export interface Part {
  etag: string;
  part_number: number;
}

export interface CompleteBookUploadRequestBody {
  parts: Part[] | null;
  session_id: string;
}
