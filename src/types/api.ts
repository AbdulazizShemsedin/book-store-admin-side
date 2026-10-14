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

// ADMIN AUTHENTICATION
export interface AdminSigninRequestBody {
  email: string;
  password: string;
}

export interface AdminSigninResponseBody {
  token: string;
}

// LEGACY / MOBILE CLIENT AUTH (for shared support)
export interface SigninRequestBody {
  phone: string;
  pin: string;
}

export interface TokenResponseBody {
  access_token: string;
  token_type: string;
  refresh_token?: string | null;
}

// AUTHORS (/admin/api/author)
export interface ListAuthorItem {
  id: string; // uuid
  string: string; // Backend author name field is "string"
  nationality?: string | null;
  avatar?: string | null;
  description?: string | null;
  bio?: string;
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
  description?: string;
  nationality?: string;
  bio?: string;
  photo_url?: string;
}

export interface CreateAuthorResponseBody {
  id: string;
  name?: string;
}

// PUBLISHERS (/admin/api/publisher)
export interface ListPublisherResponseItem {
  id: string;
  string: string; // Backend publisher name field is "string"
}

export interface ListPublisherResponseBody {
  publishers: ListPublisherResponseItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreatePublisherRequestBody {
  name: string;
}

export interface CreatePublisherResponseBody {
  id: string;
}

// BOOKS (/admin/api/book)
export interface ListBookItem {
  id: string; // uuid
  name: string;
  publisher?: string | null;
  thumbnail?: string | null;
  language: string;
  has_book: boolean;
  has_audio: boolean;
  status: string;
  created_at: string; // ISO date-time
  updated_at: string; // ISO date-time
  author?: string | null;
}

export interface ListBookResponseBody {
  books: ListBookItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreateBookRequestBody {
  name: string;
  language: string; // 'en' | 'am' | 'ar'
  description?: string;
  author_id?: string; // uuid
  publisher_id?: string; // uuid
  book_price?: string; // e.g. "67.69"
  audio_price?: string; // e.g. "67.69"
  total_price?: string; // e.g. "67.69"
  thumbnail_id?: string;
}

export interface CreateBookResponseBody {
  id: string;
}

export interface GetBookResponseBody {
  id: string;
  name: string;
  description: string;
  has_book: boolean;
  has_audio: boolean;
  author?: string | null;
  rating?: string | null;
  tags?: string[] | null;
}

// BOOK ASSETS & THUMBNAILS & TAGS
export interface UploadBookAssetRequestBody {
  asset_type: 'book' | 'audio';
  content_type: 'application/epub+zip' | 'audio/mpeg';
  expected_parts: number;
  name: string;
}

export interface UploadBookAssetResponseBody {
  key: string;
  session_id?: string;
  upload_id: string;
}

export interface UploadBookThumbnailRequestBody {
  content_type: 'image/jpeg' | 'image/png' | 'image/webp';
  expected_parts: number;
  name: string;
}

export interface UploadBookThumbnailResponseBody {
  key: string;
  session_id?: string;
  upload_id: string;
}

export type AddBookAssetRequestBody = UploadBookAssetRequestBody;

export interface InitBookUploadRequestBody {
  content_type: string;
  expected_parts: number;
}

export interface InitBookUploadResponseBody {
  key: string;
  upload_id: string;
  session_id?: string;
}

export interface AddBookTagRequestBody {
  tag_id: string; // uuid
}

// CATEGORIES (/admin/api/category & /api/category)
export interface ListCategoryRequestBody {
  parent_id?: string;
}

export interface ListCategoryResponseItem {
  id: string;
  name: string;
  parent_id?: string | null;
  color?: string | null;
}

export interface ListCategoryResponseBody {
  categories: ListCategoryResponseItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface ListCategoryAdminRequestBody {
  parent_id?: string;
}

export interface ListCategoryAdminResponseItem {
  id: string;
  name: string;
  parent_id: string;
}

export interface ListCategoryAdminResponseBody {
  categories: ListCategoryAdminResponseItem[] | null;
  page: number;
  page_size: number;
  total: number;
}

export interface CreateCategoryRequestBody {
  name: string;
  parent_id?: string;
  color?: string;
}

// UPLOADS (/admin/api/upload)
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

