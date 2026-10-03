import { describe, it, expect } from 'vitest';
import { authorSchema } from './author-schema';

describe('authorSchema', () => {
  it('validates author with name and nationality (PM requirement)', () => {
    const data = {
      name: 'Jane Austen',
      nationality: 'Yemeni',
      bio: 'Renowned 19th-century novelist.',
    };

    const result = authorSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nationality).toBe('Yemeni');
    }
  });

  it('fails when author name is blank', () => {
    const data = {
      name: '',
      nationality: 'Yemeni',
    };

    const result = authorSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
