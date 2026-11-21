'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { MATCH } from '@/lib/config';
import { checkRateLimit } from '@/lib/rate-limit';
import { applyScheduleEdit, applyTemplateEdit, pauseSeries, resumeSeries } from '@/lib/series-ops';

const durationSchema = z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v), 'Pick a supported duration');
const daySchema = z.coerce.number().int().min(0).max(6);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const seriesEditSchema = z.object({
  seriesId: z.string(),
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  entry: z.enum(MATCH.entry as [string, ...string[]]),
  entryFee: z.string().trim().max(40).optional(),
  prize: z.enum(MATCH.prize as [string, ...string[]]),
  prizePool: z.string().trim().max(40).optional(),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  slots: z.coerce.number().int().positive().max(100000).optional(),
  durationMinutes: durationSchema,
  dayOfWeek: daySchema,
  startTimeLocal: timeSchema,
});

async function seriesSession(id: string, keyPrefix: string) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player/posted?e=role');
  const rl = await checkRateLimit(`${keyPrefix}:${id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/player/posted?e=rate');
  const stored = await prisma.matchSeries.findUnique({
    where: { id },
    select: { organizerId: true, title: true, mode: true, gameType: true, entry: true, prize: true, city: true, online: true, slots: true, durationMinutes: true, dayOfWeek: true, startTimeLocal: true, status: true },
  });
  if (!stored) redirect('/player/posted?e=forbidden');
  return { s, stored };
}

export async function editSeries(formData: FormData) {
  const id = String(formData.get('seriesId') ?? '');
  const { s, stored } = await seriesSession(id, 'editseries');
  if (stored.organizerId !== s.userId) redirect('/player/posted?e=forbidden');

  const parsed = seriesEditSchema.safeParse({
    seriesId: id,
    title: formData.get('title'), mode: formData.get('mode'), gameType: formData.get('gameType'),
    entry: formData.get('entry'), entryFee: formData.get('entryFee') || undefined,
    prize: formData.get('prize'), prizePool: formData.get('prizePool') || undefined, city: formData.get('city'),
    online: formData.get('online') ?? 'no', slots: formData.get('slots') || undefined,
    durationMinutes: formData.get('durationMinutes'), dayOfWeek: formData.get('dayOfWeek'), startTimeLocal: formData.get('startTimeLocal'),
  });
  if (!parsed.success) redirect('/player/posted?e=invalid');
  const d = parsed.data;

  const templateData = {
    title: d.title, mode: d.mode, gameType: d.gameType, entry: d.entry, entryFee: d.entryFee ?? null,
    prize: d.prize, prizePool: d.prizePool ?? null, city: d.city, online: d.online === 'yes', slots: d.slots,
    durationMinutes: d.durationMinutes, dayOfWeek: d.dayOfWeek, startTimeLocal: d.startTimeLocal,
  };
  await prisma.matchSeries.update({
    where: { id },
    data: templateData,
  });
  // Schedule change (spec §7, TP2): purge old 0-join slots + regenerate the window; template-only: propagate.
  if (stored.dayOfWeek !== d.dayOfWeek || stored.startTimeLocal !== d.startTimeLocal) await applyScheduleEdit(id);
  else await applyTemplateEdit(id, templateData);

  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'series_edit', detail: JSON.stringify({ seriesId: id, title: d.title }) } }); } catch {}
  revalidatePath('/matches');
  revalidatePath('/player/posted');
  redirect('/player/posted?e=edited');
}

export async function pauseSeriesAction(formData: FormData) {
  const id = String(formData.get('seriesId') ?? '');
  const { s, stored } = await seriesSession(id, 'pauseseries');
  if (stored.organizerId !== s.userId) redirect('/player/posted?e=forbidden');
  if (stored.status !== 'active') redirect('/player/posted?e=invalid');

  await pauseSeries(id);
  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'series_pause', detail: JSON.stringify({ seriesId: id }) } }); } catch {}
  revalidatePath('/matches');
  revalidatePath('/player/posted');
  redirect('/player/posted?e=paused');
}

export async function resumeSeriesAction(formData: FormData) {
  const id = String(formData.get('seriesId') ?? '');
  const { s, stored } = await seriesSession(id, 'resumeseries');
  if (stored.organizerId !== s.userId) redirect('/player/posted?e=forbidden');
  if (stored.status !== 'paused') redirect('/player/posted?e=invalid');

  await resumeSeries(id); // TP3: resumedAt resets the dead-occurrence window
  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'series_resume', detail: JSON.stringify({ seriesId: id }) } }); } catch {}
  revalidatePath('/matches');
  revalidatePath('/player/posted');
  redirect('/player/posted?e=resumed');
}

export async function setMatchStatus(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player');

  const matchId = String(formData.get('matchId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!matchId || !['open', 'closed'].includes(status)) redirect('/player/posted?e=invalid');

  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { organizerId: true } });
  if (!match || match.organizerId !== s.userId) redirect('/player/posted?e=forbidden');

  await prisma.match.update({ where: { id: matchId }, data: { status } });
  revalidatePath('/player/posted');
  redirect('/player/posted?done=1');
}
