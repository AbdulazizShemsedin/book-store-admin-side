# TEWBA Bookstore Admin — Backend Integration Blockers & Missing Capabilities

> **Document Status**: Active Implementation Reference  
> **Source Contract**: `references/openapi.yaml` (OpenAPI 3.1.0, TEWBA Bookstore API v1.0.0)  
> **Branch**: `feature/admin-api-integration`  
> **Last Updated**: 2026-10-12  

---

## 1. Overview & Classification Summary

This document captures all backend contract gaps, missing endpoints, schema mismatches, and business ambiguities identified during the integration of the TEWBA Bookstore Admin frontend.

Each item explicitly outlines the expected frontend behavior, the current contract limitation, user-facing impact, whether it blocks the immediate book-management workflow, and actionable acceptance criteria for the backend lead.

### Status Taxonomy
- **Implemented and tested**: Integrated against verified contract with automated verification.
- **Implemented, awaiting live API verification**: Endpoint, types, and error handling complete; requires active live server for runtime validation.
- **Partially implemented**: Supported operations wired to real contract; missing companion operations documented below.
- **Blocked by missing backend capability**: Feature cannot be persisted to server due to absent backend endpoints or schema fields.
- **Not required in the current admin scope**: Feature belongs to consumer mobile/client app or infrastructure probes.
- **Future feature**: Planned roadmap item with clear separation boundaries (e.g., AI voice generation).

---

## 2. Inventory of Integration Blockers & Contract Gaps

### BLOCKER-01: Advertisements Management & Reordering Endpoints Absent
- **Status**: Blocked by missing backend capability
- **Priority**: Later feature (Non-blocking for immediate book-management workflow)
- **Expected Frontend Behavior**:
  - The Admin can view the list of promotional carousel banners configured for the mobile home feed.
  - The Admin can register a new advertisement banner with title/message, promotional image URL, and active/disabled status.
  - The Admin can reorder banners via drag-and-drop, and the order sequence is atomically persisted to the backend.
  - The Admin can toggle banner status or delete a banner.
- **Relevant Existing Endpoint**: None in `references/openapi.yaml`.
- **Exact Missing Endpoints**:
  - `GET /admin/api/advertisement`: Return array of banner objects with `{ id, message, image_url, order, status, created_at }`.
  - `POST /admin/api/advertisement`: Create banner `{ message, image_url, order, status }`.
  - `PUT /admin/api/advertisement/reorder`: Batch reordering accepting `{ ordered_ids: string[] }`.
  - `PATCH /admin/api/advertisement/{id}/status`: Toggle active status.
  - `DELETE /admin/api/advertisement/{id}`: Delete banner.
- **Current Frontend Behavior**:
  - The full UI (table, drag-and-drop sortable list, add dialog, image preview, status switch) is implemented following approved Figma designs.
  - An informational notice indicates that persistent backend storage is pending backend deployment.
- **Question for Backend Lead**:
  - When will the advertisement management service be added to the OpenAPI contract?
  - Will image banners be uploaded through the multipart upload pipeline or referenced by pre-hosted URLs?
- **Acceptance Criterion**:
  - Backend exposes `/admin/api/advertisement` endpoints adhering to `docs/backend-api-delta.yaml` Section 3.2, enabling persistent banner creation and reordering.

---

### BLOCKER-02: Executive Sales, Financial & Transaction Reports Endpoints Absent
- **Status**: Blocked by missing backend capability
- **Priority**: Later feature (Non-blocking for immediate book-management workflow)
- **Expected Frontend Behavior**:
  - The Dashboard and `/reports` screen display aggregated financial metrics: Total Books Sold, Gross Sales Income, Audiobook Share %, and growth metrics.
  - The interactive daily sales trend chart plots date-wise sales and revenue.
  - Top 5 books and top 5 audiobooks tables display circulation metrics.
  - Paginated transaction records table displays historical orders with book title, category, author, formats, units sold, and date.
- **Relevant Existing Endpoint**: None in `references/openapi.yaml`.
- **Exact Missing Endpoints**:
  - `GET /admin/api/reports?period={today|7d|30d|custom}&start_date=...&end_date=...`
  - `GET /admin/api/reports/transactions?page={page}&page_size={pageSize}&search={query}`
