# TEWBA Bookstore Admin — Exhaustive OpenAPI Integration Audit

> **Specification Source**: `references/openapi.yaml` (OpenAPI 3.1.0, TEWBA Bookstore API v1.0.0)
> **Total Documented Operations**: 68 operations across 54 unique paths.
> **Audit Date**: 2026-10-12
> **Feature Branch**: `feature/admin-api-integration`

## 1. Executive Summary & Classification Breakdown

Every operation in the backend specification has been audited, mapped, and classified into one of five categories according to the master implementation guidelines:

| Classification Category | Count | Scope & Purpose |
|---|---|---|
| **1. Admin integration required** | 15 | Direct admin operations required to manage bookstore catalog, authors, publishers, categories, and file uploads. |
| **2. Shared or catalog integration** | 11 | Public catalog endpoints used to view/verify content served to client/mobile apps. |
| **3. Client-app-only operation** | 39 | Mobile/end-user functionality (reading lists, personal notes, bookmarks, subscriptions, phone auth). Not applicable to bookstore administration. |
| **4. Not currently applicable** | 3 | Healthcheck probe and third-party payment gateway redirect/webhooks. |
| **5. Blocked or ambiguous** | 0 (Contract) / 4 (Missing Features) | Operations with contract gaps or features requested by PM that have no documented endpoints (e.g. Advertisements, Reports). |

## 2. Category 1: Admin Integration Required (15 Operations)

These operations are the primary core of the Bookstore Admin application.

| Method | Path | Operation ID | Summary | Auth | Request Body | Response (2xx) | Frontend Status |
|---|---|---|---|---|---|---|---|
| GET | `/admin/api/author` | list-authors | list authors | Bearer JWT | None | 200 | Implemented / Integrated |
| POST | `/admin/api/author` | create-author | create author | Bearer JWT | application/json | 201 | Implemented / Integrated |
| POST | `/admin/api/author/{author_id}/avatar` | upload-author-avatar | upload author avatar | Bearer JWT | multipart/form-data | 201 | Implemented / Integrated |
| GET | `/admin/api/book` | list-book | list books | Bearer JWT | None | 200 | Implemented / Integrated |
| POST | `/admin/api/book` | create-book | create book | Bearer JWT | application/json | 201 | Implemented / Integrated |
| POST | `/admin/api/book/{book_id}/asset` | add-book-asset | add asset to book | Bearer JWT | application/json | 200 | Implemented / Integrated |
| POST | `/admin/api/book/{book_id}/tag` | add-book-tag | add tag to book | Bearer JWT | application/json | 200 | Implemented / Integrated |
| POST | `/admin/api/book/{book_id}/thumbnail` | add-book-thumbnail | add thumbnail to book | Bearer JWT | application/json | 200 | Implemented / Integrated |
| GET | `/admin/api/category` | list-category-admin | list categories | Bearer JWT | application/json | 200 | Implemented / Integrated |
| POST | `/admin/api/category` | create-category | create category | Bearer JWT | application/json | 201 | Implemented / Integrated |
| GET | `/admin/api/publisher` | list-publisher | admin.publisher | Bearer JWT | None | 200 | Implemented / Integrated |
| POST | `/admin/api/publisher` | create-publisher | create publisher | Bearer JWT | application/json | 201 | Implemented / Integrated |
| POST | `/admin/api/signin` | admin-sign-in | admin sign in | Bearer JWT | application/json | 200 | Implemented / Integrated |
| POST | `/admin/api/upload/complete` | complete-upload | complete book upload | Bearer JWT | application/json | 200 | Implemented / Integrated |
| POST | `/admin/api/upload/get-part` | get-upload-part-url | get book upload part url | Bearer JWT | application/json | 200 | Implemented / Integrated |

### Detailed Admin Operations Analysis

### 2.1 GET `/admin/api/author` (list-authors)

- **Summary**: list authors
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.author)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: page (query), page_size (query)
- **Request Body Schema**: None
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/ListAuthorResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /authors, /authors modal
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.2 POST `/admin/api/author` (create-author)

