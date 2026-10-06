# TEWBA Admin Frontend-to-Backend Field Completeness Matrix

This audit maps every field, table column, filter, control, upload, and action in the TEWBA Book Store Admin frontend directly to its backend database and API representation.

---

## Classification Status Legend

Every item in this matrix is classified into strictly one of seven statuses:
1. **`[1] Already supported by current backend`**: Matches an existing property in `references/openapi.yaml`.
2. **`[2] Supported by current backend but frontend currently maps it incorrectly`**: Backend provides the data under an unexpected key (e.g. author name returned as `"string"`).
3. **`[3] Requires an extension to an existing endpoint`**: The endpoint exists, but the request or response schema must be extended.
4. **`[4] Requires a new endpoint`**: The resource or operation is completely missing from `references/openapi.yaml`.
5. **`[5] Frontend-only presentation state`**: Client UI convenience, formatting, animation, or visual state; no database persistence required.
6. **`[6] Future functionality not currently required from backend`**: Roadmapped product feature explicitly deferred (e.g. AI voice synthesis engine).
7. **`[7] Unresolved and requires explicit confirmation`**: Needs business rule or PM confirmation before final backend commitment.

---

## 1. Dashboard Overview (`/dashboard`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard` KPI Card 1 | TOTAL BOOKS | `totalBooks` | `total` | `integer` | Yes | No | `>= 0` | Book | Response | `GET /admin/api/book` | **[1]** | Derived directly from `ListBookResponseBody.total`. |
| `/dashboard` KPI Card 2 | AUTHORS | `totalAuthors` | `total` | `integer` | Yes | No | `>= 0` | Author | Response | `GET /admin/api/author` | **[1]** | Derived directly from `ListAuthorResponseBody.total`. |
| `/dashboard` KPI Card 3 | TOTAL BOOKS SOLD | `summary.booksSold` | `books_sold` | `integer` | Yes | No | `>= 0` | Report | Response | `GET /admin/api/reports` | **[4]** | Aggregated book sales count for selected period. |
| `/dashboard` KPI Card 4 | AUDIOBOOK SHARE | `summary.audiobookSharePercent` | `audiobook_share_percent` | `number` | Yes | No | `0.0 - 100.0` | Report | Response | `GET /admin/api/reports` | **[4]** | Percentage of sales with audiobook format. |
| `/dashboard` Table Col 1 | Title | `b.name` | `name` | `string` | Yes | No | Max 128 | Book | Response | `GET /admin/api/book` | **[1]** | Book catalog title. |
| `/dashboard` Table Col 2 | Author | `b.author` | `author` | `string` | No | Yes | Max 128 | Author | Response | `GET /admin/api/book` | **[1]** | Joined author name. |
| `/dashboard` Table Col 3 | Publisher | `b.publisher` | `publisher` | `string` | No | Yes | Max 128 | Publisher | Response | `GET /admin/api/book` | **[3]** | Currently missing from `ListBookItem`. |
| `/dashboard` Table Col 4 | Format | `b.hasAudiobook` | `has_audiobook` | `boolean` | Yes | No | `true/false` | Book | Response | `GET /admin/api/book` | **[3]** | Currently missing from `ListBookItem`. |
| `/dashboard` Activities | Recent activity | `recentActivities` | `audit_logs` | `array` | No | Yes | — | AuditLog | Response | `GET /admin/api/activity` | **[5]** | Currently client-rendered mock; can connect to future audit trail. |
| `/dashboard` Quick Action | Add Book | Link | — | — | — | — | — | Navigation | — | Route: `/books/new#book-form` | **[5]** | UI client routing. |
| `/dashboard` Quick Action | Add Author | Link | — | — | — | — | — | Navigation | — | Route: `/authors?action=new` | **[5]** | UI client routing. |
| `/dashboard` Quick Action | Add Publisher | Link | — | — | — | — | — | Navigation | — | Route: `/publishers#publisher-form-card` | **[5]** | UI client routing. |
| `/dashboard` Quick Action | Add Category | Link | — | — | — | — | — | Navigation | — | Route: `/categories#create-category-card` | **[5]** | UI client routing. |

---

