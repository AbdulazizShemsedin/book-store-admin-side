# TEWBA Admin Web Application - Architecture Documentation

## 1. Architectural Philosophy

The TEWBA Book Store Admin Web Application is engineered using a **Feature-First + Layered Architecture**. The goal of this architecture is to provide:
1. **Predictability**: Code is organized around business features rather than technical layers alone.
2. **Locality of Reasoning**: A developer modifying Books or Authors finds schemas, hooks, API callers, and components in the same place.
3. **Strict Dependency Direction**: UI components never call raw HTTP endpoints or construct headers. All data access flows through typed feature hooks, which call typed feature API clients, which use a centralized HTTP client.
4. **Learning-Friendly Simplicity**: No bloated enterprise abstractions (no empty repositories wrapping fetch, no unnecessary Redux stores, no premature micro-frontends).

---

## 2. Directory Structure

```
src/
├── app/                      # Next.js App Router (pages and layouts)
│   ├── layout.tsx            # Root layout (fonts, providers, metadata, MSW bootstrap)
│   ├── page.tsx              # Root entry (redirects to dashboard or login)
│   ├── login/                # Sign-in page
│   ├── dashboard/            # Overview / Dashboard
│   ├── books/                # Books Catalog & Details
│   │   ├── page.tsx          # Books Catalog table
│   │   ├── new/page.tsx      # Register New Book form
│   │   └── [id]/page.tsx     # Book Details & Asset Management
│   ├── authors/              # Authors Directory & Add/Edit Author
│   ├── publishers/           # Publishers Catalog & Management
│   ├── categories/           # Categories & Subcategories Hierarchy
│   ├── advertisements/       # Promotional Banners & Drag/Drop Reordering
│   └── reports/              # Sales, Analytics, Finance & Transactions
│
├── features/                 # Feature-First Business Modules
│   ├── auth/                 # Login form, auth hooks, session management
│   ├── books/                # Book catalog, book registration, book details
│   ├── authors/              # Author directory, author creation, nationality
│   ├── publishers/           # Publisher management, monogram badges
│   ├── categories/           # Category taxonomy, subcategory tree
│   ├── advertisements/       # Ad management, sortable reordering (dnd-kit)
│   └── reports/              # Summary KPI cards, Recharts trends, transactions
│
├── components/               # Shared & Reusable UI Elements
│   ├── ui/                   # Design system primitives (Button, Input, Card, Modal, etc.)
│   ├── layout/               # AdminShell, Sidebar, Header, Breadcrumbs
│   ├── tables/               # DataTable, ServerPagination, TableSkeleton
│   ├── forms/                # FormField, SelectField, TextareaField, Toggle
│   └── uploads/              # FileUploadDropzone, ImageUploadZone
│
├── lib/                      # Core Utilities & Infrastructure
│   ├── api/                  # Centralized HTTP client, error normalizer
│   ├── auth/                 # Token storage, auth session abstraction
│   ├── upload/               # Multipart direct browser upload orchestrator
│   ├── query/                # TanStack Query client & cache configuration
│   └── utils/                # Styling helpers (cn), formatters
│
├── mocks/                    # Development-Only MSW Mock Layer
│   ├── browser.ts            # Browser setupWorker
│   ├── handlers.ts           # OpenAPI-compliant MSW handlers
│   ├── store.ts              # In-memory stateful store with pagination & search
│   └── data/                 # Realistic seed data (authors, books, categories, tags)
│
├── providers/                # React Context Providers (QueryProvider, AuthProvider, MswProvider)
└── types/                    # Domain models, OpenAPI DTOs, common API response types
```

---

## 3. Dependency Direction

All application data flow follows a strict unidirectional path:

```
[Page / Component (UI Layer)]
       ↓
[Feature Hook (e.g. useBooks, useCreateBook)]
       ↓
[Feature API Module (e.g. booksApi.list, booksApi.create)]
       ↓
[Central HTTP Client (apiClient in src/lib/api/client.ts)]
       ↓
[MSW Interceptor (Development) OR Real Backend (Production/Staging)]
```