- **Summary**: create author
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.author)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/CreateAuthorRequestBody"}
- **Expected Successful Response**: {"201":{"description":"Created","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/CreateAuthorResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /authors, /authors modal
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.3 POST `/admin/api/author/{author_id}/avatar` (upload-author-avatar)

- **Summary**: upload author avatar
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.author)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: author_id (path, required)
- **Request Body Schema**: {"properties":{"avatar":{"contentEncoding":"binary","contentMediaType":"application/octet-stream","format":"binary","type":"string"}},"type":"object"}
- **Expected Successful Response**: {"201":{"description":"Created","contentTypes":[],"schema":null},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /authors, /authors modal
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.4 GET `/admin/api/book` (list-book)

- **Summary**: list books
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.book)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: page (query), page_size (query)
- **Request Body Schema**: None
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/ListBookResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /books, /books/new, /books/[id]
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.5 POST `/admin/api/book` (create-book)

- **Summary**: create book
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.book)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/CreateBookRequestBody"}
- **Expected Successful Response**: {"201":{"description":"Created","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/CreateBookResposneBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /books, /books/new, /books/[id]
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.6 POST `/admin/api/book/{book_id}/asset` (add-book-asset)

- **Summary**: add asset to book
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.book)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: Idempotency-Key (header), book_id (path, required)
- **Request Body Schema**: {"$ref":"#/components/schemas/UploadBookAssetRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/UploadBookAssetResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /books, /books/new, /books/[id]
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.7 POST `/admin/api/book/{book_id}/tag` (add-book-tag)

- **Summary**: add tag to book
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.book)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: book_id (path, required)
- **Request Body Schema**: {"$ref":"#/components/schemas/AddBookTagRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":[],"schema":null},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /books, /books/new, /books/[id]
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.8 POST `/admin/api/book/{book_id}/thumbnail` (add-book-thumbnail)

- **Summary**: add thumbnail to book
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.book)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: Idempotency-Key (header), book_id (path, required)
- **Request Body Schema**: {"$ref":"#/components/schemas/UploadBookThumbnailRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/UploadBookThumbnailResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /books, /books/new, /books/[id]
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.9 GET `/admin/api/category` (list-category-admin)

- **Summary**: list categories
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.category)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: page (query), page_size (query)
- **Request Body Schema**: {"$ref":"#/components/schemas/ListCategoryAdminRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/ListCategoryAdminResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /categories, /books/new (category tree selector)
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Note: OpenAPI specifies a request body on this GET endpoint with parent_id. Standardized in API client to handle query/body parameters gracefully.

### 2.10 POST `/admin/api/category` (create-category)

- **Summary**: create category
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.category)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/CreateCategoryRequestBody"}
- **Expected Successful Response**: {"201":{"description":"Created","contentTypes":[],"schema":null},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /categories, /books/new (category tree selector)
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Contract only takes name and parent_id; category color is not stored in backend schema and is handled as client-side visual tag. Response returns 201 Created without body.

### 2.11 GET `/admin/api/publisher` (list-publisher)

- **Summary**: admin.publisher
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.publisher)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: page (query), page_size (query)
- **Request Body Schema**: None
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/ListPublisherResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /publishers, /books/new (publisher selector)
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.12 POST `/admin/api/publisher` (create-publisher)

- **Summary**: create publisher
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.publisher)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/CreatePublisherRequestBody"}
- **Expected Successful Response**: {"201":{"description":"Created","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/CreatePublisherResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /publishers, /books/new (publisher selector)
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.13 POST `/admin/api/signin` (admin-sign-in)

- **Summary**: admin sign in
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.auth)
- **Authentication Requirements**: Public / Anonymous
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/AdminSigninRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/AdminSigninResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: /login
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

### 2.14 POST `/admin/api/upload/complete` (complete-upload)

- **Summary**: complete book upload
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.upload)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/CompleteBookUploadRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":[],"schema":null},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: Direct multipart upload pipeline
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: OpenAPI documents 200 OK with empty body. Session identifier is tracked by client during multipart upload lifecycle.

### 2.15 POST `/admin/api/upload/get-part` (get-upload-part-url)