## 2. Books Catalog List & Table (`/books`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/books` Table Col 1 | Cover | `book.coverUrl` | `thumbnail_id` / `cover_url` | `string` | No | Yes | UUID or URI | Book | Response | `GET /admin/api/book` | **[3]** | `ListBookItem` needs thumbnail reference. |
| `/books` Table Col 2 | Book Title | `book.name` | `name` | `string` | Yes | No | Max 128 | Book | Response | `GET /admin/api/book` | **[1]** | Maps to `ListBookItem.name`. |
| `/books` Table Col 3 | Author | `book.author` | `author` | `string` | No | Yes | Max 128 | Author | Response | `GET /admin/api/book` | **[1]** | Maps to `ListBookItem.author`. |
| `/books` Table Col 4 | Publisher | `book.publisher` | `publisher` | `string` | No | Yes | Max 128 | Publisher | Response | `GET /admin/api/book` | **[3]** | Needs to be exposed in `ListBookItem`. |
| `/books` Table Col 5 | Format | `book.hasAudiobook` | `has_audiobook` | `boolean` | Yes | No | `true/false` | Book | Response | `GET /admin/api/book` | **[3]** | Needs to be exposed in `ListBookItem`. |
| `/books` Table Col 6 | Created | `book.createdAt` | `created_at` | `string` | Yes | No | ISO 8601 date-time | Book | Response | `GET /admin/api/book` | **[1]** | Maps to `ListBookItem.created_at`. |
| `/books` Table Col 7 | Updated | `book.updatedAt` | `updated_at` | `string` | Yes | No | ISO 8601 date-time | Book | Response | `GET /admin/api/book` | **[1]** | Maps to `ListBookItem.updated_at`. |
| `/books` Table Col 8 | Actions: View | `book.id` | `id` | `string` | Yes | No | UUID | Book | Response | Route: `/books/${id}` | **[1]** | Maps to `ListBookItem.id`. |
| `/books` Table Col 8 | Actions: Delete | `book.id` | `id` | `string` | Yes | No | UUID | Book | Request | `DELETE /admin/api/book/{id}` | **[4]** | Missing delete endpoint in base OpenAPI. |
| `/books` Search | Search... | `search` | `search` | `string` | No | No | Min 1 | Query | Request | `GET /admin/api/book` | **[3]** | Query param missing from base OpenAPI `list-book`. |
| `/books` Filter | Category | `category` | `category` | `string` | No | No | Category name or UUID | Query | Request | `GET /admin/api/book` | **[3]** | Query param missing from base OpenAPI `list-book`. |
| `/books` Filter | Filter: Format | `format` | `has_audiobook` | `boolean` | No | No | `true/false` | Query | Request | `GET /admin/api/book` | **[3]** | Query param missing from base OpenAPI `list-book`. |
| `/books` Pagination | Page Number | `page` | `page` | `integer` | No | No | `>= 1` | Query | Request | `GET /admin/api/book` | **[1]** | Supported by base OpenAPI. |
| `/books` Pagination | Page Size | `pageSize` | `page_size` | `integer` | No | No | `1 - 100` | Query | Request | `GET /admin/api/book` | **[1]** | Supported by base OpenAPI. |
| `/books` Pagination | Total Records | `total` | `total` | `integer` | Yes | No | `>= 0` | Pagination | Response | `GET /admin/api/book` | **[1]** | Supported by base OpenAPI. |

---

