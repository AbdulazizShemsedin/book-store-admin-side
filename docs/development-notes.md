# TEWBA Admin Web Application - Development Notes & Decisions

These engineering notes document non-obvious implementation decisions to help junior engineers understand how and why specific solutions were chosen in this codebase.

---

## 1. Why Phosphor Icons instead of Lucide Icons?

The approved design calls for a distinctive, warm, and professional identity. Lucide icons are widely used in generic AI templates and have a distinct aesthetic signature. Phosphor Icons (`@phosphor-icons/react`) provide a cohesive set of weights (`regular`, `bold`, `fill`, `duotone`) with rich iconography tailored to publishing and content management (e.g., `BookOpen`, `Headphones`, `Books`, `IdentificationBadge`, `Megaphone`, `ChartBar`).

---

## 2. TanStack Query Server State Patterns

### Query Key Conventions
Query keys are structured hierarchically:
- Authors list: `['authors', { page, pageSize }]`
- Books list: `['books', { page, pageSize }]`
- Single book details: `['books', bookId]`
- Categories: `['categories', { parentId }]`

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
2. The frontend calls the backend to generate pre-signed upload URLs for each chunk.
3. The browser uses standard `fetch` with `PUT` to stream bytes directly to cloud storage (e.g., S3/GCS).
4. The frontend tracks exact byte progress and displays a percentage bar to the administrator.
5. On completion, the frontend notifies the backend to seal the multi-part upload.

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

Backend DTOs should not dictate frontend UI component naming. Examples:
- The backend author object has `{ id: string, string: string }`. If we pass this directly into table components, we would be writing `<p>{author.string}</p>`, which is confusing and brittle.
- The `authorsApi.list()` function normalizes this into `AuthorItem`:
  ```typescript
  export interface AuthorItem {
    id: string;
    name: string;
    nationality?: string;
  }
  ```
- Any future backend schema fix only requires updating the single normalizer in `authors-api.ts`.
