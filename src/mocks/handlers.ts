import { http, HttpResponse } from 'msw';
import { mockStore } from './store';
import {
  CreateAuthorRequestBody,
  CreateBookRequestBody,
  AddBookAssetRequestBody,
  AddBookTagRequestBody,
  CreateCategoryRequestBody,
  InitBookUploadRequestBody,
  GetBookUploadPartURLRequestBody,
  CompleteBookUploadRequestBody,
} from '@/types/api';

/**
 * MSW 2 Network Handlers strictly following OpenAPI specifications.
 * Intercepts requests matching both localhost:8000 and relative paths.
 */
export const handlers = [
  // ==========================================
  // AUTH
  // ==========================================
  http.post('*/api/auth/phone/signin', async () => {
    return HttpResponse.json({
      access_token: 'mock_jwt_token_for_local_development_only',
      token_type: 'Bearer',
      refresh_token: null,
    });
  }),

  // ==========================================
  // AUTHORS
  // ==========================================
  http.get('*/admin/api/author', ({ request }) => {
    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json(
        { title: 'Internal Server Error', detail: 'Simulated backend database error', status: 500 },
        { status: 500 }
      );
    }
    if (scenario === 'UNAUTHORIZED') {
      return HttpResponse.json(
        { title: 'Unauthorized', detail: 'Token has expired or is invalid', status: 401 },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);
    const search = url.searchParams.get('search') || undefined;

    const data = mockStore.getAuthors({ page, pageSize, search });
    return HttpResponse.json(data);
  }),

  http.post('*/admin/api/author', async ({ request }) => {
    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json(
        { title: 'Internal Server Error', status: 500 },
        { status: 500 }
      );
    }

    let body: CreateAuthorRequestBody;
    try {
      body = (await request.json()) as CreateAuthorRequestBody;
    } catch {
      return HttpResponse.json(
        { title: 'Bad Request', detail: 'Invalid JSON payload in request body', status: 400 },
        { status: 400 }
      );
    }

    if (!body?.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.name', message: 'Name must be at least 1 character long' }],
        },
        { status: 422 }
      );
    }

    if (body.name.length > 128) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.name', message: 'Name cannot exceed 128 characters' }],
        },
        { status: 422 }
      );
    }

    const created = mockStore.createAuthor(
      body.name,
      body.bio,
      body.nationality,
      body.photo_url
    );
    return HttpResponse.json(created, { status: 201 });
  }),

  // ==========================================
  // BOOKS
  // ==========================================
  http.get('*/admin/api/book', ({ request }) => {
    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json(
        { title: 'Internal Server Error', detail: 'Catalog service failed to respond', status: 500 },
        { status: 500 }
      );
    }
    if (scenario === 'UNAUTHORIZED') {
      return HttpResponse.json(
        { title: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const data = mockStore.getBooks({ page, pageSize, search, status });
    return HttpResponse.json(data);
  }),

  http.post('*/admin/api/book', async ({ request }) => {
    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json({ title: 'Server Error', status: 500 }, { status: 500 });
    }

    let body: CreateBookRequestBody;
    try {
      body = (await request.json()) as CreateBookRequestBody;
    } catch {
      return HttpResponse.json(
        { title: 'Bad Request', detail: 'Invalid JSON payload', status: 400 },
        { status: 400 }
      );
    }

    if (!body?.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.name', message: 'Book name is required' }],
        },
        { status: 422 }
      );
    }

    const created = mockStore.createBook({
      name: body.name,
      description: body.description,
      author_id: body.author_id,
      thumbnail_id: body.thumbnail_id,
    });

    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('*/api/book/:id', ({ params }) => {
    const id = params.id as string;
    const book = mockStore.getBookById(id);

    if (!book) {
      return HttpResponse.json(
        { title: 'Not Found', detail: `Book with id ${id} not found`, status: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json(book);
  }),

  http.post('*/admin/api/book/:id/asset', async ({ params, request }) => {
    const bookId = params.id as string;
    const body = (await request.json()) as AddBookAssetRequestBody;

    if (!body?.asset_type || !['book', 'audio'].includes(body.asset_type)) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.asset_type', message: 'Asset type must be "book" or "audio"' }],
        },
        { status: 422 }
      );
    }

    if (!body.file_id) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.file_id', message: 'file_id UUID is required' }],
        },
        { status: 422 }
      );
    }

    const success = mockStore.attachAsset(bookId, body.asset_type);
    if (!success) {
      return HttpResponse.json({ title: 'Book Not Found', status: 404 }, { status: 404 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/admin/api/book/:id/tag', async ({ params, request }) => {
    const bookId = params.id as string;
    const body = (await request.json()) as AddBookTagRequestBody;

    if (!body?.tag_id) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.tag_id', message: 'tag_id UUID is required' }],
        },
        { status: 422 }
      );
    }

    const success = mockStore.attachTag(bookId, body.tag_id);
    if (!success) {
      return HttpResponse.json({ title: 'Book Not Found', status: 404 }, { status: 404 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // ==========================================
  // CATEGORIES
  // ==========================================
  http.post('*/admin/api/category', async ({ request }) => {
    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json({ title: 'Server Error', status: 500 }, { status: 500 });
    }

    let body: CreateCategoryRequestBody;
    try {
      body = (await request.json()) as CreateCategoryRequestBody;
    } catch {
      return HttpResponse.json(
        { title: 'Bad Request', detail: 'Invalid JSON payload', status: 400 },
        { status: 400 }
      );
    }

    if (!body?.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.name', message: 'Category name is required' }],
        },
        { status: 422 }
      );
    }

    const created = mockStore.createCategory(body.name, body.parent_id);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post('*/api/category', async ({ request }) => {
    const url = new URL(request.url);
    // Explicit guard: admin create route handled separately above
    if (url.pathname.startsWith('/admin')) {
      return;
    }

    const scenario = mockStore.getScenario();
    if (scenario === 'SERVER_ERROR') {
      return HttpResponse.json(
        { title: 'Internal Server Error', status: 500 },
        { status: 500 }
      );
    }

    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '50', 10);

    let parentId: string | undefined;
    try {
      const body = (await request.json()) as { parent_id?: string };
      parentId = body?.parent_id;
    } catch {
      // Empty body allowed
    }

    const data = mockStore.getCategories({ page, pageSize, parentId });
    return HttpResponse.json(data);
  }),

  http.put('*/admin/api/category/:id', async ({ params, request }) => {
    const id = params.id as string;
    try {
      const body = (await request.json()) as { name: string };
      const updated = mockStore.updateCategory(id, body.name);
      return HttpResponse.json(updated, { status: 200 });
    } catch (err) {
      return HttpResponse.json(
        { title: 'Bad Request', detail: (err as Error).message, status: 400 },
        { status: 400 }
      );
    }
  }),

  http.delete('*/admin/api/category/:id', ({ params }) => {
    const id = params.id as string;
    mockStore.deleteCategory(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/admin/api/author/:id', ({ params }) => {
    const id = params.id as string;
    mockStore.deleteAuthor(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/admin/api/book/:id', ({ params }) => {
    const id = params.id as string;
    mockStore.deleteBook(id);
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // UPLOADS
  // ==========================================
  http.post('*/admin/api/upload/init', async ({ request }) => {
    let body: InitBookUploadRequestBody;
    try {
      body = (await request.json()) as InitBookUploadRequestBody;
    } catch {
      return HttpResponse.json(
        { title: 'Bad Request', detail: 'Invalid JSON payload', status: 400 },
        { status: 400 }
      );
    }

    const allowedContentTypes = [
      'application/epub+zip',
      'audio/mpeg',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!body?.content_type || !allowedContentTypes.includes(body.content_type)) {
      return HttpResponse.json(
        {
          title: 'Unprocessable Entity',
          status: 422,
          errors: [{ location: 'body.content_type', message: 'Unsupported content_type' }],
        },
        { status: 422 }
      );
    }

    const sessionId = body.session_id || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const uploadId = `upload_${Date.now()}`;
    const key = `uploads/${sessionId}/asset`;

    return HttpResponse.json({
      key,
      session_id: sessionId,
      upload_id: uploadId,
    });
  }),

  http.post('*/admin/api/upload/get-part', async ({ request }) => {
    const body = (await request.json()) as GetBookUploadPartURLRequestBody;
    const partNumber = body?.part_number || 1;
    const key = body?.key || 'upload-asset';

    // Direct upload URL to mock chunk receiver
    const url = `/mock-upload-storage/${encodeURIComponent(key)}/${partNumber}`;
    return HttpResponse.json({ url });
  }),

  http.put('*/mock-upload-storage/:key/:part', ({ params }) => {
    const part = params.part as string;
    return new HttpResponse(null, {
      status: 200,
      headers: {
        ETag: `"mock-etag-part-${part}"`,
      },
    });
  }),

  http.post('*/admin/api/upload/complete', async ({ request }) => {
    const body = (await request.json()) as CompleteBookUploadRequestBody;
    if (!body?.session_id) {
      return HttpResponse.json(
        { title: 'Bad Request', detail: 'session_id is required', status: 400 },
        { status: 400 }
      );
    }

    return new HttpResponse(null, { status: 200 });
  }),
];
