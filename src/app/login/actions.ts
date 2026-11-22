'use server';

import { redirect } from 'next/navigation';
import { login as loginService, type ActionState } from '@/features/identity/actions';
import { identitySchemas } from '@/features/identity/schema';
import { checkRateLimit } from '@/shared/rate-limit';
import { clientIpKey } from '@/shared/auth/client-ip';

export type { ActionState } from '@/features/identity/actions';

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formData.get('email');
  const emailRaw = raw ? String(raw).trim().toLowerCase() : '';
  const ip = await clientIpKey();
  const byIp = await checkRateLimit(`login-ip:${ip}`, 100, 15 * 60 * 1000);
  if (!byIp.ok) return { ok: false, error: `Too many tries from this network. Try again in ${Math.max(1, Math.ceil(byIp.retryAfterSeconds / 60))} minute(s).` };
  // Keying on email + IP means an attacker cannot lock out a victim from another network.
  const rl = await checkRateLimit(`login:${emailRaw}:${ip}`, 6, 15 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many tries in a short time. Give it ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s). The rate limit is doing its job, not you.` };
  const parsed = identitySchemas.login.safeParse({ email: emailRaw, password: formData.get('password') });
  if (!parsed.success) return { ok: false, error: "Doesn't match. Check the caps-lock, then try again." };
  const user = await loginService(parsed.data);
  if (!user) return { ok: false, error: "We don't find that email and password. Sign up if this is your first time." };
  redirect(user.userType === 'admin' ? '/admin/matches' : user.userType === 'sponsor' ? '/advertise' : '/player');
}
