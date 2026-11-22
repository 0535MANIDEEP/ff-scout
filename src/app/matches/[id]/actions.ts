'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { joinMatch as joinMatchInService } from '@/features/matches/service';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { normalizeTeamName, isValidTeamName } from '@/lib/team';
import { revalidatePath } from 'next/cache';
import { PAYMENT_REPORT_CATEGORY, PAYMENT_REPORT_PAUSE_DAYS, PAYMENT_REPORT_THRESHOLD } from '@/lib/free-entry';

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
    result = await joinMatchInService(matchId);
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

const REPORT_CATEGORIES = [PAYMENT_REPORT_CATEGORY, 'fake_match', 'other'];

export async function reportMatch(formData: FormData) {
  const s = await session();
  if (!s) redirect('/login');
  const matchId = String(formData.get('matchId') ?? '');
  const category = String(formData.get('category') ?? '');
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 300);
  if (!matchId || !REPORT_CATEGORIES.includes(category) || !reason) redirect(`/matches/${matchId}?e=invalid`);

  let enforced = false;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.report.create({ data: { matchId, reporterId: s.id, category, reason } });
      // Only players who actually joined count. No reviewer sits between the
      // second report and the consequence.
      const joinedReports = await tx.report.count({
        where: {
          matchId,
          category: PAYMENT_REPORT_CATEGORY,
          reporter: { entries: { some: { matchId } } },
        },
      });
      if (joinedReports < PAYMENT_REPORT_THRESHOLD) return;
      const match = await tx.match.findUnique({ where: { id: matchId }, select: { organizerId: true } });
      if (!match) return;
      await tx.match.update({ where: { id: matchId }, data: { status: 'closed' } });
      await tx.user.update({
        where: { id: match.organizerId },
        data: { postingPausedUntil: new Date(Date.now() + PAYMENT_REPORT_PAUSE_DAYS * 24 * 60 * 60 * 1000) },
      });
      enforced = true;
    }, { isolationLevel: 'Serializable' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') redirect(`/matches/${matchId}?e=reported`);
    throw err;
  }
  if (enforced) {
    try {
      await prisma.auditLog.create({
        data: { userId: s.id, action: 'report:auto_pause', detail: JSON.stringify({ matchId, category }) },
      });
    } catch { /* audit must not block enforcement */ }
    revalidatePath('/matches');
    revalidatePath('/player/posted');
  }
  revalidatePath(`/matches/${matchId}`);
  redirect(`/matches/${matchId}?reported=1${enforced ? '&enforced=1' : ''}`);
}
