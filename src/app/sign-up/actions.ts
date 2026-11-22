'use server';

import { redirect } from 'next/navigation';
import { signUp, type ActionState } from '@/features/identity/actions';
import { checkRateLimit } from '@/shared/rate-limit';

export type { ActionState } from '@/features/identity/actions';

export async function registerPlayer(_: ActionState, formData: FormData): Promise<ActionState> {
  const agree = formData.get('agree') === 'on';
  if (!agree) return { ok: false, error: 'Tick the box to confirm you are 18+, accept the Privacy Notice, and agree that every listing is free entry. Final Circle handles no money.' };
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase();
  const rl = await checkRateLimit(`signup:${emailRaw}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many tries in a short time. Give it ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s). The limit is doing its job, not you.` };
  try {
    await signUp({
      email: emailRaw,
      password: formData.get('password'),
      displayName: formData.get('displayName'),
      college: formData.get('college'),
      ageConfirmed: agree,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      return { ok: false, error: 'IGN or email already registered.' };
    }
    return { ok: false, error: 'Missing or invalid fields.' };
  }
  redirect('/player');
}
