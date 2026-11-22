'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { MATCH } from '@/lib/config';
import { endsAtFor } from '@/lib/schedule';
import { FREE_ENTRY_TERMS } from '@/lib/free-entry';

const schema = z.object({
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  date: z.coerce.date(),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  slots: z.coerce.number().int().positive().max(100000).optional(),
  contact: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  durationMinutes: z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v), 'Pick a supported duration'),
});

export async function createMatch(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');
  const host = await prisma.user.findUnique({ where: { id: s.id }, select: { postingPausedUntil: true } });
  if (host?.postingPausedUntil && host.postingPausedUntil.getTime() > Date.now()) redirect('/post?e=paused');

  const rl = await checkRateLimit(`postmatch:${s.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/post?e=rate');

  const parsed = schema.safeParse({
    title: formData.get('title'),
    mode: formData.get('mode'),
    gameType: formData.get('gameType'),
    date: formData.get('date'),
    durationMinutes: formData.get('durationMinutes'),
    city: formData.get('city'),
    online: formData.get('online') ?? 'no',
    slots: formData.get('slots') || undefined,
    contact: formData.get('contact') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) redirect('/post?e=invalid');
  const d = parsed.data;

  if (d.date.getTime() < Date.now() - 60 * 60 * 1000) redirect('/post?e=date');

  await prisma.match.create({
    data: {
      organizerId: s.id,
      title: d.title,
      mode: d.mode,
      gameType: d.gameType,
      ...FREE_ENTRY_TERMS,
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
    await prisma.auditLog.create({ data: { userId: s.id, action: 'match_create', detail: JSON.stringify({ title: d.title }) } });
  } catch { /* audit must not block the post */ }
  redirect('/player/posted?done=1');
}
