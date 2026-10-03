import { z } from 'zod';

export const bookFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Book title is required')
    .max(128, 'Book title must be at most 128 characters'),
  authorId: z.string().min(1, 'Author selection is required'),
  publisherId: z.string().optional(),
  pageCount: z.coerce
    .number()
    .min(1, 'Page count must be at least 1')
    .optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  categoryId: z.string().min(1, 'Category selection is required'),
  subcategoryId: z.string().optional(),
  description: z
    .string()
    .max(1024, 'Description must be at most 1024 characters')
    .optional(),
  language: z.string().min(1, 'Master language is required'),
  // Cover
  coverFileId: z.string().optional(),
  // Book asset
  bookFileId: z.string().optional(),
  // Audiobook condition
  audiobookOption: z.enum(['has_audiobook', 'ai_generated', 'none']),
  hasAudiobook: z.boolean(),
  narrator: z.string().optional(),
  audioFileId: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookFormSchema>;
