import { describe, it, expect } from 'vitest';
import { createSeriesSchema, addBookToSeriesSchema } from './series-schema';

describe('createSeriesSchema', () => {
  it('validates valid series name', () => {
    const result = createSeriesSchema.safeParse({ name: 'Epic of Gilgamesh' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Epic of Gilgamesh');
    }
  });

  it('fails on empty series name', () => {
    const result = createSeriesSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('fails on series name exceeding 128 characters', () => {
    const result = createSeriesSchema.safeParse({ name: 'a'.repeat(129) });
    expect(result.success).toBe(false);
  });
});

describe('addBookToSeriesSchema', () => {
  it('validates valid bookId and position', () => {
    const result = addBookToSeriesSchema.safeParse({
      bookId: '123e4567-e89b-12d3-a456-426614174000',
      position: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBe(1);
    }
  });

  it('coerces string position to number', () => {
    const result = addBookToSeriesSchema.safeParse({
      bookId: '123e4567-e89b-12d3-a456-426614174000',
      position: '3',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBe(3);
    }
  });

  it('fails when position is less than 1 or greater than 128', () => {
    expect(addBookToSeriesSchema.safeParse({ bookId: 'some-id', position: 0 }).success).toBe(false);
    expect(addBookToSeriesSchema.safeParse({ bookId: 'some-id', position: 129 }).success).toBe(false);
  });

  it('fails when bookId is empty', () => {
    expect(addBookToSeriesSchema.safeParse({ bookId: '', position: 1 }).success).toBe(false);
  });
});
