'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/shared/auth/session';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  brandName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  contact: z.string().trim().max(120).optional(),
});

export async function registerSponsor(formData: FormData) {
  const agree = formData.get('agree') === 'on';
  if (!agree) redirect('/sponsor/sign-up?e=agree');
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase();
  const rl = await checkRateLimit(`signup:${emailRaw}`, 3, 60 * 60 * 1000);
  if (!rl.ok) redirect('/sponsor/sign-up?e=rate');
  const parsed = schema.safeParse({
    email: emailRaw,
    password: formData.get('password'),
    brandName: formData.get('brandName'),
    city: formData.get('city'),
    contact: formData.get('contact') || undefined,
  });
  if (!parsed.success) redirect('/sponsor/sign-up?e=invalid');
  const d = parsed.data;

  try {
    const user = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash: await hash(d.password, 10),
        displayName: d.brandName,
        userType: 'sponsor',
        brandName: d.brandName,
        city: d.city,
        contact: d.contact ?? null,
        consentedAt: new Date(),
      },
    });
    const token = await createSessionToken(user.id);
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    try { await prisma.auditLog.create({ data: { userId: user.id, action: 'signup', detail: JSON.stringify({ email: user.email, type: 'sponsor' }) } }); } catch { /* audit must not block */ }
    redirect('/sponsors');
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') redirect('/sponsor/sign-up?e=duplicate');
    throw err;
  }
}