## 3. Book Registration Form (`/books/new`, `BookForm`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `BookForm` Section 1 | Book Title * | `name` | `name` | `string` | Yes | No | `1 - 128 chars` | Book | Request | `POST /admin/api/book` | **[1]** | Supported in `CreateBookRequestBody.name`. |
| `BookForm` Section 1 | Author * | `authorId` | `author_id` | `string` | Yes | No | UUID | Book | Request | `POST /admin/api/book` | **[1]** | Supported in `CreateBookRequestBody.author_id`. |
| `BookForm` Section 1 | Publisher | `publisherId` | `publisher_id` | `string` | No | Yes | UUID or PUB-xxx | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 1 | Number of Pages | `pageCount` | `page_count` | `integer` | No | Yes | `>= 1` | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 1 | Tags * | `tags` | `tag_id` / `tags` | `array` | Yes | No | Min 1 tag | Tag | Request | `POST /admin/api/book/{id}/tag` | **[1]** | Currently bound via loop to `/tag`. Recommended: accept `tags: []` in `CreateBookRequestBody`. |
| `BookForm` Section 1 | Tag Color Picker | `tagColors[tag]` | `color` | `string` | No | Yes | Hex color `#RRGGBB` | Tag | Request | `POST /admin/api/tag` | **[4]** | Custom tag color badge in UI. |
| `BookForm` Section 1 | Primary Category * | `categoryId` | `category_id` | `string` | Yes | No | UUID | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 1 | Subcategory | `subcategoryId` | `subcategory_id` | `string` | No | Yes | UUID | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 1 | Description | `description` | `description` | `string` | No | Yes | Max 1024 chars | Book | Request | `POST /admin/api/book` | **[1]** | Supported in `CreateBookRequestBody.description`. |
| `BookForm` Section 1 | Master Language * | `language` | `language` | `string` | Yes | No | Enum/string | Book | Request | `POST /admin/api/book` | **[3]** | PM Requirement: applies to text and audio. Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 2 | Book File (EPUB/PDF) * | `bookFileId` | `file_id` | `string` | Yes | No | UUID | Asset | Request | `POST /admin/api/book/{id}/asset` | **[1]** | Bound as `asset_type: "book"`. |
| `BookForm` Section 2 | Audiobook Option | `audiobookOption` | — | `string` | Yes | No | `'has_audiobook' \| 'ai_generated'` | Book | Client | Component State | **[5]** | Client branch toggle between audio upload and AI notice. |
| `BookForm` Section 2 | Has Audiobook ? | `hasAudiobook` | `has_audiobook` | `boolean` | Yes | No | `true/false` | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 2 | AI Generated Option | — | — | — | — | — | — | Audio | — | — | **[6]** | Future AI voice pipeline. Do not implement backend now. |
| `BookForm` Section 2 | Narrator Name | `narrator` | `narrator` | `string` | No | Yes | Max 128 chars | Book | Request | `POST /admin/api/book` | **[3]** | Needs addition to `CreateBookRequestBody`. |
| `BookForm` Section 2 | Audio Master File | `audioFileId` | `file_id` | `string` | No | Yes | UUID | Asset | Request | `POST /admin/api/book/{id}/asset` | **[1]** | Bound as `asset_type: "audio"`. |
| `BookForm` Section 3 | Cover Image File | `coverFileId` | `thumbnail_id` | `string` | No | Yes | UUID | Book | Request | `POST /admin/api/book` | **[1]** | Supported in `CreateBookRequestBody.thumbnail_id`. |
| `BookForm` Section 3 | Save Book | Submit | — | — | — | — | — | Action | Request | `POST /admin/api/book` | **[1]** | Triggers book creation sequence. |

---

## 4. Book Details & Editing Screen (`/books/[id]`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/books/[id]` Header | Book Details - {name} | `book.name` | `name` | `string` | Yes | No | Max 128 | Book | Response | `GET /api/book/{id}` | **[1]** | Supported by base OpenAPI. |
| `/books/[id]` Metadata | Category | `book.category` | `category` | `string` | No | Yes | Max 128 | Category | Response | `GET /api/book/{id}` | **[3]** | Currently missing from `GetBookResponseBody`. |
| `/books/[id]` Metadata | Author | `book.author` | `author` | `string` | No | Yes | Max 128 | Author | Response | `GET /api/book/{id}` | **[1]** | Supported in `GetBookResponseBody.author`. |
| `/books/[id]` Metadata | Publisher | `book.publisher` | `publisher` | `string` | No | Yes | Max 128 | Publisher | Response | `GET /api/book/{id}` | **[3]** | Currently missing from `GetBookResponseBody`. |
| `/books/[id]` Metadata | Publication Date | `book.createdAt` | `created_at` | `string` | Yes | No | ISO date-time | Book | Response | `GET /api/book/{id}` | **[3]** | Currently missing from `GetBookResponseBody`. |
| `/books/[id]` Metadata | Page Count | `book.pageCount` | `page_count` | `integer` | No | Yes | `>= 1` | Book | Response | `GET /api/book/{id}` | **[3]** | Currently missing from `GetBookResponseBody`. |
| `/books/[id]` Metadata | Primary Language | `book.language` | `language` | `string` | No | Yes | Max 64 | Book | Response | `GET /api/book/{id}` | **[3]** | Currently missing from `GetBookResponseBody`. |
| `/books/[id]` Description | Description | `book.description` | `description` | `string` | No | Yes | Max 1024 | Book | Response | `GET /api/book/{id}` | **[1]** | Supported in `GetBookResponseBody.description`. |
| `/books/[id]` Assets | EPUB Master File | EPUB Asset | `file_id` / `filename` | `object` | No | Yes | EPUB format | Asset | Response | `GET /api/book/{id}/asset` | **[1]** | Supported by base OpenAPI. |
| `/books/[id]` Assets | Replace EPUB | Upload | `file_id` | `string` | No | Yes | UUID | Asset | Request | `POST /admin/api/book/{id}/asset` | **[1]** | Supported by base OpenAPI. |
| `/books/[id]` Assets | Audiobook Master | Audio Asset | `file_id` / `filename` | `object` | No | Yes | MP3 format | Asset | Response | `GET /api/book/{id}/asset` | **[1]** | Supported by base OpenAPI. |
| `/books/[id]` Assets | Replace Audio | Upload | `file_id` | `string` | No | Yes | UUID | Asset | Request | `POST /admin/api/book/{id}/asset` | **[1]** | Supported by base OpenAPI. |
| `/books/[id]` Assets | Replace Cover | Upload | `thumbnail_id` | `string` | No | Yes | UUID | Book | Request | `PUT /admin/api/book/{id}` | **[4]** | Book update endpoint required. |
| `/books/[id]` Tags | Attached Tags | `book.tags` | `tags` | `array` | No | Yes | Array of strings | Tag | Response | `GET /api/book/{id}` | **[1]** | Supported in `GetBookResponseBody.tags`. |
| `/books/[id]` Tags | Remove Tag | Tag unbind | `tag_id` | `string` | Yes | No | UUID | Tag | Request | `DELETE /admin/api/book/{id}/tag/{tag_id}` | **[4]** | Missing delete tag association endpoint. |
| `/books/[id]` Stats | Copies Sold | — | `units_sold` | `integer` | No | Yes | `>= 0` | Stat | Response | `GET /api/book/{id}` | **[3]** | Aggregated circulation stat. |
| `/books/[id]` Stats | Audio Plays | — | `audio_plays` | `integer` | No | Yes | `>= 0` | Stat | Response | `GET /api/book/{id}` | **[3]** | Aggregated audio streaming count. |
| `/books/[id]` Stats | Average Rating | `book.rating` | `rating` | `string` | No | Yes | e.g. "4.9" | Stat | Response | `GET /api/book/{id}` | **[1]** | Supported in `GetBookResponseBody.rating`. |
| `/books/[id]` Save | Save Changes | Submit | — | — | — | — | — | Book | Request | `PUT /admin/api/book/{id}` | **[4]** | Missing book update endpoint. |