- **Summary**: get book upload part url
- **Intended Caller / Purpose**: Bookstore Admin Portal (admin.upload)
- **Authentication Requirements**: Bearer JWT (Admin Role)
- **Parameters**: None
- **Request Body Schema**: {"$ref":"#/components/schemas/GetBookUploadPartURLRequestBody"}
- **Expected Successful Response**: {"200":{"description":"OK","contentTypes":["application/json"],"schema":{"$ref":"#/components/schemas/GetBookUploadPartURLResponseBody"}},"default":{"description":"Error","contentTypes":["application/problem+json"],"schema":{"$ref":"#/components/schemas/ErrorModel"}}}
- **Error Response Format**: RFC 7807 `application/problem+json` (`ErrorModel` with title, status, detail, errors array)
- **Relevant Frontend Page / Workflow**: Direct multipart upload pipeline
- **Implementation Status**: Fully integrated in frontend API layer.
- **Contract Notes / Ambiguities**: Fully compatible with OpenAPI schema.

## 3. Category 2: Shared or Catalog Integration (11 Operations)

These operations are shared catalog endpoints used to verify book visibility, content metadata, and reading assets.

| Method | Path | Operation ID | Summary | Auth | Request Body | Frontend Purpose |
|---|---|---|---|---|---|---|
| GET | `/api/book` | search-book | search books | Bearer JWT | None | Catalog verification & inspection |
| GET | `/api/book/{book_id}` | get-book | get book | Bearer JWT | None | Book detail view data provider |
| GET | `/api/book/{book_id}/asset` | get-book-asset | get book asset | Bearer JWT | None | Catalog verification & inspection |
| POST | `/api/book/{book_id}/purchase` | purchase-book | purchase book | Bearer JWT | application/json | Client checkout test verification |
| GET | `/api/book/{book_id}/rating` | list-rating | list book ratings | Bearer JWT | None | Verification of public user reviews |
| POST | `/api/book/{book_id}/rating` | add-book-rating | add rating to book | Bearer JWT | application/json | Verification of public user reviews |
| GET | `/api/book/{book_id}/rating/mine` | get-rating | get book rating for logged in user | Bearer JWT | None | Verification of public user reviews |
| GET | `/api/bookmark` | list-bookmark | list bookmarks | Bearer JWT | None | Catalog verification & inspection |
| POST | `/api/bookmark` | add-bookmark | add bookmark | Bearer JWT | application/json | Catalog verification & inspection |
| DELETE | `/api/bookmark/{bookmark_id}` | delete-bookmark | delete bookmarks | Bearer JWT | None | Catalog verification & inspection |
| POST | `/api/category` | list-category | list categories | Bearer JWT | application/json | Category hierarchy discovery fallback |

## 4. Category 3: Client-App-Only Operations (39 Operations)

The following 39 operations belong strictly to the mobile end-user application. They are explicitly excluded from the admin dashboard to avoid incorrect scope expansion:

