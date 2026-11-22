import { z } from 'zod';
import { MATCH } from '@/shared/config/match';

export const matchSchemas = {
  create: z.object({
    title: z.string().trim().min(4).max(90),
    mode: z.enum(MATCH.modes as [string, ...string[]]),
    gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
    date: z.coerce.date(),
    city: z.string().trim().min(2).max(80),
    online: z.enum(['yes', 'no']).default('no'),
    slots: z.coerce.number().int().positive().max(100000).optional(),
    contact: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(500).optional(),
    durationMinutes: z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v), 'Pick a supported duration'),
  }),
};