---

## 5. Author Directory & Modals (`/authors`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/authors` Table Col 1 | Author Name | `author.name` | `string` / `name` | `string` | Yes | No | `1 - 128 chars` | Author | Response | `GET /admin/api/author` | **[2]** | Base OpenAPI names this `"string"`. Standardize to `"name"`. |
| `/authors` Table Col 1 | Profile Photo | `author.photoUrl` | `photo_url` | `string` | No | Yes | URI | Author | Response | `GET /admin/api/author` | **[3]** | Missing in `ListAuthorItem`. |
| `/authors` Table Col 1 | Biography Snippet | `author.bio` | `bio` | `string` | No | Yes | Max 1024 | Author | Response | `GET /admin/api/author` | **[3]** | Missing in `ListAuthorItem`. |
| `/authors` Table Col 2 | Works | `author.worksCount` | `works_count` | `integer` | No | Yes | `>= 0` | Author | Response | `GET /admin/api/author` | **[3]** | Missing in `ListAuthorItem` (can be `COUNT(books)`). |
| `/authors` Table Col 3 | Nationality | `author.nationality` | `nationality` | `string` | No | Yes | Max 64, Default 'Yemeni' | Author | Response | `GET /admin/api/author` | **[3]** | PM-confirmed replacement for Genre/Joined Date. |
| `/authors` Table Col 4 | Edit Author | `author` | — | — | — | — | — | Author | Request | `PUT /admin/api/author/{id}` | **[4]** | Author update endpoint missing from base OpenAPI. |
| `/authors` Table Col 4 | View Profile & Books | `author` | — | — | — | — | — | Author | Request | `GET /admin/api/author/{id}` | **[4]** | Detail endpoint missing from base OpenAPI. |
| `/authors` Table Col 4 | Delete Author | `author.id` | `id` | `string` | Yes | No | UUID | Author | Request | `DELETE /admin/api/author/{id}` | **[4]** | Delete author endpoint missing from base OpenAPI. |
| `/authors` Search | Search author... | `search` | `search` | `string` | No | No | Min 1 | Query | Request | `GET /admin/api/author` | **[3]** | Query param missing from base OpenAPI `list-authors`. |
| `/authors` Filter | Filter Field | — | — | — | — | — | — | UI | — | Client | **[5]** | UI layout element. |
| `/authors` Sort | Sort: Joined | — | `sort` | `string` | No | No | `created_at` | Query | Request | `GET /admin/api/author` | **[5]** | Client display sort; optional query param. |
| `/authors` Pagination | Page / Page Size / Total | `page`, `pageSize`, `total` | `page`, `page_size`, `total` | `integer` | Yes | No | Standard pagination | Author | Both | `GET /admin/api/author` | **[1]** | Supported by base OpenAPI. |
| `AuthorModal` Input 1 | Author Full Name * | `name` | `name` | `string` | Yes | No | `1 - 128 chars` | Author | Request | `POST /admin/api/author` | **[1]** | Supported in `CreateAuthorRequestBody.name`. |
| `AuthorModal` Input 2 | Nationality | `nationality` | `nationality` | `string` | No | Yes | Max 64, Default 'Yemeni' | Author | Request | `POST /admin/api/author` | **[3]** | PM-confirmed addition to `CreateAuthorRequestBody`. |
| `AuthorModal` Input 3 | Profile Photo | `photoUrl` | `photo_url` | `string` | No | Yes | URI | Author | Request | `POST /admin/api/author` | **[3]** | Needs addition to `CreateAuthorRequestBody`. |
| `AuthorModal` Input 4 | Biography & Works | `bio` | `bio` | `string` | No | Yes | Max 1024 chars | Author | Request | `POST /admin/api/author` | **[3]** | Needs addition to `CreateAuthorRequestBody`. |
| `AuthorDetailModal` | Catalog Books List | `authorBooks` | `books` | `array` | No | Yes | List of book objects | Book | Response | `GET /admin/api/author/{id}` | **[4]** | Author detail modal lists books published by this author. |

