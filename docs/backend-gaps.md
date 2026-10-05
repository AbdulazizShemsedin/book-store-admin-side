# TEWBA Admin Web Application - Backend Gaps & Contract Discrepancies

Source of Truth: `references/openapi.yaml` vs Approved Figma Design & PM Specifications.

This document records all functional requirements established in the approved Figma design and PM specifications that currently lack complete or matching endpoints in the provided backend OpenAPI contract.

---

## 1. Summary of Discrepancies & Isolation Strategy

| Area / Feature | Approved Design & PM Requirement | Current Backend OpenAPI Support | Frontend Isolation Strategy & Notes |
| :--- | :--- | :--- | :--- |
| **Publishers** | Full publisher directory (`/publishers`), add/edit modal, search, monogram avatar, ID, books count, and status. | **None**. No `/admin/api/publisher` endpoints exist in OpenAPI. | Fully implemented in UI. All network attempts are isolated in `publishersApi`, returning typed error states. No invented endpoints or fictitious schemas are sent over the wire. |
| **Advertisements** | Mobile promotional banner management (`/advertisements`), active/inactive toggle, banner image preview, and drag-and-drop reordering. | **None**. No `/admin/api/advertisement` endpoints exist in OpenAPI. | Implemented with `@dnd-kit` for visual reordering with accessible keyboard controls (Move Up / Move Down buttons). Ordering state is managed in local component state. |
| **Reports, Sold Books & Finance** | Executive dashboard metrics and dedicated Reports page (`/reports`), date range selectors (Today, 7D, 30D, Custom), KPI summaries (Books Sold, Total Income, Audiobooks Sold), sales trend charts, top 5 sold books/audiobooks, and financial transactions table. | **None**. No analytics, reporting, or financial transaction endpoints exist in OpenAPI. | Rich visual charts implemented using Recharts, metric cards, and transaction records. Isolated in `reportsApi`. |
| **Book Registration Extended Fields** | Book registration form (`/books/new`) captures: Publisher, Page Count, Primary Category, Subcategory, Master Language (text & audio), Narrator, and Audiobook condition. | `POST /admin/api/book` only accepts `{ name, description, author_id, thumbnail_id }`. It lacks `publisher_id`, `page_count`, `category_id`, `subcategory_id`, `language`, and `narrator`. | Form captures all PM-required fields with Zod validation. The API adapter passes supported fields (`name`, `description`, `author_id`, `thumbnail_id`) to the backend, binds assets via `/asset`, binds tags via `/tag`, and safely isolates the remaining fields. |
| **Tag Catalog Discovery** | Admin UI provides a tag selector with pre-existing tags and allows adding new tags with custom color badges. | OpenAPI only defines `POST /admin/api/book/{book_id}/tag` (associating a `tag_id` with a book). No endpoint exists to query available tags (`GET /admin/api/tag`). | UI manages tag taxonomy cleanly via `tagsApi`, providing standard literary tags while keeping tag associations bound through the actual `/tag` endpoint. |
| **Upload File ID Handoff** | Multipart upload completes with `POST /admin/api/upload/complete`. Creating a book asset requires a `file_id` (UUID). | `CompleteBookUploadRequestBody` takes `session_id` and `parts`, but the OpenAPI does not document the response schema or how `file_id` is returned upon completion. | The upload orchestrator executes `init -> get-part -> browser PUT -> complete` and isolates the final `file_id` resolution in `completeUploadAndResolveFileId()`. |
| **Author Model Naming** | Author display name in `GET /admin/api/author` is returned as a property named `string` inside `{ id: string, string: string }`. | OpenAPI defines `ListAuthorItem` with property `string`. | Domain adapter in `authorsApi` maps `item.string` to `displayName` / `name` at the API boundary, preventing awkward backend naming from polluting components. |
| **Author PM Corrections** | PM specified: Remove Primary Genre, Remove Joined Date, Add Nationality. | OpenAPI `CreateAuthorRequestBody` only accepts `name`. | Author UI includes Full Name and Nationality (no Primary Genre or Joined Date). Form validates Nationality; API layer sends `name` and isolates `nationality` in domain state until backend adds the field. |
| **AI Audiobook Generation** | UI radio selection for Audiobook status: "Has Audiobook", "Generated Using AI", and "None". | **None**. No AI audio generation endpoints or background worker tasks exist. | Visual UI state only. Selecting "Generated Using AI" displays a badge indicating "AI generation coming in future update", without simulating fake production audio synthesis. |

---

## 2. Multipart Upload Handoff Contract Gap

The OpenAPI document specifies:
1. `POST /admin/api/upload/init` -> Returns `{ key, upload_id, session_id }`
2. `POST /admin/api/upload/get-part` -> Returns `{ url }`
3. Direct `PUT` to `url` with chunk -> Returns `ETag`
4. `POST /admin/api/upload/complete` -> Takes `{ session_id, parts: [{ part_number, etag }] }`

**Contract Gap**: The specification does not define the response payload of `/complete`. In AWS S3/GCS multipart uploads, completion returns the finalized object URI or key, but the subsequent `/admin/api/book/{book_id}/asset` endpoint expects a `file_id` (`format: uuid`).

**Isolation Solution**:
In `src/lib/upload/multipart-upload.ts`, the function `completeUploadAndResolveFileId` wraps this handoff. When the backend is updated to return `{ file_id: "uuid" }`, only this single adapter function needs to map the property.
