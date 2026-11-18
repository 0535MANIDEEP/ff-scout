'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type ActionState = { ok: boolean; error?: string };

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formData.get('email');
  const emailRaw = raw ? String(raw).trim().toLowerCase() : '';
  const rl = await checkRateLimit(`login:${emailRaw}`, 6, 15 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many attempts. Try again in ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s).` };
  const parse = schema.safeParse({ email: emailRaw, password: formData.get('password') });
  if (!parse.success) return { ok: false, error: 'Invalid credentials.' };
  const email = parse.data.email;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: 'Invalid email or password.' };
  const ok = await compare(parse.data.password, user.passwordHash);
  if (!ok) return { ok: false, error: 'Invalid email or password.' };
  const token = await signSession({ userId: user.id, userType: user.userType, displayName: user.displayName, email: user.email });
  const jar = await cookies();
  jar.set('ffscout_session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*7 });
  try {
    await prisma.auditLog.create({ data: { userId: user.id, action: 'login', detail: JSON.stringify({ email, type: user.userType }) } });
  } catch { /* never let an audit-write failure block login */ }
  redirect(user.userType === 'organizer' ? '/organizer/shortlist' : user.userType === 'admin' ? '/admin/verify' : '/player');
}
