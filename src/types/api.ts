/**
 * TypeScript API Types derived directly from the backend OpenAPI contract.
 * Source: references/openapi.yaml & live backend OpenAPI schema
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
  token?: string;
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

export interface UpdateAuthorRequestBody {
  name?: string;
  nationality?: string;
  description?: string;
}

export interface GetAuthorResponseBody {
  id: string;
  string: string;
  nationality?: string | null;
  description: string;
  avatar?: string | null;
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

export interface UpdatePublisherRequestBody {
  name: string;
}

export interface GetPublisherResponseBody {
  id: string;
  string: string;
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
  author_id?: string | null;
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

export interface AssetsStruct {
  audio?: string | null;
  book?: string | null;
}

export interface PriceStruct {
  audio_only?: string | null;
  book_only?: string | null;
  total?: string | null;
}

export interface GetBookAdminResponseSeries {
  id: string; // uuid
  name: string;
}

export interface GetBookAdminResponseBody {
  id: string;
  name: string;
  author?: string | null;
  author_id?: string | null;
  description: string;
  has_book: boolean;
  has_audio: boolean;
  assets: AssetsStruct;
  price: PriceStruct;
  rating?: string | null;
  status: string;
  tags?: string[] | null;
  thumbnail?: string | null;
  series?: GetBookAdminResponseSeries | null;
}

export interface UpdateBookRequestBody {
  name?: string;
  description?: string;
  language: 'am' | 'ar' | 'en';
  author_id?: string;
  publisher_id?: string;
  status?: 'private' | 'public';
  book_price?: string;
  audio_price?: string;
  total_price?: string;
}

export interface GetBookResponseSeries {
  id: string; // uuid
  name: string;
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
  thumbnail?: string | null;
  series?: GetBookResponseSeries | null;
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

// SERIES (/admin/api/series & /api/series)
export interface CreateSeriesRequestBody {
  name: string; // minLength: 1, maxLength: 128
}

export interface CreateSeriesResponseBody {
  id: string;
}

export interface ListSeriesResponseItem {
  id: string; // uuid
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ListSeriesResponseBody {
  page: number;
  page_size: number;
  total: number;
  series: ListSeriesResponseItem[] | null;
}

export interface AddBookToSeriesRequestBody {
  book_id: string; // uuid
  position: number; // 1..128
}

export interface ListBookInSeriesAdminResponseItem {
  id: string; // uuid
  name: string;
  position: number;
  author: string | null;
  rating: string | null;
  thumbnail: string | null;
}

export interface ListBookInSeriesAdminResponseBody {
  page: number;
  page_size: number;
  total: number;
  books: ListBookInSeriesAdminResponseItem[] | null;
}

export interface ListSeriesBookResponseItem {
  id: string; // uuid
  name: string;
  position: number;
  author: string | null;
  rating: string | null;
  thumbnail: string | null;
  owned: boolean;
}

export interface ListBookInSeriesResponseBody {
  page: number;
  page_size: number;
  total: number;
  books: ListSeriesBookResponseItem[] | null;
}


// PLANS (/admin/api/plan & /api/plans)
export interface ListPlanResponseItem {
  id: string; // uuid
  string: string; // plan title
  price: string;
  discount?: number | null;
  discounted_price?: string | null;
  require_seats?: boolean;
  minimum_seats?: number;
  maximum_seats?: number | null;
}

export interface ListPlanResponseBody {
  page: number;
  page_size: number;
  total: number;
  plans: ListPlanResponseItem[] | null;
}

export interface GetPlanResponseBody {
  id: string; // uuid
  string: string; // plan title
  price: string;
  discount?: number | null;
  discounted_price?: string | null;
  require_seats: boolean;
  minimum_seats: number;
  maximum_seats?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlanRequestBody {
  price?: string;
  discount?: number; // 1..100
}

// ADVERTISEMENTS (/admin/api/advertisement)
export interface BookDetailAction {
  type: 'book_detail';
  book_id: string;
}

export interface ExternalLinkAction {
  type: 'external_link';
  url: string;
}

export interface SubscriptionAction {
  type: 'subscription';
}

export type AdvertisementAction = BookDetailAction | ExternalLinkAction | SubscriptionAction;

export interface CreateAdvertisementRequestBody {
  message: string; // 1..128
  action: AdvertisementAction;
  button_label?: string; // 1..128
  active_until?: string; // ISO date-time
}

export interface CreateAdvertisementResponseBody {
  id: string; // uuid
}

export interface ListAdvertisementResponseItem {
  id: string; // uuid
  message: string;
  active_until?: string | null;
  banner?: string | null;
}

export interface ListAdvertisementResponseBody {
  page: number;
  page_size: number;
  total: number;
  advertisements: ListAdvertisementResponseItem[] | null;
}

export interface GetAdvertisementResponseBody {
  id: string; // uuid
  message: string;
  action: AdvertisementAction;
  button_label?: string | null;
  active_until?: string | null;
  banner?: string | null;
  created_at: string;
  updated_at: string;
}

// REPORTS (/admin/api/reports/records/purchase & /admin/api/reports/records/subscription)
export interface ReportUserStruct {
  id: string; // uuid
  name: string;
  deleted_at?: string | null;
}

export interface PurchaseRecordBookStruct {
  id: string; // uuid
  name: string;
}

export interface ListPurchaseRecordsResponseItem {
  id: string; // uuid
  plan: PurchaseRecordBookStruct;
  type: 'book_only' | 'audio_only' | 'both';
  paid_price: string;
  user: ReportUserStruct;
  created_at: string;
}

export interface ListPurchaseRecordsResponseBody {
  page: number;
  page_size: number;
  total: number;
  records: ListPurchaseRecordsResponseItem[] | null;
}

export interface SubscriptionRecordPlanStruct {
  id: string; // uuid
  name: string;
}

export interface ListSubscriptionRecordsResponseItem {
  id: string; // uuid
  plan: SubscriptionRecordPlanStruct;
  type: 'init' | 'renewal';
  paid_price: string;
  user: ReportUserStruct;
  created_at: string;
}

export interface ListSubscriptionRecordsResponseBody {
  page: number;
  page_size: number;
  total: number;
  records: ListSubscriptionRecordsResponseItem[] | null;
}
