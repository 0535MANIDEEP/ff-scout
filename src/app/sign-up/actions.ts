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
  college: z.string().min(2),
  city: z.string().min(2),
  role: z.enum(['fragger','sniper','support','igled','lurker']),
  rank: z.enum(['Bronze','Silver','Gold','Diamond','Heroic','Master']),
});

export type ActionState = { ok: boolean; error?: string };

export async function registerPlayer(_: ActionState, formData: FormData): Promise<ActionState> {
  const parse = schema.safeParse({
    email: formData.get('email'),
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
  const email = d.email.trim().toLowerCase();
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
  redirect('/player');
}
