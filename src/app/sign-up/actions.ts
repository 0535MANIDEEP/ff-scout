'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
  college: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  role: z.enum(['rusher','sniper','support','anchor','lurker']),
  rank: z.enum(['Bronze','Silver','Gold','Diamond','Heroic','Master']),
  iglCapable: z.boolean().optional(),
});

export type ActionState = { ok: boolean; error?: string };

export async function registerPlayer(_: ActionState, formData: FormData): Promise<ActionState> {
  const agree = formData.get('agree') === 'on';
  const is18 = formData.get('is18') === 'on';
  if (!agree) return { ok: false, error: 'You must agree to the Privacy Notice to enter the pool.' };
  if (!is18) return { ok: false, error: 'FF Scout is 18+. Confirm your age to continue.' };
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
    iglCapable: formData.get('iglCapable') === 'on',
  });
  if (!parse.success) {
    return { ok: false, error: 'Missing or invalid fields.' };
  }
  const d = parse.data;
  const email = d.email;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'IGN or email already registered.' };
  const passwordHash = await hash(d.password, 10);
  // The findUnique above is a check, not a guarantee, two concurrent signups
  // with the same email both pass it. The unique index is the real gate; P2002 is the answer.
  let user;
  try {
    user = await prisma.user.create({
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
        consentedAt: new Date(),
        ageConfirmed: true,
        iglCapable: d.iglCapable ?? false,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, error: 'IGN or email already registered.' };
    }
    throw err;
  }
  const token = await signSession({ userId: user.id, userType: 'player', displayName: user.displayName, email: user.email });
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  try {
    await prisma.auditLog.create({ data: { userId: user.id, action: 'signup', detail: JSON.stringify({ email, role: d.role, rank: d.rank }) } });
  } catch { /* never let an audit-write failure block signup */ }
  redirect('/player');
}
