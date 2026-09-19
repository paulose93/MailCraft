import { z } from 'zod';

export const createSubscriberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

export const updateSubscriberSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    status: z.enum(['ACTIVE', 'UNSUBSCRIBED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
