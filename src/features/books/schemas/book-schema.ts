import { z } from 'zod';

export const bookFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Book title is required')
    .max(128, 'Book title must be at most 128 characters'),
  authorId: z.string().min(1, 'Author selection is required'),
  publisherId: z.string().optional(),
  // Book product format
  bookFormat: z.enum(['book_only', 'audiobook_only', 'both']).default('both'),
  // Unified Categories (up to 5 categories, optional)
  categoryIds: z
    .array(z.string())
    .max(5, 'Maximum of 5 categories allowed')
    .optional()
    .default([]),
  tags: z
    .array(z.string())
    .max(5, 'Maximum of 5 categories allowed')
    .optional()
    .default([]),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  description: z
    .string()
    .max(1024, 'Description must be at most 1024 characters')
    .optional(),
  language: z.string().min(1, 'Master language is required'),
  // Pricing fields documented in OpenAPI CreateBookRequestBody
  bookPrice: z.string().optional(),
  audioPrice: z.string().optional(),
  totalPrice: z.string().optional(),
  // Cover
  coverFileId: z.string().optional(),
  // Book asset (EPUB / PDF) - optional for audiobook-only products
  bookFileId: z.string().optional(),
  // Audiobook condition
  audiobookOption: z.enum(['has_audiobook', 'ai_generated', 'none']).default('has_audiobook'),
  hasAudiobook: z.boolean().default(false),
  narrator: z.string().optional(),
  audioFileId: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookFormSchema>;