### Why this boundary matters:
- The UI layer does not know how `Authorization` bearer tokens are attached, how query strings are encoded, or whether a network call is serviced by MSW or the live backend.
- If an API URL changes or an endpoint field is updated, only the feature API module or domain adapter needs modification.
- Components remain completely decoupled from mocking logic: no mock arrays, fake CRUD, or `if (mock)` branches inside components.

---

## 4. State Management Model

We apply the simplest suitable state mechanism for each need:

1. **Server State (`@tanstack/react-query`)**:
   - Manages all remote asynchronous data (authors, books, categories, reports).
   - Handles automatic caching, background revalidation, pagination query keys, deduplication, and mutation rollback.
   - Eliminates redundant network requests when switching tabs or navigating between pages.

2. **Form State (`react-hook-form` + `zod`)**:
   - Manages form inputs, field-level validation, dirty states, and submission handling without triggering re-renders of the entire page on every keystroke.

3. **URL State (Next.js `useSearchParams` & `useRouter`)**:
   - Manages shareable, bookmarkable UI state such as pagination (`?page=2`), search keywords (`?search=foo`), and active filter tabs.

4. **Local UI State (`useState` / `useReducer`)**:
   - Manages ephemeral interactions like modal visibility, dropdown open/close states, and drag-and-drop order reordering before save.

---

## 5. Development Mock Layer (MSW)

To allow full frontend testing before real backend deployment without inventing fictional contracts:
- **Mock Service Worker (MSW 2)** intercepts network traffic at the browser service worker level (`public/mockServiceWorker.js`).
- The mock layer strictly implements the request/response shapes defined in `references/openapi.yaml`. For instance:
  - `GET /admin/api/author` returns `{ authors: [{ id, string }], total, page, page_size }`
  - `GET /admin/api/book` returns `{ books: [{ id, name, author, status, created_at, updated_at }], total, page, page_size }`
  - `POST /admin/api/upload/...` simulates the init, chunk URL, direct S3 PUT, and complete lifecycle.
- **Single Switch**: Controlled via `NEXT_PUBLIC_USE_MOCK_API` in `.env.local`:
  - `NEXT_PUBLIC_USE_MOCK_API=true`: Starts MSW worker in development.
  - `NEXT_PUBLIC_USE_MOCK_API=false`: Completely bypasses MSW and speaks to `NEXT_PUBLIC_API_BASE_URL`.
- **Production Guard**: In production builds (`process.env.NODE_ENV === 'production'`), MSW is statically excluded and never initialized, guaranteeing zero mock leakage.

---

## 6. Authentication & Route Protection

- **Auth Service (`src/lib/auth/auth-service.ts`)**:
  - Handles login authentication tokens, session validation, and logout.
  - Supports Bearer token authentication compatible with OpenAPI `POST /api/auth/phone/signin` and admin credentials.
- **Auth Provider (`src/providers/auth-provider.tsx`)**:
  - Exposes `useAuth()` providing `user`, `isAuthenticated`, `isLoading`, `login()`, and `logout()`.
- **Protected Layout (`src/components/layout/admin-shell.tsx`)**:
  - Verifies authentication status. Unauthenticated requests to admin routes are redirected to `/login` with return URL preservation.

---

## 7. Multipart File Upload Architecture

Large book files (EPUB/PDF) and audiobooks (MP3/M4B) are uploaded directly from the browser to pre-signed cloud storage URLs using the backend contract:
1. `POST /admin/api/upload/init` -> Allocates upload session and receives S3 upload ID and key.
2. `POST /admin/api/upload/get-part` -> Retrieves signed PUT URL for each chunk.
3. Direct `PUT` requests from browser with progress events.
4. `POST /admin/api/upload/complete` -> Commits multipart parts to backend.
5. `resolveFileIdFromUpload()` handoff -> Associates uploaded asset with book.
