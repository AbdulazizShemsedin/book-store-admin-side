import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(128, 'Category name must not exceed 128 characters'),
  parentId: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
