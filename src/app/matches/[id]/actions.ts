'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { joinMatch as joinMatchInService } from '@/features/matches/service';
import { reportMatch as reportMatchService } from '@/features/reports/service';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { normalizeTeamName, isValidTeamName } from '@/lib/team';
import { revalidatePath } from 'next/cache';

async function session() {
  return getCurrentUser();
}

export async function joinMatch(formData: FormData) {
  const s = await session();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:join')) redirect('/player');
  const matchId = String(formData.get('matchId') ?? '');
  if (!matchId) redirect('/matches?e=invalid');

  const teamRaw = formData.get('teamName');
  const teamName = normalizeTeamName(typeof teamRaw === 'string' ? teamRaw : null);
  if (teamName && !isValidTeamName(teamName)) redirect(`/matches/${matchId}?e=team`);

  let result;
  try {
    result = await joinMatchInService(matchId, teamName);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') redirect(`/matches/${matchId}?e=already`);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') redirect(`/matches/${matchId}?e=retry`);
    throw err;
  }
  if (!result.ok) {
    if (result.reason === 'CLOSED') redirect(`/matches/${matchId}?e=closed`);
    if (result.reason === 'HOST') redirect(`/matches/${matchId}?e=already`);
    if (result.reason === 'DUPLICATE') redirect(`/matches/${matchId}?e=already`);
    if (result.reason === 'FULL') redirect(`/matches/${matchId}?e=full`);
  }
  revalidatePath(`/matches/${matchId}`);
  revalidatePath('/player');
  redirect(`/matches/${matchId}?joined=1`);
}

export async function leaveMatch(formData: FormData) {
  const s = await session();
  if (!s) redirect('/login');
  const matchId = String(formData.get('matchId') ?? '');
  if (!matchId) redirect('/player?e=invalid');

  const m = await prisma.match.findUnique({ where: { id: matchId }, select: { slots: true } });
  await prisma.matchEntry.deleteMany({ where: { matchId, playerId: s.id } });
  if (m?.slots != null) {
    await prisma.match.update({ where: { id: matchId }, data: { slots: { increment: 1 } } });
  }
  revalidatePath(`/matches/${matchId}`);
  revalidatePath('/player');
  redirect(`/player?done=1`);
}

export async function reportMatch(formData: FormData) {
  const s = await session();
  if (!s) redirect('/login');
  const matchId = String(formData.get('matchId') ?? '');
  const category = String(formData.get('category') ?? '');
  const result = await reportMatchService({
    matchId,
    category,
    reason: String(formData.get('reason') ?? ''),
  });

  if (!result.ok) {
    if (result.reason === 'DUPLICATE') redirect(`/matches/${matchId}?e=reported`);
    redirect(`/matches/${matchId}?e=invalid`);
  }
  if (result.enforced) {
    try {
      await prisma.auditLog.create({
        data: { userId: s.id, action: 'report:auto_pause', detail: JSON.stringify({ matchId, category }) },
      });
    } catch { /* audit must not block enforcement */ }
    revalidatePath('/matches');
    revalidatePath('/player/posted');
  }
  revalidatePath(`/matches/${matchId}`);
  redirect(`/matches/${matchId}?reported=1${result.enforced ? '&enforced=1' : ''}`);
}
