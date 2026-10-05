# TEWBA Admin Web Application - Complete API Mapping Specification

Source of Truth: `references/openapi.yaml` (Backend OpenAPI Specification).

This document audits every backend capability relevant to the TEWBA Admin application, detailing:
1. HTTP Method, Path, and Operation ID
2. Request parameters, body fields, validation constraints, and types
3. Response fields and metadata
4. Exact deliberate frontend destination for every single field
5. Implementation status and mock layer simulation

---

## 1. Authentication & Security

### `POST /api/auth/phone/signin`
* **Operation ID**: `signin`
* **Tags**: `auth`
* **Security Requirements**: None (Public)
* **Request Body**: `application/json`
  * `phone` (`string`, required): Phone number / login identifier
  * `pin` (`string`, required): PIN or password
* **Responses**:
  * `200 OK`: `TokenResponseBody`
    * `access_token` (`string`, required): JWT bearer token
    * `token_type` (`string`, required): E.g. `"Bearer"`
    * `refresh_token` (`string | null`, optional)
  * `401 Unauthorized`: `ErrorModel`
  * `422 Unprocessable Entity`: `ErrorModel`
* **Frontend Field Destination**:
  * `phone` & `pin`: Driven by `/login` form (with email/identifier input support).
  * `access_token`: Handled by `src/providers/auth-provider.tsx` and `apiClient`. Injected automatically into the `Authorization: Bearer <token>` header for subsequent calls.
  * `token_type` & `refresh_token`: Managed by session storage/auth state.
* **Integration Status**: Fully integrated and intercepted by MSW mock.

---

## 2. Authors Management

### `GET /admin/api/author`
* **Operation ID**: `list-authors`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Query Parameters**:
  * `page` (`integer`, optional, default 1, min 1)
  * `page_size` (`integer`, optional, default 10, min 1, max 100)
* **Response (200 OK)**: `ListAuthorResponseBody`
  * `authors` (`Array<ListAuthorItem>`):
    * `id` (`string`, format `uuid`, required): Unique author identifier.
    * `string` (`string`, required): Author display name (awkward backend property name).
  * `total` (`integer`, required): Total count of matching author records.
  * `page` (`integer`, required): Current page index.
  * `page_size` (`integer`, required): Current page size limit.
* **Frontend Field Destinations**:
  * `authors[].id`: Displayed in Authors table (`src/features/authors/components/author-table.tsx`) as truncated UUID with full tooltip; used as unique React row key and for edit/delete actions.
  * `authors[].string`: Mapped at domain boundary (`src/features/authors/api/authors-api.ts`) to `author.name`; displayed in the Name column; used for client-side and server-side search.
  * `total`: Drives total count badge (`{total} Active Authors`), pagination total count, and total page calculation.
  * `page`: Drives active page state in URL query and `<Pagination />` component.
  * `page_size`: Drives page size selector dropdown (10, 20, 50).
* **Integration Status**: Fully integrated. MSW mock supports stateful pagination, search, and ordering.

### `POST /admin/api/author`
* **Operation ID**: `create-author`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Request Body**: `CreateAuthorRequestBody`
  * `name` (`string`, required, minLength: 1, maxLength: 128)
* **Response (201 Created)**: `CreateAuthorResponseBody`
  * `id` (`string`, format `uuid`, required): Newly generated author UUID.
  * `name` (`string`, required, minLength: 1, maxLength: 128)
* **Frontend Field Destinations**:
  * `name`: Controlled by `<Input label="Full Name" />` in `src/features/authors/components/author-modal.tsx`. Validated via Zod (`1..128` chars).
  * `id` & `name` (Response): Handled on mutation success. Invalidates `['authors']` query in TanStack Query, closes modal, and displays toast notification.
  * *PM Field Note*: `nationality` is captured in the UI according to PM requirements, but isolated in domain state because the backend `CreateAuthorRequestBody` currently only supports `name`.
* **Integration Status**: Fully integrated. MSW validates `1..128` chars, generates UUID, updates state, and returns 201.

---

## 3. Books Catalog Management

### `GET /admin/api/book`
* **Operation ID**: `list-book`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Query Parameters**:
  * `page` (`integer`, optional, default 1, min 1)
  * `page_size` (`integer`, optional, default 10, min 1, max 100)