- **Current Frontend Behavior**:
  - The dashboard layout, KPIs, Recharts trend graph, top books ranking cards, and transactions table are fully styled and functional.
  - The page displays an explicit status notification stating that live analytics aggregation microservices are pending backend deployment.
- **Question for Backend Lead**:
  - Are sales numbers calculated from payment provider webhooks (e.g. Chapa transactions) or directly aggregated from user purchase records?
  - Does `total_income` represent gross revenue or net settlement after publisher royalties?
- **Acceptance Criterion**:
  - Backend exposes `GET /admin/api/reports` and `GET /admin/api/reports/transactions` matching the schemas in `docs/BACKEND_HANDOFF.md` Section 6.3.

---

### BLOCKER-03: Book Update and Deletion (PUT/DELETE `/admin/api/book/{id}`) Absent
- **Status**: Blocked by missing backend capability
- **Priority**: Hard limitation for catalog management lifecycle
- **Expected Frontend Behavior**:
  - On the book detail view (`/books/[id]`), the admin should be able to update title, description, language, status, and prices.
  - The admin should be able to archive or delete a book record.
- **Relevant Existing Endpoint**:
  - `GET /admin/api/book`: List books.
  - `POST /admin/api/book`: Create book.
  - `GET /api/book/{book_id}`: Read single book.
- **Exact Missing Endpoints**:
  - `PUT /admin/api/book/{id}` (or `PATCH /admin/api/book/{id}`): Update book metadata.
  - `DELETE /admin/api/book/{id}`: Delete or archive book.
- **Current Frontend Behavior**:
  - `/books/[id]` displays full metadata and assets retrieved via real endpoints.
  - Edit and Delete action controls inform the administrator that update and delete capabilities are not yet supported by the backend API contract.
- **Question for Backend Lead**:
  - Is book deletion intended to be a hard cascade delete or a soft archive (`status: 'Archived'`)?
  - Can the backend add `PUT /admin/api/book/{book_id}` accepting the same fields as `CreateBookRequestBody`?
- **Acceptance Criterion**:
  - Backend provides `PUT /admin/api/book/{book_id}` and `DELETE /admin/api/book/{book_id}` in OpenAPI.

---

### BLOCKER-04: Author Update and Deletion (PUT/DELETE `/admin/api/author/{id}`) Absent
- **Status**: Blocked by missing backend capability
- **Priority**: Maintenance feature (Non-blocking for book creation)
- **Expected Frontend Behavior**:
  - Admin can update an existing author's bio, nationality, or profile photo.
  - Admin can remove an author who has no published books.
- **Relevant Existing Endpoint**:
  - `GET /admin/api/author`: List authors.
  - `POST /admin/api/author`: Create author.
  - `POST /admin/api/author/{author_id}/avatar`: Upload author avatar.
- **Exact Missing Endpoints**:
  - `GET /admin/api/author/{id}`: Retrieve author profile.
  - `PUT /admin/api/author/{id}`: Update author details.
  - `DELETE /admin/api/author/{id}`: Remove author.
- **Current Frontend Behavior**:
  - Author listing, author registration (with nationality), and author avatar upload are fully integrated against real endpoints.
  - In author table row actions, update/delete buttons inform the administrator that author modification endpoints are pending backend implementation.
- **Question for Backend Lead**:
  - Can `PUT /admin/api/author/{id}` and `DELETE /admin/api/author/{id}` be exposed in the next API release?
- **Acceptance Criterion**:
  - Backend exposes `PUT /admin/api/author/{id}` and `DELETE /admin/api/author/{id}`.

---

### BLOCKER-05: Category Update and Deletion (PUT/DELETE `/admin/api/category/{id}`) Absent
- **Status**: Blocked by missing backend capability
- **Priority**: Taxonomy management (Non-blocking for book categorization)
- **Expected Frontend Behavior**:
  - Admin can rename a category or subcategory.
  - Admin can delete a category node (cascading to children).
