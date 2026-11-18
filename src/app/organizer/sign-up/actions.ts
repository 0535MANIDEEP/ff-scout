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
  displayName: z.string().min(2).max(60),
  orgName: z.string().min(2).max(120),
  orgType: z.string().min(2).max(60),
  city: z.string().min(2).max(80),
});

export type ActionState = { ok: boolean; error?: string };

export async function registerOrganizer(_: ActionState, formData: FormData): Promise<ActionState> {
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase();
  const rl = await checkRateLimit(`org-signup:${emailRaw}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many attempts. Try again in ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s).` };
  const parse = schema.safeParse({
    email: emailRaw,
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    orgName: formData.get('orgName'),
    orgType: formData.get('orgType'),
    city: formData.get('city'),
  });
  if (!parse.success) return { ok: false, error: 'Missing or invalid fields.' };
  const d = parse.data;
  const email = d.email;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'Email already registered.' };
  const passwordHash = await hash(d.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: d.displayName.trim(),
      userType: 'organizer',
      orgName: d.orgName.trim(),
      orgType: d.orgType.trim(),
      city: d.city.trim(),
    },
  });
  const token = await signSession({ userId: user.id, userType: 'organizer', displayName: user.displayName, email: user.email });
  const jar = await cookies();
  jar.set('ffscout_session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*7 });
  try {
    await prisma.auditLog.create({ data: { userId: user.id, action: 'org_signup', detail: JSON.stringify({ email, orgName: d.orgName, orgType: d.orgType }) } });
  } catch { /* never let an audit-write failure block signup */ }
  redirect('/organizer/shortlist');
}
