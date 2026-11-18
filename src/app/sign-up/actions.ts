'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
  college: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  role: z.enum(['fragger','sniper','support','igled','lurker']),
  rank: z.enum(['Bronze','Silver','Gold','Diamond','Heroic','Master']),
});

export type ActionState = { ok: boolean; error?: string };

export async function registerPlayer(_: ActionState, formData: FormData): Promise<ActionState> {
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase();
  const rl = await checkRateLimit(`signup:${emailRaw}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many attempts. Try again in ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s).` };
  const parse = schema.safeParse({
    email: emailRaw,
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    college: formData.get('college'),
    city: formData.get('city'),
    role: formData.get('role'),
    rank: formData.get('rank'),
  });
  if (!parse.success) {
    return { ok: false, error: 'Missing or invalid fields.' };
  }
  const d = parse.data;
  const email = d.email;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'IGN or email already registered.' };
  const passwordHash = await hash(d.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: d.displayName.trim(),
      userType: 'player',
      college: d.college.trim(),
      city: d.city.trim(),
      role: d.role,
      rank: d.rank,
      status: 'looking',
    },
  });
  const token = await signSession({ userId: user.id, userType: 'player', displayName: user.displayName, email: user.email });
  const jar = await cookies();
  jar.set('ffscout_session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*7 });
  try {
    await prisma.auditLog.create({ data: { userId: user.id, action: 'signup', detail: JSON.stringify({ email, role: d.role, rank: d.rank }) } });
  } catch { /* never let an audit-write failure block signup */ }
  redirect('/player');
}