- **Relevant Existing Endpoint**:
  - `GET /admin/api/category`: List categories.
  - `POST /admin/api/category`: Create category (`name`, `parent_id`).
  - `POST /admin/api/book/{book_id}/tag`: Bind category to book.
- **Exact Missing Endpoints**:
  - `PUT /admin/api/category/{id}`: Rename category.
  - `DELETE /admin/api/category/{id}`: Delete category.
- **Current Frontend Behavior**:
  - Nested category tree rendering up to 5 levels, category creation via `POST /admin/api/category`, and book-category assignments via `POST /admin/api/book/{book_id}/tag` are fully integrated with real APIs.
  - Rename and delete buttons trigger explicit validation notifications explaining that backend deletion endpoints are not yet in the contract.
- **Question for Backend Lead**:
  - When deleting a category with subcategories or tagged books, will the backend cascade delete or restrict deletion?
- **Acceptance Criterion**:
  - Backend exposes `PUT /admin/api/category/{id}` and `DELETE /admin/api/category/{id}`.

---

### BLOCKER-06: Category Color Not Persisted in Backend Schema
- **Status**: Partially implemented (Client-side visual rendering)
- **Priority**: UI enhancement (Non-blocking)
- **Expected Frontend Behavior**:
  - Categories display with distinct color badges/chips in the category manager and book selectors.
- **Relevant Existing Endpoint**:
  - `POST /admin/api/category`: Only accepts `{ name: string, parent_id?: uuid }` with `additionalProperties: false`.
- **Exact Missing Field**:
  - `color` property on `CreateCategoryRequestBody` and `ListCategoryAdminResponseItem`.
- **Current Frontend Behavior**:
  - Category creation strictly sends only documented `{ name, parent_id }` to avoid 422 Unprocessable Entity.
  - The UI generates stable deterministic colors based on category names so badges render consistently without claiming false persistence.
- **Question for Backend Lead**:
  - Can a `color` field (hex string `#RRGGBB`) be added to the category schema?
- **Acceptance Criterion**:
  - Backend stores and returns `color` on categories.

---

### BLOCKER-07: AI Voice Synthesis Pipeline is a Future Roadmap Feature
- **Status**: Future feature
- **Priority**: Explicitly deferred by PM
- **Expected Frontend Behavior**:
  - Book registration UI shows radio option "Generate Using AI (Future)".
  - When selected, automated speech synthesis is reserved without triggering file uploads.
- **Contract Reality**:
  - Backend has no AI audio conversion queue or microservice.
- **Current Frontend Behavior**:
  - The radio option is clearly labeled "(Future)" and disabled from submitting mock jobs.
  - No fake conversion simulations or false progress bars are shown.
- **Acceptance Criterion**:
  - Backend deploys audio conversion worker and publishes asynchronous task endpoints in future phase.

---

## 3. Summary of Operational Readiness

| Domain Workflow | Backend API Contract Status | Frontend Integration Status | Operational Readiness |
|---|---|---|---|
| **Admin Authentication** | Complete (`/admin/api/signin`) | Integrated with token storage & redirects | **100% Operational** |
| **Author Directory** | Complete (`/admin/api/author`, `/admin/api/author/{id}/avatar`) | Integrated (Listing, Creation, Avatar upload) | **100% Operational** |
| **Publisher Management** | Complete (`/admin/api/publisher`) | Integrated (Listing, Creation, Book selector) | **100% Operational** |
| **Category Taxonomy** | Complete (`/admin/api/category`, `/api/category`) | Integrated (5-level tree, creation, book tags) | **100% Operational** |
| **Book Creation & Assets** | Complete (`/admin/api/book`, thumbnail & asset endpoints) | Integrated (Metadata, chunked upload, tag bind) | **100% Operational** |
| **Book Listing & Details** | Complete (`/admin/api/book`, `/api/book/{id}`) | Integrated with real tables & pagination | **100% Operational** |
| **Advertisements** | Missing from contract | UI complete, pending backend endpoint | **Blocked on Backend** |
| **Reports & Analytics** | Missing from contract | UI complete, pending backend endpoint | **Blocked on Backend** |
| **Book/Author/Category Updates** | Missing PUT/DELETE endpoints | UI handles limitation explicitly | **Blocked on Backend** |
