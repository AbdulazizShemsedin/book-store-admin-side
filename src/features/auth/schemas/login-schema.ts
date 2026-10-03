import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Phone number or email is required')
    .refine(
      (val) => {
        // Can be phone (e.g. +2519... or 09...) or email
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^(\+?[0-9]{9,15})$/.test(val.replace(/[\s-]/g, ''));
        return isEmail || isPhone;
      },
      {
        message: 'Enter a valid phone number (e.g. +251911223344) or email address',
      }
    ),
  pin: z
    .string()
    .min(4, 'Security PIN / Password must be at least 4 digits')
    .max(32, 'Security PIN / Password is too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
