import { initialMockAuthors } from './data/authors';
import { initialMockBooks, StoredMockBook } from './data/books';
import { initialMockCategories } from './data/categories';
import { initialMockTags, MockTag } from './data/tags';
import { initialMockPublishers } from './data/publishers';
import {
  ListAuthorItem,
  ListAuthorResponseBody,
  ListBookItem,
  ListBookResponseBody,
  GetBookResponseBody,
  CreateBookResponseBody,
  ListCategoryResponseItem,
  ListCategoryResponseBody,
  ListCategoryAdminResponseBody,
  ListCategoryAdminResponseItem,
  ListPublisherResponseItem,
  ListPublisherResponseBody,
  ListPlanResponseItem,
  ListPlanResponseBody,
  GetPlanResponseBody,
  ListAdvertisementResponseItem,
  ListAdvertisementResponseBody,
  CreateAdvertisementRequestBody,
  ListPurchaseRecordsResponseItem,
  ListPurchaseRecordsResponseBody,
  ListSubscriptionRecordsResponseItem,
  ListSubscriptionRecordsResponseBody,
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
  private publishers: ListPublisherResponseItem[] = [];
  private tags: MockTag[] = [];
  private plans: ListPlanResponseItem[] = [
    { id: 'plan-01', string: 'Monthly Membership', price: '9.99', discount: null },
    { id: 'plan-02', string: 'Annual Membership', price: '89.99', discount: 15 },
    { id: 'plan-03', string: 'Family Multi-Seat', price: '149.99', discount: 20 },
  ];
  private advertisements: ListAdvertisementResponseItem[] = [
    { id: 'ad-01', message: 'Ramadan & Eid Book Fair — 30% OFF Classical Works', banner: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', active_until: null },
    { id: 'ad-02', message: 'Scholar Spotlight: Imam Al-Ghazali Collection — 20% OFF', banner: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', active_until: null },
  ];
  private purchaseRecords: ListPurchaseRecordsResponseItem[] = [
    {
      id: 'purch-01',
      plan: { id: 'book-01', name: 'Fiqh us-Sunnah (Complete Set)' },
      type: 'both',
      paid_price: '24.99',
      user: { id: 'usr-01', name: 'Ahmed Nur', deleted_at: null },
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'purch-02',
      plan: { id: 'book-02', name: 'Riyad as-Salihin' },
      type: 'audio_only',
      paid_price: '14.50',
      user: { id: 'usr-02', name: 'Fatima Zahra', deleted_at: null },
      created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    },
    {
      id: 'purch-03',
      plan: { id: 'book-03', name: 'Tafsir Ibn Kathir (Vol. 1-8)' },
      type: 'book_only',
      paid_price: '45.00',
      user: { id: 'usr-03', name: 'Bilal Habashi', deleted_at: '2026-10-20T10:00:00Z' },
      created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    },
    {
      id: 'purch-04',
      plan: { id: 'book-04', name: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)' },
      type: 'both',
      paid_price: '18.00',
      user: { id: 'usr-04', name: 'Zaynab bint Ali', deleted_at: null },
      created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    },
    {
      id: 'purch-05',
      plan: { id: 'book-05', name: 'Stories of the Prophets' },
      type: 'audio_only',
      paid_price: '12.00',
      user: { id: 'usr-05', name: 'Hamza Yusuf', deleted_at: null },
      created_at: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    },
  ];
  private subscriptionRecords: ListSubscriptionRecordsResponseItem[] = [
    {
      id: 'sub-01',
      plan: { id: 'plan-01', name: 'Monthly Membership' },
      type: 'init',
      paid_price: '9.99',
      user: { id: 'usr-06', name: 'Khalid ibn Walid', deleted_at: null },
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'sub-02',
      plan: { id: 'plan-02', name: 'Annual Membership' },
      type: 'renewal',
      paid_price: '89.99',
      user: { id: 'usr-07', name: 'Maryam Yasin', deleted_at: null },
      created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    },
    {
      id: 'sub-03',
      plan: { id: 'plan-03', name: 'Family Multi-Seat' },
      type: 'init',
      paid_price: '149.99',
      user: { id: 'usr-08', name: 'Tariq Ziyad', deleted_at: '2026-10-15T08:00:00Z' },
      created_at: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
    },
  ];
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
        if (Array.isArray(parsed.publishers) && parsed.publishers.length > 0) this.publishers = parsed.publishers;
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
          publishers: this.publishers,
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
    this.publishers = JSON.parse(JSON.stringify(initialMockPublishers));
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

  getAuthorById(id: string): ListAuthorItem | null {
    return this.authors.find((a) => a.id === id) || null;
  }

  updateAuthor(
    id: string,
    updates: { name?: string; bio?: string; nationality?: string; photo_url?: string }
  ): ListAuthorItem | null {
    const author = this.authors.find((a) => a.id === id);
    if (!author) return null;

    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed || trimmed.length > 128) {
        throw new Error('Author name must be between 1 and 128 characters.');
      }
      author.string = trimmed;
    }
    if (updates.bio !== undefined) author.bio = updates.bio.trim();
    if (updates.nationality !== undefined) author.nationality = updates.nationality.trim();
    if (updates.photo_url !== undefined) author.photo_url = updates.photo_url;

    this.saveToStorage();
    return author;
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
      has_audio: b.has_audio,
      has_book: b.has_book ?? true,
      language: b.language || 'en',
      thumbnail: b.thumbnail || null,
      publisher: (b as any).publisher || null,
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
      thumbnail: null,
      publisher: null,
      language: 'en',
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

  createCategory(name: string, parentId?: string, color?: string): { id: string } {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Category name must be between 1 and 128 characters.');
    }

    const id = `c1000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
    const newCategory: ListCategoryResponseItem = {
      id,
      name: trimmed,
      parent_id: parentId || null,
      color: color || null,
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

  // ==========================================
  // PUBLISHERS
  // ==========================================

  getPublishers(params: { page?: number; pageSize?: number; search?: string }): ListPublisherResponseBody {
    if (this.activeScenario === 'EMPTY_STATE') {
      return {
        publishers: [],
        total: 0,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      };
    }

    let list = [...this.publishers];
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((p) => p.string.toLowerCase().includes(q));
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);

    return {
      publishers: slice,
      total,
      page,
      page_size: pageSize,
    };
  }

  getPublisherById(id: string): ListPublisherResponseItem | null {
    return this.publishers.find((p) => p.id === id) || null;
  }

  createPublisher(name: string): { id: string } {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Publisher name must be between 1 and 128 characters.');
    }

    const id = `p1000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
    const newPublisher: ListPublisherResponseItem = {
      id,
      string: trimmed,
    };

    this.publishers.unshift(newPublisher);
    this.saveToStorage();
    return { id };
  }

  updatePublisher(id: string, name: string): { id: string; string: string } | null {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 128) {
      throw new Error('Publisher name must be between 1 and 128 characters.');
    }

    const publisher = this.publishers.find((p) => p.id === id);
    if (!publisher) return null;

    publisher.string = trimmed;
    this.saveToStorage();
    return { id, string: trimmed };
  }

  // ==========================================
  // ADMIN CATEGORIES
  // ==========================================

  getCategoriesAdmin(params: { page?: number; pageSize?: number; parentId?: string }): ListCategoryAdminResponseBody {
    if (this.activeScenario === 'EMPTY_STATE') {
      return {
        categories: [],
        total: 0,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      };
    }

    let list = [...this.categories];
    if (params.parentId) {
      list = list.filter((c) => c.parent_id === params.parentId);
    } else {
      list = list.filter((c) => !c.parent_id);
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;
    const slice: ListCategoryAdminResponseItem[] = list.slice(start, start + pageSize).map((c) => ({
      id: c.id,
      name: c.name,
      parent_id: c.parent_id || '',
    }));

    return {
      categories: slice,
      total,
      page,
      page_size: pageSize,
    };
  }

  // ==========================================
  // AVATARS & THUMBNAILS
  // ==========================================

  setAuthorAvatar(authorId: string, avatarUrl: string): boolean {
    const author = this.authors.find((a) => a.id === authorId);
    if (!author) return false;
    author.avatar = avatarUrl;
    author.photo_url = avatarUrl;
    this.saveToStorage();
    return true;
  }

  setBookThumbnail(bookId: string, thumbnailUrl: string): boolean {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return false;
    book.thumbnail = thumbnailUrl;
    this.saveToStorage();
    return true;
  }

  deletePublisher(id: string): boolean {
    const idx = this.publishers.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.publishers.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getPlans(params: { page?: number; pageSize?: number }): ListPlanResponseBody {
    const total = this.plans.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;
    return {
      plans: this.plans.slice(start, start + pageSize),
      total,
      page,
      page_size: pageSize,
    };
  }

  getPlanById(id: string): GetPlanResponseBody | null {
    const p = this.plans.find((x) => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      string: p.string,
      price: p.price,
      discount: p.discount ?? null,
      discounted_price: p.discount ? (parseFloat(p.price) * (1 - p.discount / 100)).toFixed(2) : null,
      require_seats: p.string.toLowerCase().includes('family') || p.string.toLowerCase().includes('multi'),
      minimum_seats: 1,
      maximum_seats: p.string.toLowerCase().includes('family') ? 5 : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  updatePlan(id: string, updates: { price?: string; discount?: number }): GetPlanResponseBody | null {
    const p = this.plans.find((x) => x.id === id);
    if (!p) return null;
    if (updates.price) p.price = updates.price;
    if (updates.discount !== undefined) p.discount = updates.discount;
    this.saveToStorage();
    return this.getPlanById(id);
  }

  getAdvertisements(params: { page?: number; pageSize?: number }): ListAdvertisementResponseBody {
    const total = this.advertisements.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const start = (page - 1) * pageSize;
    return {
      advertisements: this.advertisements.slice(start, start + pageSize),
      total,
      page,
      page_size: pageSize,
    };
  }

  createAdvertisement(body: CreateAdvertisementRequestBody): { id: string } {
    const id = `ad-`;
    this.advertisements.unshift({
      id,
      message: body.message,
      banner: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      active_until: body.active_until || null,
    });
    this.saveToStorage();
    return { id };
  }

  uploadAdvertisementBanner(id: string, bannerUrl: string): boolean {
    const ad = this.advertisements.find((a) => a.id === id);
    if (!ad) return false;
    ad.banner = bannerUrl;
    this.saveToStorage();
    return true;
  }

  getPurchaseRecords(params: {
    page?: number;
    pageSize?: number;
    period?: string;
    date_start?: string;
    date_end?: string;
  }): ListPurchaseRecordsResponseBody {
    let list = [...this.purchaseRecords];
    if (params.date_start) {
      const startMs = new Date(params.date_start).getTime();
      list = list.filter((r) => new Date(r.created_at).getTime() >= startMs);
    }
    if (params.date_end) {
      const endMs = new Date(params.date_end).getTime();
      list = list.filter((r) => new Date(r.created_at).getTime() <= endMs);
    }
    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 50);
    const start = (page - 1) * pageSize;
    return {
      records: list.slice(start, start + pageSize),
      total,
      page,
      page_size: pageSize,
    };
  }

  getSubscriptionRecords(params: {
    page?: number;
    pageSize?: number;
    period?: string;
    date_start?: string;
    date_end?: string;
  }): ListSubscriptionRecordsResponseBody {
    let list = [...this.subscriptionRecords];
    if (params.date_start) {
      const startMs = new Date(params.date_start).getTime();
      list = list.filter((r) => new Date(r.created_at).getTime() >= startMs);
    }
    if (params.date_end) {
      const endMs = new Date(params.date_end).getTime();
      list = list.filter((r) => new Date(r.created_at).getTime() <= endMs);
    }
    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 50);
    const start = (page - 1) * pageSize;
    return {
      records: list.slice(start, start + pageSize),
      total,
      page,
      page_size: pageSize,
    };
  }
}

export const mockStore = new MockStore();
