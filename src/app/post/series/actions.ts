'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { MATCH } from '@/lib/config';
import { seriesEligibility, materializeSeries } from '@/lib/series';
import { FREE_ENTRY_TERMS } from '@/lib/free-entry';

const schema = z.object({
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTimeLocal: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  durationMinutes: z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v)),
});

export async function createSeries(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/post/series?e=role');
  const host = await prisma.user.findUnique({ where: { id: s.id }, select: { postingPausedUntil: true } });
  if (host?.postingPausedUntil && host.postingPausedUntil.getTime() > Date.now()) redirect('/post/series?e=paused');

  const rl = await checkRateLimit(`createseries:${s.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/post/series?e=rate');

  const parsed = schema.safeParse({
    title: formData.get('title'), mode: formData.get('mode'), gameType: formData.get('gameType'),
    city: formData.get('city'),
    online: formData.get('online') ?? 'no', dayOfWeek: formData.get('dayOfWeek'),
    startTimeLocal: formData.get('startTimeLocal'), durationMinutes: formData.get('durationMinutes') ?? String(MATCH.defaultDurationMinutes),
  });
  if (!parsed.success) redirect('/post/series?e=invalid');
  const d = parsed.data;

  // Trust ladder gate (spec §3): exact real progress, same rule the UI shows.
  const eligibility = await seriesEligibility(s.id);
  if (!eligibility.unlocked) redirect('/player/posted?e=seriesLocked');

  const series = await prisma.matchSeries.create({
    data: {
      organizerId: s.id, title: d.title, mode: d.mode, gameType: d.gameType,
      ...FREE_ENTRY_TERMS, city: d.city, online: d.online === 'yes', slots: null,
      durationMinutes: d.durationMinutes, dayOfWeek: d.dayOfWeek, startTimeLocal: d.startTimeLocal, status: 'active',
    },
  });
  await materializeSeries(series.id); // Flag 4: second prong — materialize on create
  try {
    await prisma.auditLog.create({ data: { userId: s.id, action: 'series_create', detail: JSON.stringify({ id: series.id, title: d.title }) } });
  } catch { /* audit must not block */ }
  redirect('/player/posted?seriesDone=1');
}
