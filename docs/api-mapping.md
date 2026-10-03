# TEWBA Admin Web Application - API Mapping Specification

This document maps every frontend feature to its corresponding backend API endpoint, request body, response format, data transformation, and integration status.

---

## 1. Feature to API Endpoint Mapping Table

| Frontend Feature | HTTP Method & Path | Operation ID | Request Payload / Params | Response Structure | Data Transformation / Normalization | Integration Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Sign In** | `POST /api/auth/phone/signin` | `signin` | `{ phone: string, pin: string }` | `{ access_token, token_type, refresh_token }` | Stores access token in auth manager; sets default bearer header. | **Integrated** |
| **List Authors** | `GET /admin/api/author` | `list-authors` | Query: `page`, `page_size` | `{ authors: [{ id, string }], total, page, page_size }` | Maps `item.string` to `item.name` / `item.displayName`. | **Integrated** |
| **Create Author** | `POST /admin/api/author` | `create-author` | `{ name: string }` | `{ id: string }` | Form validates `name` and PM-required `nationality`. `name` is sent to API; `nationality` is stored locally until backend expands. | **Integrated** |
| **List Books** | `GET /admin/api/book` | `list-book` | Query: `page`, `page_size` | `{ books: [{ id, name, author, status, created_at, updated_at }], total, page, page_size }` | Formats ISO timestamps to `DD MMM YYYY`; calculates format badge (Audiobook vs Text). | **Integrated** |
| **Create Book** | `POST /admin/api/book` | `create-book` | `{ name: string, description?: string, author_id?: string, thumbnail_id?: string }` | `{ id: string }` | Submits core metadata, then chains asset attachments and tag bindings. | **Integrated** |
| **Add Book Asset** | `POST /admin/api/book/{book_id}/asset` | `add-book-asset` | `{ asset_type: 'book' \| 'audio', file_id: string }` | `200 OK` | Binds uploaded EPUB or MP3 file to created book. | **Integrated** |
| **Add Book Tag** | `POST /admin/api/book/{book_id}/tag` | `add-book-tag` | `{ tag_id: string }` | `200 OK` | Associates registered tag UUID with book. | **Integrated** |
| **List Categories** | `POST /api/category` | `list-category` | Body: `{ page: number, page_size: number, parent_id?: string }` | `{ categories: [{ id, name, parent_id }], total, page, page_size }` | Organizes flat categories into parent-child hierarchy for subcategories. | **Integrated** |
| **Create Category** | `POST /admin/api/category` | `create-category` | `{ name: string, parent_id?: string }` | `{ id: string }` | Supports root categories (`parent_id = null`) and subcategories (`parent_id = UUID`). | **Integrated** |
| **Init Upload** | `POST /admin/api/upload/init` | `init-book-upload` | `{ content_type: string, expected_parts: number, session_id?: string }` | `{ key: string, upload_id: string, session_id: string }` | Checks file MIME type; computes 5MB parts count. | **Integrated** |
| **Get Upload Part URL** | `POST /admin/api/upload/get-part` | `get-part-url` | `{ key: string, upload_id: string, part_number: number }` | `{ url: string }` | Obtains pre-signed S3 URL for browser direct PUT. | **Integrated** |
| **Complete Upload** | `POST /admin/api/upload/complete` | `complete-book-upload` | `{ session_id: string, parts: [{ part_number, etag }] }` | `200 OK` | Passes completed parts array with ETags to backend. | **Integrated** |
| **Publishers** | `GET/POST /admin/api/publisher` | *N/A* | *N/A* | *N/A* | Isolated in `publishersApi`. Returns graceful unavailable response without breaking the UI. | **Backend Blocked** (Docs: `docs/backend-gaps.md`) |
| **Advertisements** | `GET/POST /admin/api/advertisement` | *N/A* | *N/A* | *N/A* | Isolated in `advertisementsApi`. Sortable drag-and-drop state managed in UI. | **Backend Blocked** (Docs: `docs/backend-gaps.md`) |
| **Reports & Sales** | `GET /admin/api/reports/...` | *N/A* | *N/A* | *N/A* | Isolated in `reportsApi`. Rendered with design-accurate analytics and transaction table. | **Backend Blocked** (Docs: `docs/backend-gaps.md`) |

---

## 2. Central API Client Normalization

All HTTP responses pass through `apiClient` in `src/lib/api/client.ts`. When the backend returns an HTTP status >= 400 with an `ErrorModel` JSON:
```json
{
  "type": "https://example.com/errors/validation",
  "title": "Bad Request",
  "status": 400,
  "detail": "Property name is required",
  "instance": "/admin/api/author",
  "errors": [
    {
      "location": "body.name",
      "message": "String should have at least 1 characters",
      "value": ""
    }
  ]
}
```
The normalizer translates this into a strongly typed `ApiError` class with:
- `statusCode`: 400
- `title`: "Bad Request"
- `detail`: "Property name is required"
- `fieldErrors`: `{ "name": "String should have at least 1 characters" }`
which automatically maps back into React Hook Form field errors.
