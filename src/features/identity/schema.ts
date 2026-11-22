import { z } from 'zod';

export const identitySchemas = {
  login: z.object({ email: z.email(), password: z.string().min(1) }),
  signUp: z.object({
    email: z.email(),
    password: z.string().min(8),
    displayName: z.string().trim().min(2).max(40),
    ageConfirmed: z.literal(true),
  }),
};
