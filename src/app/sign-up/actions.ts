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
});

export type ActionState = { ok: boolean; error?: string };

export async function registerPlayer(_: ActionState, formData: FormData): Promise<ActionState> {
  const agree = formData.get('agree') === 'on';
  if (!agree) return { ok: false, error: "One tick away — the Privacy Notice is the only paperwork we'll ever ask of you." };
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase();
  const rl = await checkRateLimit(`signup:${emailRaw}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many tries in a short time. Give it ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s) — the limit is doing its job, not you.` };
  const parse = schema.safeParse({
    email: emailRaw,
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    college: formData.get('college'),
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
        city: 'India',
        role: 'rusher',
        consentedAt: new Date(),
        ageConfirmed: true,
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
    await prisma.auditLog.create({ data: { userId: user.id, action: 'signup', detail: JSON.stringify({ email }) } });
  } catch { /* never let an audit-write failure block signup */ }
  redirect('/player');
}
