import { describe, it, expect } from 'vitest';
import { bookFormSchema } from './book-schema';

describe('bookFormSchema', () => {
  it('validates a complete and correct book registration payload', () => {
    const validData = {
      name: 'The Midnight Library',
      authorId: 'auth-123',
      publisherId: 'pub-456',
      categoryIds: ['cat-789', 'cat-456'],
      tags: ['Bestseller', 'Fiction'],
      bookFormat: 'both' as const,
      description: 'A novel about infinite choices and second chances.',
      language: 'English',
      audiobookOption: 'has_audiobook' as const,
      hasAudiobook: true,
      narrator: 'Carey Mulligan',
      bookFileId: 'asset-epub-1',
      audioFileId: 'asset-mp3-1',
    };

    const result = bookFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates an audiobook-only book without requiring a bookFileId', () => {
    const audiobookOnlyData = {
      name: 'Atomic Habits Audio Edition',
      authorId: 'auth-123',
      bookFormat: 'audiobook_only' as const,
      categoryIds: ['cat-self-help'],
      language: 'English',
      hasAudiobook: true,
      audioFileId: 'asset-mp3-audio',
      narrator: 'James Clear',
    };

    const result = bookFormSchema.safeParse(audiobookOnlyData);
    expect(result.success).toBe(true);
  });

  it('fails if book title is missing or empty', () => {
    const invalidData = {
      name: '',
      authorId: 'auth-123',
      language: 'English',
      audiobookOption: 'none' as const,
      hasAudiobook: false,
    };

    const result = bookFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it('fails if authorId is not selected', () => {
    const invalidData = {
      name: 'Clean Code',
      authorId: '',
      language: 'English',
      audiobookOption: 'none' as const,
      hasAudiobook: false,
    };

    const result = bookFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('allows registering a book with optional categories (empty or up to 5)', () => {
    const dataWithoutCategories = {
      name: 'Uncategorized Book',
      authorId: 'auth-123',
      language: 'English',
      categoryIds: [],
    };

    const result = bookFormSchema.safeParse(dataWithoutCategories);
    expect(result.success).toBe(true);
  });

  it('fails if more than 5 categories are assigned', () => {
    const invalidData = {
      name: 'Category Overloaded Book',
      authorId: 'auth-123',
      language: 'English',
      categoryIds: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'],
    };

    const result = bookFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.categoryIds).toBeDefined();
    }
  });
});
