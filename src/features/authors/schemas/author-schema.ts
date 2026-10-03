import { z } from 'zod';

export const authorSchema = z.object({
  name: z
    .string()
    .min(1, 'Author full name is required')
    .max(128, 'Author name must be at most 128 characters'),
  nationality: z
    .string()
    .max(64, 'Nationality must be at most 64 characters')
    .optional(),
  bio: z
    .string()
    .max(1024, 'Biography must be at most 1024 characters')
    .optional(),
});

export type AuthorFormData = z.infer<typeof authorSchema>;