---

## 6. Publishers Management (`/publishers`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/publishers` Table Col 1 | Publisher Name | `pub.name` | `name` | `string` | Yes | No | `1 - 128 chars` | Publisher | Response | `GET /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Table Col 1 | Monogram Avatar | `pub.monogram` | `monogram` | `string` | No | Yes | Max 8 chars, uppercase | Publisher | Response | `GET /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Table Col 1 | Published Titles Count | `pub.booksCount` | `books_count` | `integer` | No | Yes | `>= 0` | Publisher | Response | `GET /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Table Col 2 | Edit Publisher | `pub` | — | — | — | — | — | Publisher | Request | `PUT /admin/api/publisher/{id}` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Table Col 2 | Delete Publisher | `pub.id` | `id` | `string` | Yes | No | UUID / PUB-xxx | Publisher | Request | `DELETE /admin/api/publisher/{id}` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Search | Search... | `search` | `search` | `string` | No | No | Min 1 | Query | Request | `GET /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |
| `/publishers` Pagination | Page / Page Size / Total | `page`, `pageSize`, `total` | `page`, `page_size`, `total` | `integer` | Yes | No | Standard pagination | Publisher | Both | `GET /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |
| `PublisherFormCard` | Publisher Name * | `name` | `name` | `string` | Yes | No | `1 - 128 chars` | Publisher | Request | `POST /admin/api/publisher` | **[4]** | Missing endpoint in base OpenAPI. |

---

## 7. Categories & Subcategories (`/categories`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/categories` Table Col 1 | Category / Hierarchy | `node.name` | `name` | `string` | Yes | No | `1 - 128 chars` | Category | Response | `POST /api/category` | **[1]** | Supported in base OpenAPI. |
| `/categories` Table Col 1 | Hierarchy Level (L1-L5) | `node.depth` | `level` / derived | `integer` | Yes | No | `1 - 5` | Category | Client | Derived from tree | **[5]** | Frontend computes depth from `parent_id` chain. |
| `/categories` Table Col 2 | Subcategories | `node.children` | `subcategories` | `array` | No | Yes | Child categories | Category | Response | `POST /api/category` | **[1]** | Derived by client filtering `parent_id == node.id`. |
| `/categories` Table Col 3 | Add Subcategory [+] | `node` | `parent_id` | `string` | Yes | No | UUID | Category | Request | `POST /admin/api/category` | **[1]** | Pre-populates parent in create card. |
| `/categories` Table Col 3 | Edit Category | `node` | `name` | `string` | Yes | No | `1 - 128 chars` | Category | Request | `PUT /admin/api/category/{id}` | **[4]** | Update category endpoint missing from base OpenAPI. |
| `/categories` Table Col 3 | Delete Category | `node.id` | `id` | `string` | Yes | No | UUID | Category | Request | `DELETE /admin/api/category/{id}` | **[4]** | Delete category endpoint missing from base OpenAPI. |
| `/categories` Controls | Expand all / Collapse all | — | — | — | — | — | — | UI | — | Client State | **[5]** | Client UI tree expansion toggle. |
| `/categories` Search | Search... | `search` | — | `string` | No | No | Min 1 | UI | Request | Client-side filter | **[5]** | Filters client hierarchy tree. |
| `CreateCategoryCard` | Parent Category (Optional) | `parentId` | `parent_id` | `string` | No | Yes | UUID | Category | Request | `POST /admin/api/category` | **[1]** | Supported in `CreateCategoryRequestBody.parent_id`. |
| `CreateCategoryCard` | Category Name * | `name` | `name` | `string` | Yes | No | `1 - 128 chars` | Category | Request | `POST /admin/api/category` | **[1]** | Supported in `CreateCategoryRequestBody.name`. |
| `CreateCategoryCard` | Child Subcategories | `subcategories` | `name` + `parent_id` | `array` | No | Yes | List of child names | Category | Request | `POST /admin/api/category` | **[1]** | Frontend executes batch create with new parent's ID. |

