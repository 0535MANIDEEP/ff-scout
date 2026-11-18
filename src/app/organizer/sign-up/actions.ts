'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  orgName: z.string().min(2),
  orgType: z.string().min(2),
  city: z.string().min(2),
});

export type ActionState = { ok: boolean; error?: string };

export async function registerOrganizer(_: ActionState, formData: FormData): Promise<ActionState> {
  const parse = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    orgName: formData.get('orgName'),
    orgType: formData.get('orgType'),
    city: formData.get('city'),
  });
  if (!parse.success) return { ok: false, error: 'Missing or invalid fields.' };
  const d = parse.data;
  const email = d.email.trim().toLowerCase();
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
  redirect('/organizer/shortlist');
}
