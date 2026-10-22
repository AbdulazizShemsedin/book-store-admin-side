import { z } from 'zod';

export const createSeriesSchema = z.object({
  name: z
    .string()
    .min(1, 'Series title is required')
    .max(128, 'Series title must be at most 128 characters')
    .transform((val) => val.trim()),
});

export type CreateSeriesFormData = z.infer<typeof createSeriesSchema>;

export const addBookToSeriesSchema = z.object({
  bookId: z.string().min(1, 'Please select a book'),
  position: z.coerce
    .number({ invalid_type_error: 'Position must be a number' })
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1')
    .max(128, 'Position cannot exceed 128'),
});

export type AddBookToSeriesFormData = z.infer<typeof addBookToSeriesSchema>;