* **Response (200 OK)**: `ListBookResponseBody`
  * `books` (`Array<ListBookItem>`):
    * `id` (`string`, format `uuid`, required): Book unique identifier.
    * `name` (`string`, required): Book title.
    * `author` (`string | null`, optional): Primary author display name.
    * `status` (`string`, required): Publication status (e.g. `Published`, `Draft`, `Review`).
    * `created_at` (`string`, format `date-time`, required): ISO creation timestamp.
    * `updated_at` (`string`, format `date-time`, required): ISO last updated timestamp.
  * `total` (`integer`, required): Total book count.
  * `page` (`integer`, required): Current page number.
  * `page_size` (`integer`, required): Items per page.
* **Frontend Field Destinations**:
  * `books[].id`: Links to `/books/[id]` detail page; used as table row key and for row action menus.
  * `books[].name`: Rendered in Book Title column with bold link to detail page.
  * `books[].author`: Rendered in Author column.
  * `books[].status`: Rendered in Status column via `<StatusBadge status={book.status} />` with colored semantic indicators.
  * `books[].created_at`: Formatted with `toLocaleDateString` and rendered in Created Date column.
  * `books[].updated_at`: Formatted with `toLocaleDateString` and rendered in Updated Date column.
  * `total`, `page`, `page_size`: Drive `<Pagination />` controls and header total counter.
* **Integration Status**: Fully integrated. Table accounts for all 6 item fields plus 3 metadata fields.

### `POST /admin/api/book`
* **Operation ID**: `create-book`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Request Body**: `CreateBookRequestBody`
  * `name` (`string`, required, minLength: 1, maxLength: 128)
  * `description` (`string`, optional, maxLength: 1024)
  * `author_id` (`string`, format `uuid`, optional)
  * `thumbnail_id` (`string`, format `uuid`, optional)
* **Response (201 Created)**: `CreateBookResponseBody` (`CreateBookResposneBody` in OpenAPI)
  * `id` (`string`, required): Created book UUID.
  * `name` (`string`, required): Echoed book title.
  * `description` (`string | null`, required): Book synopsis.
  * `author_id` (`string`, format `uuid`, optional)
  * `thumbnail_id` (`string`, format `uuid`, optional)
* **Frontend Field Destinations**:
  * `name`: User input field in `src/features/books/components/book-form.tsx`.
  * `description`: Textarea input field (character counter 0/1024).
  * `author_id`: Driven by searchable Author dropdown populated via `useAuthors()`.
  * `thumbnail_id`: Set from the result of the cover image upload step.
  * Response `id`: Handled in `useCreateBook` mutation callback to navigate administrator directly to `/books/${createdId}`.
* **Integration Status**: Fully integrated.

### `GET /api/book/{book_id}`
* **Operation ID**: `get-book`
* **Tags**: `book`
* **Security Requirements**: Bearer Auth
* **Path Parameters**:
  * `book_id` (`string`, format `uuid`, required)
* **Response (200 OK)**: `GetBookResponseBody`
  * `id` (`string`, format `uuid`, required)
  * `name` (`string`, required)
  * `description` (`string`, required)
  * `author` (`string | null`, optional)
  * `has_audio` (`boolean`, required)
  * `has_book` (`boolean`, required)
  * `rating` (`string | null`, optional)
  * `tags` (`Array<string> | null`, optional)
* **Frontend Field Destinations**:
  * Drives the detailed book view at `/books/[id]`: Title, Description, Author name, Format pills (eBook, Audiobook), Rating breakdown, and Tags pills list.
* **Integration Status**: Fully integrated.

---

## 4. Book Asset & Tag Association

### `POST /admin/api/book/{book_id}/asset`
* **Operation ID**: `add-book-asset`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Path Parameters**:
  * `book_id` (`string`, required): Book UUID.
* **Request Body**: `AddBookAssetRequestBody`
  * `asset_type` (`string`, enum: `['book', 'audio']`, required)
  * `file_id` (`string`, format `uuid`, required)
* **Responses**: `200 OK`, `401`, `422`, `500`
* **Frontend Field Destinations**:
  * `asset_type: 'book'`: Sent during book creation when an EPUB/PDF file is uploaded.
  * `asset_type: 'audio'`: Sent during book creation when an audiobook audio master file is uploaded.
  * `file_id`: Set to the uploaded asset UUID.
* **Integration Status**: Fully integrated.

### `POST /admin/api/book/{book_id}/tag`
* **Operation ID**: `add-book-tag`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Path Parameters**:
  * `book_id` (`string`, required): Book UUID.
* **Request Body**: `AddBookTagRequestBody`
  * `tag_id` (`string`, format `uuid`, required)