---

## 8. Advertisements Carousel (`/advertisements`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/advertisements` Col 1 | Drag Grip | — | — | — | — | — | — | UI | — | Client | **[5]** | Reorder handle for `@dnd-kit`. |
| `/advertisements` Col 2 | Order No | `ad.order` | `order` | `integer` | Yes | No | `>= 1` | Ad | Response | `GET /admin/api/advertisement` | **[4]** | Carousel position sequence. |
| `/advertisements` Col 3 | Preview | `ad.imageUrl` | `image_url` | `string` | Yes | No | URI | Ad | Response | `GET /admin/api/advertisement` | **[4]** | Banner image preview. |
| `/advertisements` Col 4 | Ad Message | `ad.message` | `message` | `string` | Yes | No | `1 - 128 chars` | Ad | Response | `GET /admin/api/advertisement` | **[4]** | Promo copy (e.g. "30% OFF BOOKS"). |
| `/advertisements` Col 5 | Status | `ad.status` | `status` | `string` | Yes | No | `'active' \| 'disabled'` | Ad | Response | `GET /admin/api/advertisement` | **[4]** | Carousel visibility flag. |
| `/advertisements` Col 6 | Toggle Status | `ad.id` | `status` | `string` | Yes | No | `'active' \| 'disabled'` | Ad | Request | `PATCH /admin/api/advertisement/{id}/status` | **[4]** | Missing endpoint in base OpenAPI. |
| `/advertisements` Col 6 | Move Up / Move Down | `handleMove` | `ordered_ids` | `array` | Yes | No | Array of ad IDs | Ad | Request | `PUT /admin/api/advertisement/reorder` | **[4]** | Reorder endpoint required. |
| `/advertisements` Col 6 | Delete | `ad.id` | `id` | `string` | Yes | No | Ad identifier | Ad | Request | `DELETE /admin/api/advertisement/{id}` | **[4]** | Missing endpoint in base OpenAPI. |
| `AdEditorCard` | Ad message * | `message` | `message` | `string` | Yes | No | `1 - 128 chars` | Ad | Request | `POST /admin/api/advertisement` | **[4]** | Missing endpoint in base OpenAPI. |
| `AdEditorCard` | Order of Display * | `order` | `order` | `integer` | Yes | No | `>= 1` | Ad | Request | `POST /admin/api/advertisement` | **[4]** | Missing endpoint in base OpenAPI. |
| `AdEditorCard` | Background image * | `imageUrl` | `image_url` | `string` | Yes | No | URI or asset key | Ad | Request | `POST /admin/api/advertisement` | **[4]** | Missing endpoint in base OpenAPI. |

---

