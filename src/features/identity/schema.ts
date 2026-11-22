import { z } from 'zod';

export const identitySchemas = {
  login: z.object({ email: z.email(), password: z.string().min(1).max(72) }),
  signUp: z.object({
    email: z.email(),
    password: z.string().min(8).max(72),
    displayName: z.string().trim().min(2).max(40),
    ageConfirmed: z.literal(true),
  }),
};
