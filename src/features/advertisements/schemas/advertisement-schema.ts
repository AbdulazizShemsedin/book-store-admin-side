import { z } from 'zod';

export const advertisementSchema = z.object({
  message: z
    .string()
    .min(1, 'Ad message is required')
    .max(128, 'Ad message must not exceed 128 characters'),
  order: z.coerce.number().min(1, 'Display order must be at least 1'),
  status: z.enum(['active', 'disabled']).default('active'),
  imageUrl: z.string().optional(),
});

export type AdvertisementFormData = z.infer<typeof advertisementSchema>;
