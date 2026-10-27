import { z } from 'zod';

export const advertisementSchema = z.object({
  message: z
    .string()
    .min(1, 'Ad message is required')
    .max(128, 'Ad message must not exceed 128 characters'),
  buttonLabel: z.string().max(128).optional().or(z.literal('')),
  activeUntil: z.string().optional().or(z.literal('')),
  actionType: z.enum(['subscription', 'book_detail', 'external_link']).default('subscription'),
  actionUrl: z.string().url('Must be a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  actionBookId: z.string().optional().or(z.literal('')),
});

export type AdvertisementFormData = z.infer<typeof advertisementSchema>;
