'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/shared/auth/permissions';
import { revalidatePath } from 'next/cache';

export async function adminSetMatchStatus(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:moderate')) redirect('/player');

  const matchId = String(formData.get('matchId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!matchId || !['open', 'closed'].includes(status)) redirect('/admin/matches?e=invalid');

  await prisma.match.update({ where: { id: matchId }, data: { status } });
  try {
    await prisma.auditLog.create({ data: { userId: s.id, action: 'match_status', detail: JSON.stringify({ matchId, status }) } });
  } catch { /* audit must not block */ }
  revalidatePath('/admin/matches');
  redirect('/admin/matches?done=1');
}

export async function adminPauseSeries(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:moderate')) redirect('/player');

  const seriesId = String(formData.get('seriesId') ?? '');
  if (!seriesId) redirect('/admin/matches?e=invalid');
  const series = await prisma.matchSeries.findUnique({ where: { id: seriesId }, select: { id: true, status: true } });
  if (!series) redirect('/admin/matches?e=invalid');

  await prisma.matchSeries.update({ where: { id: seriesId }, data: { status: 'paused' } });
  try {
    await prisma.auditLog.create({ data: { userId: s.id, action: 'series_pause_admin', detail: JSON.stringify({ seriesId }) } });
  } catch { /* audit must not block */ }
  revalidatePath('/admin/matches');
  redirect('/admin/matches?done=1');
}
