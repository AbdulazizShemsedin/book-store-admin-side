import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { mockStore } from './store';
import {
  ListAuthorResponseBody,
  CreateAuthorResponseBody,
  ListBookResponseBody,
  CreateBookResponseBody,
  GetBookResponseBody,
  ListCategoryResponseBody,
  InitBookUploadResponseBody,
  GetBookUploadPartURLResponseBody,
} from '@/types/api';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  mockStore.resetToDefaults();
});
afterAll(() => server.close());

describe('OpenAPI Compliance: Authors Endpoints', () => {
  it('GET /admin/api/author returns strictly matching OpenAPI structure with pagination', async () => {
    const res = await fetch('http://localhost:8000/admin/api/author?page=1&page_size=10');
    expect(res.status).toBe(200);

    const data = (await res.json()) as ListAuthorResponseBody;
    expect(data).toHaveProperty('authors');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page', 1);
    expect(data).toHaveProperty('page_size', 10);
    expect(data.total).toBe(25);
    expect(data.authors?.length).toBe(10);

    // Each author must have "id" and "string" (OpenAPI contract)
    const firstAuthor = data.authors![0];
    expect(firstAuthor).toHaveProperty('id');
    expect(firstAuthor).toHaveProperty('string');
    expect(typeof firstAuthor.string).toBe('string');
  });

  it('GET /admin/api/author slices correctly for page 3 with page_size=10', async () => {
    const res = await fetch('http://localhost:8000/admin/api/author?page=3&page_size=10');
    const data = (await res.json()) as ListAuthorResponseBody;
    expect(data.page).toBe(3);
    expect(data.authors?.length).toBe(5); // 25 total -> 10 + 10 + 5
  });

  it('POST /admin/api/author creates author and returns OpenAPI { id, name }', async () => {
    const newAuthorPayload = { name: 'Al-Mutanabbi' };
    const res = await fetch('http://localhost:8000/admin/api/author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAuthorPayload),
    });

    expect(res.status).toBe(201);
    const created = (await res.json()) as CreateAuthorResponseBody;
    expect(created).toHaveProperty('id');
    expect(created).toHaveProperty('name', 'Al-Mutanabbi');

    // Subsequent GET should include newly created author on page 1
    const listRes = await fetch('http://localhost:8000/admin/api/author?page=1&page_size=10');
    const listData = (await listRes.json()) as ListAuthorResponseBody;
    expect(listData.total).toBe(26);
    expect(listData.authors![0].string).toBe('Al-Mutanabbi');
  });

  it('POST /admin/api/author validates name and returns 422 if empty', async () => {
    const res = await fetch('http://localhost:8000/admin/api/author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('OpenAPI Compliance: Books Endpoints', () => {
  it('GET /admin/api/book returns OpenAPI ListBookResponseBody with all item fields', async () => {
    const res = await fetch('http://localhost:8000/admin/api/book?page=1&page_size=10');
    expect(res.status).toBe(200);

    const data = (await res.json()) as ListBookResponseBody;
    expect(data).toHaveProperty('books');
    expect(data).toHaveProperty('total', 25);
    expect(data.books?.length).toBe(10);

    const book = data.books![0];
    expect(book).toHaveProperty('id');
    expect(book).toHaveProperty('name');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('status');
    expect(book).toHaveProperty('created_at');
    expect(book).toHaveProperty('updated_at');
  });

  it('POST /admin/api/book creates book with OpenAPI CreateBookResponseBody fields', async () => {
    const createPayload = {
      name: 'The Cairo Awakening',
      description: 'A study of literary trends.',
      author_id: 'c79435b6-6f78-4ea7-9a40-02daff90e501',
    };

    const res = await fetch('http://localhost:8000/admin/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });

    expect(res.status).toBe(201);
    const created = (await res.json()) as CreateBookResponseBody;
    expect(created).toHaveProperty('id');
    expect(created).toHaveProperty('name', 'The Cairo Awakening');
    expect(created.description).toBe('A study of literary trends.');

    // Verify GET by ID returns GetBookResponseBody
    const getRes = await fetch(`http://localhost:8000/api/book/${created.id}`);
    expect(getRes.status).toBe(200);
    const detail = (await getRes.json()) as GetBookResponseBody;
    expect(detail.name).toBe('The Cairo Awakening');
    expect(detail.author).toBe('Naguib Mahfouz');
  });

  it('POST /admin/api/book/:id/asset binds book and audio assets', async () => {
    const bookId = 'b1010000-0000-4000-8000-000000000002';
    const res = await fetch(`http://localhost:8000/admin/api/book/${bookId}/asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_type: 'audio',
        file_id: 'a0000000-0000-4000-8000-000000000099',
      }),
    });
    expect(res.status).toBe(200);

    const getRes = await fetch(`http://localhost:8000/api/book/${bookId}`);
    const detail = (await getRes.json()) as GetBookResponseBody;
    expect(detail.has_audio).toBe(true);
  });

  it('POST /admin/api/book/:id/tag binds tags to book', async () => {
    const bookId = 'b1010000-0000-4000-8000-000000000002';
    const tagId = 't1000000-0000-4000-8000-000000000001';
    const res = await fetch(`http://localhost:8000/admin/api/book/${bookId}/tag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_id: tagId }),
    });
    expect(res.status).toBe(200);

    const getRes = await fetch(`http://localhost:8000/api/book/${bookId}`);
    const detail = (await getRes.json()) as GetBookResponseBody;
    expect(detail.tags).toContain('Literary Fiction');
  });
});

describe('OpenAPI Compliance: Categories Endpoints', () => {
  it('POST /api/category lists categories using query parameters and parent_id body filter', async () => {
    const res = await fetch('http://localhost:8000/api/category?page=1&page_size=20', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: null }),
    });
    expect(res.status).toBe(200);

    const data = (await res.json()) as ListCategoryResponseBody;
    expect(data).toHaveProperty('categories');
    expect(data.categories?.length).toBeGreaterThan(0);
    // Root categories have parent_id === null
    data.categories?.forEach((cat) => {
      expect(cat.parent_id).toBeNull();
    });
  });

  it('POST /admin/api/category creates new category and returns 201 with id', async () => {
    const res = await fetch('http://localhost:8000/admin/api/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Science & Nature' }),
    });
    expect(res.status).toBe(201);
    const data = (await res.json()) as { id: string };
    expect(data).toHaveProperty('id');
  });
});

