# TEWBA Admin Web Application - Development Notes & Decisions

These engineering notes document non-obvious implementation decisions to help engineers understand how and why specific solutions were chosen in this codebase.

---

## 1. Why Phosphor Icons instead of Lucide Icons?

The approved design calls for a distinctive, warm, and professional identity. Lucide icons are widely used in generic AI templates and have a distinct aesthetic signature. Phosphor Icons (`@phosphor-icons/react`) provide a cohesive set of weights (`regular`, `bold`, `fill`, `duotone`) with rich iconography tailored to publishing and content management (e.g., `BookOpen`, `Headphones`, `Books`, `IdentificationBadge`, `Megaphone`, `ChartBar`).

---

## 2. TanStack Query Server State Patterns

### Query Key Conventions
Query keys are structured hierarchically:
- Authors list: `['authors', { page, pageSize, search }]`
- Books list: `['books', { page, pageSize, search, category, status }]`
- Single book details: `['books', bookId]`
- Categories: `['categories', { parentId, page, pageSize }]`

### Cache Invalidation After Mutations
When creating an author, book, or category:
- We call `queryClient.invalidateQueries({ queryKey: ['authors'] })` rather than clearing the entire cache. This ensures only relevant tables update, without refetching unrelated dashboard or report data.

---

## 3. Large File Multipart Upload Pipeline

### Problem:
Uploading an EPUB (10–50MB) or complete audiobook (300MB–1GB) through the Next.js server route causes memory bottlenecks, server timeouts, and worker starvation.

### Solution:
The browser handles multipart uploads directly:
1. File is sliced into 5MB chunks (`Blob.slice()`).
2. The frontend calls the backend to generate pre-signed upload URLs for each chunk (`POST /admin/api/upload/get-part`).
3. The browser uses standard `fetch` with `PUT` to stream bytes directly to cloud storage (e.g., S3/GCS).
4. The frontend tracks exact byte progress and displays a percentage bar to the administrator.
5. On completion, the frontend calls `POST /admin/api/upload/complete` with part numbers and ETags.

---

## 4. Accessible Drag-and-Drop with `@dnd-kit`

Drag-and-drop interactions in web applications must never exclude keyboard or screen reader users:
- In **Advertisement Management**, items can be dragged to reorder.
- In addition to dragging, each advertisement row includes:
  - An **Order Number** indicator (1ST, 2ND, 3RD).
  - Explicit **Move Up** and **Move Down** accessible buttons.
  - Keyboard listeners supported natively by `@dnd-kit/core` via `KeyboardSensor` and `sortableKeyboardCoordinates`.

---

## 5. Domain Model Normalization

Backend DTOs should not dictate frontend UI component naming:
- The backend author object has `{ id: string, string: string }`. If we pass this directly into table components, we would be writing `<p>{author.string}</p>`, which is confusing and brittle.
- The `authorsApi.list()` function normalizes this into clean domain `Author`:
  ```typescript
  export interface Author {
    id: string;
    name: string;
    nationality?: string;
  }
  ```
- Any future backend schema fix only requires updating the single normalizer in `authors-api.ts`.

---

## 6. Development Mock Layer (MSW 2) & Bootstrap Lifecycle

### Network-Level Interception:
Rather than polluting React components with mock arrays or fake boolean switches, Mock Service Worker (MSW 2) operates at the browser's Service Worker level (`public/mockServiceWorker.js`). From the perspective of the application's React code and network tab, real HTTP requests are being made.

### The Single Switch:
- Enabled via `NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local`.
- When set to `false`, requests go directly to `NEXT_PUBLIC_API_BASE_URL`.
- In production (`process.env.NODE_ENV === 'production'`), MSW is strictly disabled and completely bypassed.

### Asynchronous Readiness Gate:
Because MSW's Service Worker initializes asynchronously, `src/providers/msw-provider.tsx` prevents React children from mounting until the worker is active. This eliminates initial race-condition network errors when the application first loads.

---

## 7. Server-Side Pagination Mathematics

All list endpoints (`/admin/api/author`, `/admin/api/book`, `/api/category`) follow server-side pagination:
```typescript
const page = Math.max(1, params.page || 1);
const pageSize = Math.max(1, params.pageSize || 10);
const start = (page - 1) * pageSize;
const slice = list.slice(start, start + pageSize);

return {
  items: slice,
  total: list.length,
  page,
  page_size: pageSize,
};
```
The frontend component computes:
- Total pages: `Math.max(1, Math.ceil(total / pageSize))`
- Result range: `From ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total} entries`
No artificial client-side fallback numbers (e.g. `total || 52`) are used.

---

## 8. Development Scenario Triggers

For manual and automated UI testing of edge cases, `mockStore` in `src/mocks/store.ts` supports programmatic scenario switching:
```typescript
import { mockStore } from '@/mocks/store';

// Simulate 500 Internal Server Error
mockStore.setScenario('SERVER_ERROR');

// Simulate 401 Unauthorized
mockStore.setScenario('UNAUTHORIZED');

// Simulate zero-record empty catalog
mockStore.setScenario('EMPTY_STATE');

// Reset to default happy path
mockStore.resetToDefaults();
```
This enables verifying loading states, empty states, error banners, and retry buttons without taking down real servers.
