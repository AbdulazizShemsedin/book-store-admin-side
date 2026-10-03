import { describe, it, expect } from 'vitest';
import { bookFormSchema } from './book-schema';

describe('bookFormSchema', () => {
  it('validates a complete and correct book registration payload', () => {
    const validData = {
      name: 'The Midnight Library',
      authorId: 'auth-123',
      publisherId: 'pub-456',
      pageCount: 304,
      tags: ['Bestseller', 'Fiction'],
      categoryId: 'cat-789',
      subcategoryId: 'sub-01',
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

  it('fails if book title is missing or empty', () => {
    const invalidData = {
      name: '',
      authorId: 'auth-123',
      tags: ['Fiction'],
      categoryId: 'cat-789',
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
      tags: ['Tech'],
      categoryId: 'cat-789',
      language: 'English',
      audiobookOption: 'none' as const,
      hasAudiobook: false,
    };

    const result = bookFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('fails if tags array is empty (PM requirement: tags field is required)', () => {
    const invalidData = {
      name: 'Clean Architecture',
      authorId: 'auth-123',
      tags: [],
      categoryId: 'cat-789',
      language: 'English',
      audiobookOption: 'none' as const,
      hasAudiobook: false,
    };

    const result = bookFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tags).toBeDefined();
    }
  });
});