| Method | Path | Operation ID | Summary | Reason Excluded from Admin Dashboard |
|---|---|---|---|---|
| POST | `/api/auth/google` | auth-google | auth with google | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/auth/phone` | sign-up-with-phone | sign up with phone | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/auth/phone/signin` | sign-in-with-phone | sign in with phone | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/auth/reset-password` | reset-password | reset password | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/auth/reset-password/apply` | apply-reset-password | apply password reset | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/auth/two-factor/otp` | auth-verify-two-factor-otp | verify two factor otp | Consumer mobile authentication (Phone SMS / Google Sign-in / OTP) |
| POST | `/api/feedback` | send-feedback | send feedback | Mobile in-app user feedback form |
| GET | `/api/home/newly-added` | home-newly-added | newly added | Mobile homepage discovery feed |
| GET | `/api/home/popular` | home-popular | popular | Mobile homepage discovery feed |
| POST | `/api/invite` | invite-code | create invite code | End-user consumer subscription billing & family plan management |
| POST | `/api/invite/apply` | invite-code-apply | apply invite code | End-user consumer subscription billing & family plan management |
| GET | `/api/note` | list-note | list note | Personal highlights & reading notes of mobile reader |
| POST | `/api/note` | add-note | add note | Personal highlights & reading notes of mobile reader |
| DELETE | `/api/note/{note_id}` | delete-note | delete note | Personal highlights & reading notes of mobile reader |
| GET | `/api/notification` | list-notification | list notifications | End-user push notifications |
| POST | `/api/notification` | read-upto-notification | read upto notification | End-user push notifications |
| GET | `/api/notification/count` | show-notification-count | show notification count | End-user push notifications |
| POST | `/api/plans` | show-plans | show plans | End-user consumer subscription billing & family plan management |
| GET | `/api/profile` | get-profile | get profile | Mobile end-user account profile & settings |
| PATCH | `/api/profile` | update-profile | update profile | Mobile end-user account profile & settings |
| POST | `/api/profile` | delete-account | delete account | Mobile end-user account profile & settings |
| DELETE | `/api/profile/avatar` | delete-avatar | delete avatar (profile picture) | Mobile end-user account profile & settings |
| POST | `/api/profile/avatar` | upload-avatar | upload avatar (profile picture) | Mobile end-user account profile & settings |
| PATCH | `/api/profile/password` | update-password | update password | Mobile end-user account profile & settings |
| POST | `/api/progress` | create-progress | create or update progress | Reading progress synchronization between devices |
| DELETE | `/api/rating/{rating_id}` | delete-book-rating | delete book rating | Mobile app end-user feature |
| PATCH | `/api/rating/{rating_id}` | update-book-rating | update book rating | Mobile app end-user feature |
| GET | `/api/reading-list` | list-reading-list | list reading lists | Mobile user curated personal reading lists |
| POST | `/api/reading-list` | create-reading-list | create reading list | Mobile user curated personal reading lists |
| DELETE | `/api/reading-list/{reading_list_id}` | delete-reading-list | delete reading list | Mobile user curated personal reading lists |
| GET | `/api/reading-list/{reading_list_id}` | list-book-reading-list | list books in reading list | Mobile user curated personal reading lists |
| POST | `/api/reading-list/{reading_list_id}/book` | add-book-reading-list | add book to reading list | Mobile user curated personal reading lists |
| DELETE | `/api/reading-list/{reading_list_id}/{member_id}` | delete-book-reading-list | remove book from reading list | Mobile user curated personal reading lists |
| POST | `/api/subscription` | init-subscription | init subscription | End-user consumer subscription billing & family plan management |
| POST | `/api/subscription/cancel` | cancel-subscription | cancel subscription | End-user consumer subscription billing & family plan management |
| GET | `/api/subscription/member` | list-subscription-member | list subscription members | End-user consumer subscription billing & family plan management |
| DELETE | `/api/subscription/member/{member_id}` | remove-subscription-member | delete subscription member | End-user consumer subscription billing & family plan management |
| GET | `/api/subscription/member/{member_id}/progress` | list-subscription-member-progress | list subscription member progress | End-user consumer subscription billing & family plan management |
| POST | `/api/subscription/renew` | renew-subscription | renew subscription | End-user consumer subscription billing & family plan management |

## 5. Category 4: Not Currently Applicable (3 Operations)

| Method | Path | Operation ID | Purpose | Classification Reason |
|---|---|---|---|---|
| GET | `/healthcheck` | `healthcheck` | Infrastructure probe | Automated container liveness/readiness probe. Not a user UI feature. |
| GET | `/redirect/chapa` | `redirect-chapa` | Payment gateway redirect | Mobile browser redirect handler for Chapa payment gateway. |
| POST | `/webhook/chapa` | `webhook-chapa` | Payment webhook | Server-to-server webhook ingestion for Chapa payment notifications. |

## 6. Category 5: Missing Operations & Backend Blockers

The following critical admin requirements have been audited against the OpenAPI specification and confirmed to have NO corresponding backend endpoints in `references/openapi.yaml`:

1. **Advertisements Management**: No `/admin/api/advertisement` endpoints exist (listing, creation, reordering, status toggle, deletion).
2. **Reports & Sales Analytics**: No `/admin/api/reports` or `/admin/api/reports/transactions` endpoints exist.
3. **Resource Modification & Deletion**: No `PUT/DELETE /admin/api/book/{id}`, `PUT/DELETE /admin/api/author/{id}`, or `PUT/DELETE /admin/api/category/{id}` exist.
4. **Tag Discovery Catalog**: No `GET /admin/api/tag` exists (tag binding exists via `POST /admin/api/book/{book_id}/tag`, but listing tags separately does not exist).

These blockers are exhaustively detailed with reproduction steps, expected payloads, and acceptance criteria in [`docs/BACKEND_INTEGRATION_BLOCKERS.md`](./BACKEND_INTEGRATION_BLOCKERS.md).
