import { z } from 'zod';

export const reportSchemas = z.object({
  matchId: z.string().min(1),
  category: z.enum(['payment_request', 'fake_match', 'other']),
  reason: z.string().trim().min(1).max(300),
});
