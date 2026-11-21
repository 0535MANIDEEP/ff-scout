'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { MATCH } from '@/lib/config';
import { endsAtFor } from '@/lib/schedule';

const schema = z.object({
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  entry: z.enum(MATCH.entry as [string, ...string[]]),
  entryFee: z.string().trim().max(40).optional(),
  prize: z.enum(MATCH.prize as [string, ...string[]]),
  prizePool: z.string().trim().max(40).optional(),
  date: z.coerce.date(),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  slots: z.coerce.number().int().positive().max(100000).optional(),
  contact: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  durationMinutes: z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v), 'Pick a supported duration'),
});

export async function createMatch(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const rl = await checkRateLimit(`postmatch:${s.userId}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/post?e=rate');

  const parsed = schema.safeParse({
    title: formData.get('title'),
    mode: formData.get('mode'),
    gameType: formData.get('gameType'),
    entry: formData.get('entry'),
    entryFee: formData.get('entryFee') || undefined,
    prize: formData.get('prize'),
    prizePool: formData.get('prizePool') || undefined,
    date: formData.get('date'),
    city: formData.get('city'),
    online: formData.get('online') ?? 'no',
    slots: formData.get('slots') || undefined,
    contact: formData.get('contact') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) redirect('/post?e=invalid');
  const d = parsed.data;

  if (d.entry === 'paid' && !d.entryFee) redirect('/post?e=fee');
  if (d.prize === 'pool' && !d.prizePool) redirect('/post?e=prize');
  if (d.date.getTime() < Date.now() - 60 * 60 * 1000) redirect('/post?e=date');

  await prisma.match.create({
    data: {
      organizerId: s.userId,
      title: d.title,
      mode: d.mode,
      gameType: d.gameType,
      entry: d.entry,
      entryFee: d.entryFee ?? null,
      prize: d.prize,
      prizePool: d.prizePool ?? null,
      status: 'open',
      date: d.date,
      endsAt: endsAtFor(d.date, d.durationMinutes), // Q1: stored at write time
      city: d.city,
      online: d.online === 'yes',
      slots: d.slots ?? null,
      contact: d.contact ?? null,
      notes: d.notes ?? null,
    },
  });
  try {
    await prisma.auditLog.create({ data: { userId: s.userId, action: 'match_create', detail: JSON.stringify({ title: d.title }) } });
  } catch { /* audit must not block the post */ }
  redirect('/player/posted?done=1');
}