* **Responses**: `200 OK`, `401`, `422`, `500`
* **Frontend Field Destinations**:
  * `tag_id`: Set from selected tag UUIDs in the Tag selector.
* **Integration Status**: Fully integrated.

---

## 5. Category Taxonomy Management

### `POST /api/category`
* **Operation ID**: `list-category`
* **Tags**: `category`
* **Security Requirements**: Bearer Auth
* **Query Parameters**:
  * `page` (`integer`, optional, default 1)
  * `page_size` (`integer`, optional, default 50)
* **Request Body**: `ListCategoryRequestBody`
  * `parent_id` (`string`, format `uuid`, optional)
* **Response (200 OK)**: `ListCategoryResponseBody`
  * `categories` (`Array<ListCategoryResponseItem>`):
    * `id` (`string`, required): Category UUID.
    * `name` (`string`, required): Category name.
    * `parent_id` (`string | null`, optional): Parent category UUID if subcategory.
  * `total` (`integer`, required)
  * `page` (`integer`, required)
  * `page_size` (`integer`, required)
* **Frontend Field Destinations**:
  * `categories[].id`: Rendered in Category table as truncated ID with tooltip; used as unique row key and Select value.
  * `categories[].name`: Rendered in Category column; used in Book form category dropdown.
  * `categories[].parent_id`: Organizes taxonomy into a two-level hierarchy (root categories vs subcategories) with visual tree indentation.
* **Integration Status**: Fully integrated.

### `POST /admin/api/category`
* **Operation ID**: `create-category`
* **Tags**: `admin`
* **Security Requirements**: Bearer Auth
* **Request Body**: `CreateCategoryRequestBody`
  * `name` (`string`, required, minLength: 1, maxLength: 128)
  * `parent_id` (`string`, format `uuid`, optional)
* **Response (201 Created)**: Empty body with 201 Created (or `{ id: string }`)
* **Frontend Field Destinations**:
  * `name`: Controlled by Category Name text input in `CreateCategoryCard`.
  * `parent_id`: Controlled by Parent Category dropdown (`"None"` for root category, or selecting an existing root category to create a subcategory).
* **Integration Status**: Fully integrated.

---

## 6. Multipart File Upload Pipeline

### `POST /admin/api/upload/init`
* **Operation ID**: `init-book-upload`
* **Request Body**: `InitBookUploadRequestBody`
  * `content_type` (`string`, required, enum: `['application/epub+zip', 'audio/mpeg', 'image/png', 'image/jpeg', 'image/webp']`)
  * `expected_parts` (`integer`, required, min: 1, max: 10000)
  * `session_id` (`string`, optional)
* **Response (200 OK)**: `InitBookUploadResponseBody`
  * `key` (`string`, required): Upload object storage key.
  * `upload_id` (`string`, required): Multipart upload session ID.
  * `session_id` (`string`, optional): Upload session tracker.
* **Frontend Destination**: Managed by `src/lib/upload/multipart-upload.ts`. Computes chunks of 5MB and initiates upload session.

### `POST /admin/api/upload/get-part`
* **Operation ID**: `get-part-url`
* **Request Body**: `GetBookUploadPartURLRequestBody`
  * `key` (`string`, required)
  * `upload_id` (`string`, required)
  * `part_number` (`integer`, required, min: 1)
* **Response (200 OK)**: `GetBookUploadPartURLResponseBody`
  * `url` (`string`, required): Pre-signed direct upload URL.
* **Frontend Destination**: Browser streams chunk directly to storage URL via `PUT` with progress tracking.

### `POST /admin/api/upload/complete`
* **Operation ID**: `complete-book-upload`
* **Request Body**: `CompleteBookUploadRequestBody`
  * `session_id` (`string`, required)
  * `parts` (`Array<{ part_number: number, etag: string }>`, required)
* **Response (200 OK)**: Success acknowledgment.
* **Frontend Destination**: Confirms completion and resolves file ID for attachment.

---

## 7. Endpoints Not Relevant to Admin Portal

The following endpoints exist in `references/openapi.yaml` for mobile/reader client applications and are deliberately **NOT** exposed as admin management features:
* `/api/home/...` (Mobile home feed, banners, recommendations)
* `/api/search/...` (Public search suggestions and queries)
* `/api/reading-list/...` (End-user personal reading lists and bookmarks)
* `/api/book/{id}/reading-progress` (End-user reading position sync)
* `/api/book/{id}/rating` (Customer book reviews and stars submission)
* `/api/auth/phone/verify` & `/api/auth/phone/otp` (End-user phone verification flows)
