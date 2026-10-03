# TEWBA Admin Web Application - Backend Gaps & Contract Discrepancies

This document records all functional requirements established in the approved Figma design and PM specifications that currently lack complete or matching endpoints in the provided backend OpenAPI contract (`references/openapi.yaml`).

---

## 1. Summary of Discrepancies

| Area | Approved Design / PM Requirement | Current Backend OpenAPI Support | Frontend Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Publishers** | Manage catalog publishers (`/publishers`), add/edit form, search, monogram avatar, ID, actions. | **None**. No admin publisher endpoints exist. | Full UI implemented with local validation and loading/empty/error states. Isolated in `publishersApi` service returning typed `API_UNAVAILABLE` error until endpoints are ready. |
| **Advertisements** | Manage mobile app promotional banners (`/advertisements`), display order, drag-and-drop reordering, banner image upload, active/disabled status. | **None**. No admin advertisement endpoints exist. | Full UI implemented with `@dnd-kit` sortable reordering and accessible controls. Isolated in `advertisementsApi`. |
| **Reports & Analytics** | Executive dashboard and Reports page (`/reports`), date filters (Today, 7D, 30D, custom), KPI cards (Books Sold, Total Income, Audiobook count), daily sales chart, top 5 most-sold books, top 5 most-sold audiobooks, and transactions table. | **None**. No analytics, reporting, or transaction endpoints exist. | Full UI implemented with Recharts, metrics cards, ranking tables, and transactions table. Isolated in `reportsApi`. |
| **Book Registration Fields** | UI captures: title, author, publisher, page count, tags, primary category, subcategory, description, master language (book & audio), cover image, book file, audiobook option, narrator, audio master file. | `POST /admin/api/book` only accepts `{ name, description, author_id, thumbnail_id }`. No fields for `publisher_id`, `page_count`, `category_id`, `subcategory_id`, `language`, or `narrator`. | Form captures all required fields with Zod validation. Integration layer sends supported backend fields to `POST /admin/api/book`, associates tags via `POST /admin/api/book/{book_id}/tag`, associates assets via `POST /admin/api/book/{book_id}/asset`, and isolates unsupported metadata. |
| **Tag Discovery** | UI requires selecting and creating tags for a book. | Only `POST /admin/api/book/{book_id}/tag` exists. No `GET /admin/api/tag` or `GET /api/tag` exists to list existing tags. | Tag selector supports custom tag input and isolates tag fetching behind `tagsApi.list()`. |
| **Upload File ID Handoff** | Multipart upload completes with `POST /admin/api/upload/complete`. Book creation and asset attachment require a `file_id` (UUID) or `thumbnail_id` (UUID). | `CompleteBookUploadRequestBody` takes `session_id` and `parts`, but the OpenAPI does not document the response schema or how `file_id` is returned. | The upload orchestrator executes `init -> get-part -> browser PUT -> complete` and isolates the final `file_id` extraction in `completeUploadAndResolveFileId()`. |
| **Author Model Naming** | Author display name in `GET /admin/api/author` is returned as a property named `string` inside `{ id: string, string: string }`. | Response schema defines property `string`. | Domain adapter maps `item.string` to `displayName` / `name` at the API boundary so this anomaly does not leak into components. |
| **Author PM Corrections** | Remove `Primary Genre`, Remove `Joined Date`, Add `Nationality`. | OpenAPI `CreateAuthorRequestBody` only accepts `name`. | Author UI includes Full Name and Nationality (no Primary Genre or Joined Date). UI accommodates Nationality in form and table; API layer sends `name` and isolates `nationality` until backend adds field. |

---

## 2. Upload Pipeline & Integration Handoff

The backend upload flow is implemented as follows:
1. **Initialize Session**:
   - `POST /admin/api/upload/init`
   - Payload: `{ content_type, expected_parts, session_id? }`
   - Response: `{ key, session_id, upload_id }`
2. **Acquire Part Presigned URLs**:
   - `POST /admin/api/upload/get-part`
   - Payload: `{ key, upload_id, part_number }`
   - Response: `{ url }`
3. **Direct Browser Upload**:
   - Browser sends slice to pre-signed S3/storage URL via `PUT` with progress tracking.
   - Extracts `ETag` from the response header.
4. **Complete Session**:
   - `POST /admin/api/upload/complete`
   - Payload: `{ session_id, parts: [{ part_number, etag }] }`
5. **Handoff (Pending Backend Clarification)**:
   - Function: `resolveFileIdFromUpload(completeResult, uploadSession)`
   - Location: `src/lib/upload/multipart-upload.ts`
   - Once backend returns `{ file_id }` or session_id maps directly to file_id, this single function resolves the UUID for `POST /admin/api/book/{id}/asset`.

---

## 3. Future Roadmap Items

- **AI Audiobook Generation**:
  - The book registration UI includes a conditional selector between "Has Audiobook" and "Generated Using AI".
  - As confirmed by PM requirements, AI audio generation is a future feature. The radio/toggle option is present in the UI and clearly indicates "AI generation coming soon" without executing any background jobs.