describe('OpenAPI Compliance: Multipart Upload Workflow', () => {
  it('executes full upload lifecycle: init -> get-part -> PUT part -> complete', async () => {
    // 1. Init
    const initRes = await fetch('http://localhost:8000/admin/api/upload/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: 'application/epub+zip',
        expected_parts: 2,
      }),
    });
    expect(initRes.status).toBe(200);
    const initData = (await initRes.json()) as InitBookUploadResponseBody;
    expect(initData).toHaveProperty('key');
    expect(initData).toHaveProperty('upload_id');
    expect(initData).toHaveProperty('session_id');

    // 2. Get Part URL
    const partRes = await fetch('http://localhost:8000/admin/api/upload/get-part', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: initData.key,
        upload_id: initData.upload_id,
        part_number: 1,
      }),
    });
    expect(partRes.status).toBe(200);
    const partData = (await partRes.json()) as GetBookUploadPartURLResponseBody;
    expect(partData).toHaveProperty('url');

    // 3. Direct PUT to upload URL
    const uploadChunkRes = await fetch(`http://localhost:8000${partData.url}`, {
      method: 'PUT',
      body: new Uint8Array([1, 2, 3]),
    });
    expect(uploadChunkRes.status).toBe(200);
    const etag = uploadChunkRes.headers.get('ETag');
    expect(etag).toBeTruthy();

    // 4. Complete
    const completeRes = await fetch('http://localhost:8000/admin/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: initData.session_id!,
        parts: [{ part_number: 1, etag: etag! }],
      }),
    });
    expect(completeRes.status).toBe(200);
  });
});

describe('Mock Error Scenarios', () => {
  it('returns 500 when SERVER_ERROR scenario is activated', async () => {
    mockStore.setScenario('SERVER_ERROR');
    const res = await fetch('http://localhost:8000/admin/api/author');
    expect(res.status).toBe(500);
  });

  it('returns 401 when UNAUTHORIZED scenario is activated', async () => {
    mockStore.setScenario('UNAUTHORIZED');
    const res = await fetch('http://localhost:8000/admin/api/book');
    expect(res.status).toBe(401);
  });

  it('returns empty lists when EMPTY_STATE scenario is activated', async () => {
    mockStore.setScenario('EMPTY_STATE');
    const res = await fetch('http://localhost:8000/admin/api/author');
    const data = (await res.json()) as ListAuthorResponseBody;
    expect(data.total).toBe(0);
    expect(data.authors?.length).toBe(0);
  });
});
