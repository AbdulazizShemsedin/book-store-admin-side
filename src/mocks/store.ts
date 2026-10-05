import { initialMockAuthors } from './data/authors';
import { initialMockBooks, StoredMockBook } from './data/books';
import { initialMockCategories } from './data/categories';
import { initialMockTags, MockTag } from './data/tags';
import {
  ListAuthorItem,
  ListAuthorResponseBody,
  ListBookItem,
  ListBookResponseBody,
  GetBookResponseBody,
  CreateBookResponseBody,
  ListCategoryResponseItem,
  ListCategoryResponseBody,
} from '@/types/api';

export type ErrorScenario = 'NONE' | 'SERVER_ERROR' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'EMPTY_STATE';

/**
 * Stateful in-memory store for development MSW mocks.
 * Follows OpenAPI schemas strictly, provides pagination slicing, search filtering,
 * creation mutations, asset bindings, and controllable error/empty scenarios.
 */
class MockStore {
  private authors: ListAuthorItem[] = [];
  private books: StoredMockBook[] = [];
  private categories: ListCategoryResponseItem[] = [];
  private tags: MockTag[] = [];
  private activeScenario: ErrorScenario = 'NONE';

  constructor() {
    this.resetToDefaults();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('tewba_mock_db');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.authors) && parsed.authors.length > 0) this.authors = parsed.authors;
        if (Array.isArray(parsed.books) && parsed.books.length > 0) this.books = parsed.books;
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) this.categories = parsed.categories;
        if (Array.isArray(parsed.tags) && parsed.tags.length > 0) this.tags = parsed.tags;
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'tewba_mock_db',
        JSON.stringify({
          authors: this.authors,
          books: this.books,
          categories: this.categories,
          tags: this.tags,
        })
      );
    } catch {
      // ignore
    }
  }

  resetToDefaults() {
    this.authors = JSON.parse(JSON.stringify(initialMockAuthors));
    this.books = JSON.parse(JSON.stringify(initialMockBooks));
    this.categories = JSON.parse(JSON.stringify(initialMockCategories));
    this.tags = JSON.parse(JSON.stringify(initialMockTags));
    this.activeScenario = 'NONE';
    this.loadFromStorage();
  }

  setScenario(scenario: ErrorScenario) {
    this.activeScenario = scenario;
  }

  getScenario(): ErrorScenario {
    return this.activeScenario;
  }

  // ==========================================
  // AUTHORS
  // ==========================================

  getAuthors(params: { page?: number; pageSize?: number; search?: string }): ListAuthorResponseBody {
    if (this.activeScenario === 'EMPTY_STATE') {
      return {
        authors: [],
        total: 0,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      };
    }

    let list = [...this.authors];
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((a) => a.string.toLowerCase().includes(q));
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);

    return {
      authors: slice,
      total,
      page,
      page_size: pageSize,
    };
  }

  createAuthor(
    name: string,
    bio?: string,
    nationality?: string,
    photoUrl?: string
  ): { id: string; name: string } {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Author name must be between 1 and 128 characters.');
    }

    const id = `c79435b6-6f78-4ea7-9a40-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
    const newAuthor: ListAuthorItem = {
      id,
      string: trimmed,
      bio: bio?.trim(),
      nationality: nationality?.trim() || 'Yemeni',
      photo_url: photoUrl,
    };

    // Prepend so newly created author is immediately visible on page 1
    this.authors.unshift(newAuthor);
    this.saveToStorage();

    return {
      id,
      name: trimmed,
    };
  }

  deleteAuthor(id: string): boolean {
    const idx = this.authors.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.authors.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // ==========================================
  // BOOKS
  // ==========================================

  getBooks(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): ListBookResponseBody {
    if (this.activeScenario === 'EMPTY_STATE') {
      return {
        books: [],
        total: 0,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      };
    }

    let list = [...this.books];

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q))
      );
    }

    if (params.status?.trim()) {
      const s = params.status.trim().toLowerCase();
      list = list.filter((b) => b.status.toLowerCase() === s);
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;

    const slice: ListBookItem[] = list.slice(start, start + pageSize).map((b) => ({
      id: b.id,
      name: b.name,
      author: b.author,
      status: b.status,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));

    return {
      books: slice,
      total,
      page,
      page_size: pageSize,
    };
  }

  getBookById(id: string): GetBookResponseBody | null {
    const book = this.books.find((b) => b.id === id);
    if (!book) return null;

    return {
      id: book.id,
      name: book.name,
      description: book.description,
      author: book.author || null,
      has_audio: book.has_audio,
      has_book: book.has_book,
      rating: book.rating || null,
      tags: book.tags || [],
    };
  }

  createBook(payload: {
    name: string;
    description?: string;
    author_id?: string;
    thumbnail_id?: string;
  }): CreateBookResponseBody {
    const trimmedName = payload.name?.trim();
    if (!trimmedName || trimmedName.length > 128) {
      throw new Error('Book name is required and cannot exceed 128 characters.');
    }

    const id = `b1010000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
    const now = new Date().toISOString();

    let authorName: string | null = null;
    if (payload.author_id) {
      const author = this.authors.find((a) => a.id === payload.author_id);
      authorName = author ? author.string : null;
    }

    const newBook: StoredMockBook = {
      id,
      name: trimmedName,
      author: authorName,
      author_id: payload.author_id || '',
      thumbnail_id: payload.thumbnail_id,
      description: payload.description || '',
      status: 'Published',
      has_audio: false,
      has_book: false,
      rating: null,
      tags: [],
      created_at: now,
      updated_at: now,
    };

    this.books.unshift(newBook);
    this.saveToStorage();

    return {
      id,
      name: trimmedName,
      description: payload.description || null,
      author_id: payload.author_id,
      thumbnail_id: payload.thumbnail_id,
    };
  }

  deleteBook(id: string): boolean {
    const idx = this.books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.books.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  attachAsset(bookId: string, assetType: 'book' | 'audio'): boolean {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return false;

    if (assetType === 'book') {
      book.has_book = true;
    } else if (assetType === 'audio') {
      book.has_audio = true;
    }
    book.updated_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  attachTag(bookId: string, tagId: string): boolean {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return false;

    const tag = this.tags.find((t) => t.id === tagId);
    const tagName = tag ? tag.name : tagId;

    if (!book.tags) book.tags = [];
    if (!book.tags.includes(tagName)) {
      book.tags.push(tagName);
    }
    book.updated_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // CATEGORIES
  // ==========================================

  getCategories(params: {
    page?: number;
    pageSize?: number;
    parentId?: string;
  }): ListCategoryResponseBody {
    if (this.activeScenario === 'EMPTY_STATE') {
      return {
        categories: [],
        total: 0,
        page: params.page || 1,
        page_size: params.pageSize || 50,
      };
    }

    let list = [...this.categories];

    if (params.parentId !== undefined) {
      list = list.filter((c) => c.parent_id === params.parentId);
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 50);
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);

    return {
      categories: slice,
      total,
      page,
      page_size: pageSize,
    };
  }

  createCategory(name: string, parentId?: string): { id: string } {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Category name must be between 1 and 128 characters.');
    }

    const id = `c1000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
    const newCategory: ListCategoryResponseItem = {
      id,
      name: trimmed,
      parent_id: parentId || null,
    };

    this.categories.push(newCategory);
    this.saveToStorage();
    return { id };
  }

  updateCategory(id: string, name: string): { id: string; name: string } {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Category name must be between 1 and 128 characters.');
    }

    const category = this.categories.find((c) => c.id === id);
    if (!category) {
      throw new Error('Category not found.');
    }

    category.name = trimmed;
    this.saveToStorage();
    return { id, name: trimmed };
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.categories.length;
    // Recursively collect target category and all descendants (up to 5 levels)
    const toDelete = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      for (const c of this.categories) {
        if (c.parent_id && toDelete.has(c.parent_id) && !toDelete.has(c.id)) {
          toDelete.add(c.id);
          added = true;
        }
      }
    }
    this.categories = this.categories.filter((c) => !toDelete.has(c.id));
    this.saveToStorage();
    return this.categories.length < initialLen;
  }

  getTags(): MockTag[] {
    this.loadFromStorage();
    return [...this.tags];
  }

  createTag(name: string): MockTag {
    this.loadFromStorage();
    const newTag: MockTag = {
      id: `tag_${Date.now()}`,
      name: name.trim(),
    };
    this.tags.push(newTag);
    this.saveToStorage();
    return newTag;
  }
}

export const mockStore = new MockStore();