## 9. Reports, Finance & Transactions (`/reports`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/reports` Period Bar | Today, 7d, 30d, Custom | `period` | `period` | `string` | Yes | No | `today, 7d, 30d, custom` | Query | Request | `GET /admin/api/reports` | **[4]** | Missing reporting endpoint in base OpenAPI. |
| `/reports` Period Bar | Custom Date Range | `startDate`, `endDate` | `start_date`, `end_date` | `string` | No | Yes | YYYY-MM-DD | Query | Request | `GET /admin/api/reports` | **[4]** | Required when `period=custom`. |
| `/reports` KPI Card 1 | Total income | `summary.totalIncome` | `total_income` | `number` | Yes | No | `>= 0.00` | Report | Response | `GET /admin/api/reports` | **[4]** | Gross/net income for period. |
| `/reports` KPI Card 1 | Income Growth % | `summary.totalIncomeGrowthPercent` | `total_income_growth_percent` | `number` | Yes | No | Float | Report | Response | `GET /admin/api/reports` | **[4]** | Period-over-period percentage growth. |
| `/reports` KPI Card 2 | Books Sold | `summary.booksSold` | `books_sold` | `integer` | Yes | No | `>= 0` | Report | Response | `GET /admin/api/reports` | **[4]** | Units sold during selected timeframe. |
| `/reports` KPI Card 2 | Books Sold Growth % | `summary.booksSoldGrowthPercent` | `books_sold_growth_percent` | `number` | Yes | No | Float | Report | Response | `GET /admin/api/reports` | **[4]** | Period-over-period volume growth. |
| `/reports` KPI Card 3 | Audiobook Books | `summary.audiobookBooks` | `audiobook_books` | `integer` | Yes | No | `>= 0` | Report | Response | `GET /admin/api/reports` | **[4]** | Audio units sold/streamed. |
| `/reports` KPI Card 3 | Audiobook Share % | `summary.audiobookSharePercent` | `audiobook_share_percent` | `number` | Yes | No | `0.0 - 100.0` | Report | Response | `GET /admin/api/reports` | **[4]** | Share of total sales from audiobooks. |
| `/reports` Chart | Books Sold trend line | `pt.booksSold` | `books_sold` | `integer` | Yes | No | `>= 0` | TrendPoint | Response | `GET /admin/api/reports` | **[4]** | Daily/periodic book sales series. |
| `/reports` Chart | Audiobooks Sold trend line | `pt.audiobooksSold` | `audiobooks_sold` | `integer` | Yes | No | `>= 0` | TrendPoint | Response | `GET /admin/api/reports` | **[4]** | Daily/periodic audio sales series. |
| `/reports` Chart | Revenue trend line | `pt.revenue` | `revenue` | `number` | Yes | No | `>= 0.00` | TrendPoint | Response | `GET /admin/api/reports` | **[4]** | Daily revenue amount. |
| `/reports` Ranking 1 | Top Books: Rank | `item.rank` | `rank` | `integer` | Yes | No | `1 - 5` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Top 5 rank. |
| `/reports` Ranking 1 | Top Books: Title | `item.title` | `title` | `string` | Yes | No | Max 128 | Ranking | Response | `GET /admin/api/reports` | **[4]** | Book title. |
| `/reports` Ranking 1 | Top Books: Subtitle | `item.subtitle` | `subtitle` | `string` | No | Yes | Max 256 | Ranking | Response | `GET /admin/api/reports` | **[4]** | Arabic or alternative title. |
| `/reports` Ranking 1 | Top Books: Sold | `item.soldCount` | `sold_count` | `integer` | Yes | No | `>= 0` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Copies sold. |
| `/reports` Ranking 1 | Top Books: % of Sales | `item.percentOfSales` | `percent_of_sales` | `number` | Yes | No | `0.0 - 100.0` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Percentage share of total volume. |
| `/reports` Ranking 2 | Top Audio: Rank | `item.rank` | `rank` | `integer` | Yes | No | `1 - 5` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Top 5 rank. |
| `/reports` Ranking 2 | Top Audio: Title | `item.title` | `title` | `string` | Yes | No | Max 128 | Ranking | Response | `GET /admin/api/reports` | **[4]** | Audiobook title. |
| `/reports` Ranking 2 | Top Audio: Sold | `item.soldCount` | `sold_count` | `integer` | Yes | No | `>= 0` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Units sold. |
| `/reports` Ranking 2 | Top Audio: Hour of Play | `item.hoursPlayed` | `hours_played` | `number` | Yes | No | `>= 0.0` | Ranking | Response | `GET /admin/api/reports` | **[4]** | Total streamed listening hours. |
| `TransactionsTable` Col 1 | Title & Category | `tx.title`, `tx.category` | `title`, `category` | `string` | Yes | No | Max 128 | Transaction | Response | `GET /admin/api/reports/transactions` | **[4]** | Book title and catalog category. |
| `TransactionsTable` Col 2 | Author & Publisher | `tx.author`, `tx.publisher` | `author`, `publisher` | `string` | Yes | No | Max 128 | Transaction | Response | `GET /admin/api/reports/transactions` | **[4]** | Author and publisher house. |
| `TransactionsTable` Col 3 | Format Support | `tx.formats` | `formats` | `array` | Yes | No | `['EPUB', 'Audio']` | Transaction | Response | `GET /admin/api/reports/transactions` | **[4]** | Formats purchased/distributed. |
| `TransactionsTable` Col 4 | Units Sold | `tx.unitsSold` | `units_sold` | `integer` | Yes | No | `>= 0` | Transaction | Response | `GET /admin/api/reports/transactions` | **[4]** | Copies purchased. |
| `TransactionsTable` Col 5 | Income | `tx.income` | `income` | `number` | Yes | No | Currency (USD) | Transaction | Response | `GET /admin/api/reports/transactions` | **[4]** | Gross revenue settlement. |
| `TransactionsTable` Col 6 | Analytics Action | ChartBar icon | — | — | — | — | — | UI | — | Client | **[5]** | Row analytics trigger. |

