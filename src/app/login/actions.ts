'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ActionState = { ok: boolean; error?: string };

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const parse = schema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parse.success) return { ok: false, error: 'Invalid credentials.' };
  const email = parse.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: 'Invalid email or password.' };
  const ok = await compare(parse.data.password, user.passwordHash);
  if (!ok) return { ok: false, error: 'Invalid email or password.' };
  const token = await signSession({ userId: user.id, userType: user.userType, displayName: user.displayName, email: user.email });
  const jar = await cookies();
  jar.set('ffscout_session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*7 });
  redirect(user.userType === 'organizer' ? '/organizer/shortlist' : user.userType === 'admin' ? '/admin/verify' : '/player');
}
