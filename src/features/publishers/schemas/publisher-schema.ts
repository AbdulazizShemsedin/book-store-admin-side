import { z } from 'zod';

export const publisherSchema = z.object({
  name: z
    .string()
    .min(1, 'Publisher name is required')
    .max(128, 'Publisher name must not exceed 128 characters'),
});

export type PublisherFormData = z.infer<typeof publisherSchema>;
