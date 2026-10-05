import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  pin: z
    .string()
    .min(4, 'Security PIN / Password must be at least 4 digits')
    .max(32, 'Security PIN / Password is too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