---

## 10. File Uploads & Asset Binding Lifecycle

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dropzone Step 1 | Initialize Upload | `contentType`, `expectedParts` | `content_type`, `expected_parts` | `string`, `int` | Yes | No | Allowed MIME types | Upload | Request | `POST /admin/api/upload/init` | **[1]** | Supported by base OpenAPI. |
| Dropzone Step 1 | Init Response | `key`, `upload_id`, `session_id` | `key`, `upload_id`, `session_id` | `string` | Yes | No | Upload session tokens | Upload | Response | `POST /admin/api/upload/init` | **[1]** | Supported by base OpenAPI. |
| Dropzone Step 2 | Presigned URL | `partNumber`, `key`, `upload_id` | `part_number`, `key`, `upload_id` | `int`, `string` | Yes | No | Part 1..N | Upload | Request | `POST /admin/api/upload/get-part` | **[1]** | Supported by base OpenAPI. |
| Dropzone Step 2 | Storage URL | `url` | `url` | `string` | Yes | No | S3/GCS presigned PUT URL | Upload | Response | `POST /admin/api/upload/get-part` | **[1]** | Direct browser PUT. |
| Dropzone Step 3 | Complete Upload | `sessionId`, `parts` | `session_id`, `parts` | `string`, `array` | Yes | No | ETags and part numbers | Upload | Request | `POST /admin/api/upload/complete` | **[1]** | Supported in base OpenAPI request. |
| Dropzone Step 3 | Complete Response | `file_id` | `file_id` | `string` | Yes | No | UUID | Upload | Response | `POST /admin/api/upload/complete` | **[3]** | **CRITICAL FIX**: Backend must return `{ file_id: "uuid" }` upon completion so frontend can bind it to book assets or covers. |
| Dropzone Step 4 | Attach to Book | `asset_type`, `file_id` | `asset_type`, `file_id` | `string`, `uuid` | Yes | No | `'book' \| 'audio'` | BookAsset | Request | `POST /admin/api/book/{id}/asset` | **[1]** | Supported by base OpenAPI. |

---

## 11. Authentication & Session (`/login`, `UserProfile`)

| Frontend Location | Frontend Label | Frontend Property | Backend Property | Type | Req? | Null? | Validation | Entity | Req/Resp | Endpoint | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/login` Input 1 | Phone / Identifier * | `email` / `phone` | `phone` | `string` | Yes | No | Phone number or identifier | Auth | Request | `POST /api/auth/phone/signin` | **[1]** | Supported by base OpenAPI. |
| `/login` Input 2 | PIN * | `pin` | `pin` | `string` | Yes | No | 6-digit numeric PIN | Auth | Request | `POST /api/auth/phone/signin` | **[1]** | Supported by base OpenAPI. |
| `/login` Response | Access Token | `access_token` | `access_token` | `string` | Yes | No | JWT Bearer token | Auth | Response | `POST /api/auth/phone/signin` | **[1]** | Supported by base OpenAPI. |
| Global Shell | Admin Name | `user.name` | `name` | `string` | Yes | No | Max 128 | Profile | Response | `GET /api/profile` | **[1]** | Supported in base OpenAPI profile. |
| Global Shell | Role | `user.role` | `role` | `string` | No | Yes | e.g. "Content Manager" | Profile | Response | `GET /api/profile` | **[7]** | Backend/PM confirmation required: whether roles are strictly RBAC or informational. |
| Global Shell | Sign out | Action | — | — | — | — | — | Auth | Client | `authService.signout()` | **[5]** | Client session cleanup. |
