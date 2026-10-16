import { apiClient } from '@/lib/api/client';
import {
  ListBookResponseBody,
  CreateBookRequestBody,
  CreateBookResponseBody,
  AddBookTagRequestBody,
  GetBookResponseBody,
} from '@/types/api';
import { uploadBookThumbnail, uploadBookAsset } from '@/lib/upload/multipart-upload';
import { Book } from '@/types/domain';
import { BookFormData } from '../schemas/book-schema';

export interface ListBooksParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface ListBooksResult {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
}

export const booksApi = {
  /**
   * Retrieves paginated books via GET /admin/api/book.
   */
  async list(params: ListBooksParams = {}, signal?: AbortSignal): Promise<ListBooksResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };
    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.status?.trim()) queryParams.status = params.status.trim();

    const response = await apiClient.get<ListBookResponseBody>('/admin/api/book', {
      params: queryParams,
      signal,
    });

    const rawBooks = response.books || [];

    const books: Book[] = rawBooks.map((item) => ({
      id: item.id,
      name: item.name,
      author: item.author || '—',
      publisher: item.publisher || '—',
      status: item.status || 'Published',
      hasAudiobook: Boolean(item.has_audio),
      language: item.language || 'English',
      thumbnail: item.thumbnail || null,
      coverUrl: item.thumbnail || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      books,
      total: response.total ?? books.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Retrieves detailed book record for [id] page via GET /api/book/{book_id}.
   */
  async getById(id: string): Promise<Book> {
    const response = await apiClient.get<GetBookResponseBody>(`/api/book/${id}`);
    return {
      id: response.id || id,
      name: response.name,
      author: response.author || '—',
      publisher: '—',
      status: 'Published',
      pageCount: 0,
      description: response.description,
      language: 'English',
      category: (response.tags && response.tags[0]) || 'General',
      tags: response.tags || [],
      hasAudiobook: Boolean(response.has_audio),
      thumbnail: response.thumbnail,
      coverUrl: response.thumbnail || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Step 1: Submits initial book metadata to POST /admin/api/book and returns the assigned bookId.
   */
  async createRecord(data: BookFormData): Promise<{ id: string }> {
    const langCode =
      data.language === 'Amharic'
        ? 'am'
        : data.language === 'Arabic'
        ? 'ar'
        : ['en', 'am', 'ar'].includes(data.language)
        ? data.language
        : 'en';

    const requestBody: CreateBookRequestBody = {
      name: data.name.trim(),
      language: langCode,
      description: data.description?.trim() || undefined,
      author_id: data.authorId || undefined,
      publisher_id: data.publisherId || undefined,
      book_price: data.bookPrice?.trim() || undefined,
      audio_price: data.audioPrice?.trim() || undefined,
      total_price: data.totalPrice?.trim() || undefined,
    };

    const response = await apiClient.post<CreateBookResponseBody>(
      '/admin/api/book',
      requestBody
    );

    return { id: response.id };
  },

  /**
   * Submits a new book to POST /admin/api/book, attaches assets & tags.
   */
  async create(
    data: BookFormData & { coverFile?: File; bookFile?: File; audioFile?: File }
  ): Promise<{ id: string }> {
    const langCode =
      data.language === 'Amharic'
        ? 'am'
        : data.language === 'Arabic'
        ? 'ar'
        : ['en', 'am', 'ar'].includes(data.language)
        ? data.language
        : 'en';

    const requestBody: CreateBookRequestBody = {
      name: data.name.trim(),
      language: langCode,
      description: data.description?.trim() || undefined,
      author_id: data.authorId || undefined,
      publisher_id: data.publisherId || undefined,
      book_price: data.bookPrice?.trim() || undefined,
      audio_price: data.audioPrice?.trim() || undefined,
      total_price: data.totalPrice?.trim() || undefined,
    };

    const response = await apiClient.post<CreateBookResponseBody>(
      '/admin/api/book',
      requestBody
    );

    const bookId = response.id;

    // Attach thumbnail via documented POST /admin/api/book/{book_id}/thumbnail if coverFile provided
    if (data.coverFile && bookId) {
      try {
        await uploadBookThumbnail(bookId, data.coverFile);
      } catch (thumbErr) {
        console.error('Failed to upload book thumbnail:', thumbErr);
      }
    }

    // Attach manuscript EPUB via documented POST /admin/api/book/{book_id}/asset if bookFile provided
    if (data.bookFormat !== 'audiobook_only' && data.bookFile && bookId) {
      try {
        await uploadBookAsset(bookId, 'book', data.bookFile);
      } catch (assetErr) {
        console.error('Failed to upload manuscript asset:', assetErr);
      }
    }

    // Attach audiobook MP3 via documented POST /admin/api/book/{book_id}/asset if audioFile provided
    if (data.hasAudiobook && data.audioFile && bookId) {
      try {
        await uploadBookAsset(bookId, 'audio', data.audioFile);
      } catch (audioErr) {
        console.error('Failed to upload audiobook asset:', audioErr);
      }
    }

    // Attach all unique categories/tags via documented POST /admin/api/book/{book_id}/tag
    const rawTags =
      data.categoryIds && data.categoryIds.length > 0
        ? data.categoryIds
        : data.tags || [];
    const uniqueTags = Array.from(new Set(rawTags.filter(Boolean)));

    for (const tagId of uniqueTags) {
      try {
        await apiClient.post(`/admin/api/book/${bookId}/tag`, {
          tag_id: tagId,
        } as AddBookTagRequestBody);
      } catch (tagErr) {
        console.warn(`Failed to attach category/tag ${tagId}:`, tagErr);
      }
    }

    return { id: bookId };
  },

  /**
   * Attaches an asset (book or audio) via POST /admin/api/book/{book_id}/asset.
   */
  async attachAsset(bookId: string, assetType: 'book' | 'audio', file: File): Promise<void> {
    await uploadBookAsset(bookId, assetType, file);
  },

  /**
   * Attaches a tag via POST /admin/api/book/{book_id}/tag.
   */
  async attachTag(bookId: string, tagId: string): Promise<void> {
    await apiClient.post(`/admin/api/book/${bookId}/tag`, {
      tag_id: tagId,
    } as AddBookTagRequestBody);
  },
};
