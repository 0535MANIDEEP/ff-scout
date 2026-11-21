// MatchSeries: trust ladder (self-serve) + server helpers (eligibility, materialize, auto-pause).
// Uses the plan's Task 3 pure rules. Imports are relative so the test loader resolves them.

import { prisma } from './db';
import { MATCH } from './config';
import { qualifiesMatch, shouldAutoPause, endsAtFor, nextOccurrenceDates } from './schedule';

export type Eligibility = { // unlock rule (spec §3, §5): N completed hosted matches + K distinct non-host joiners
  unlocked: boolean;
  qualified: number;
  needed: number;
  activeSeries: number;
  cap: number;
};

// Host count toward ladder unlock — spec §5, status-independent (ending early counts).
export async function countQualifyingMatches(userId: string, now = new Date()): Promise<number> {
  const matches = await prisma.match.findMany({
    where: { organizerId: userId, endsAt: { lt: now } },
    select: { endsAt: true, entries: { select: { playerId: true } } },
  });
  return matches.filter(m => qualifiesMatch(userId, m.endsAt, m.entries.map(e => e.playerId), now, MATCH.trustLadderMinJoins)).length;
}

export async function seriesEligibility(userId: string): Promise<Eligibility> {
  const qualified = await countQualifyingMatches(userId);
  const activeSeries = await prisma.matchSeries.count({ where: { organizerId: userId, status: 'active' } });
  return {
    unlocked: qualified >= MATCH.trustLadderMinMatches && activeSeries < MATCH.activeSeriesCap,
    qualified,
    needed: MATCH.trustLadderMinMatches,
    activeSeries,
    cap: MATCH.activeSeriesCap,
  };
}

// Server-side materialize of `lookaheadWeeks` occurrences; stamps lastGeneratedAt; skipDuplicates on [seriesId, date].
export async function materializeSeries(seriesId: string, now = new Date()): Promise<number> {
  const series = await prisma.matchSeries.findUnique({ where: { id: seriesId } });
  if (!series || series.status !== 'active') return 0;
  const dates = nextOccurrenceDates(now, series.dayOfWeek, series.startTimeLocal, series.lookaheadWeeks);
  if (dates.length) {
    await prisma.match.createMany({
      data: dates.map(date => ({
        organizerId: series.organizerId,
        title: series.title,
        mode: series.mode,
        gameType: series.gameType,
        entry: series.entry,
        entryFee: series.entryFee,
        prize: series.prize,
        prizePool: series.prizePool,
        city: series.city,
        online: series.online,
        slots: series.slots,
        status: 'open',
        date,
        endsAt: endsAtFor(date, series.durationMinutes),
        seriesId,
      })),
      skipDuplicates: true,
    });
  }
  await prisma.matchSeries.update({ where: { id: seriesId }, data: { lastGeneratedAt: now } });
  return dates.length;
}

export async function autoPauseCheck(series: { id: string; resumedAt: Date | null; createdAt: Date }, now = new Date()): Promise<boolean> {
  const windowStart = series.resumedAt ?? series.createdAt;
  const finished = await prisma.match.findMany({
    where: { seriesId: series.id, endsAt: { lt: now }, date: { gte: windowStart } },
    orderBy: { date: 'desc' },
    take: MATCH.autoPauseAfterDeadOccurrences,
    select: { id: true, _count: { select: { entries: true } } },
  });
  if (shouldAutoPause(finished.map(f => f._count.entries), MATCH.autoPauseAfterDeadOccurrences)) {
    await prisma.matchSeries.update({ where: { id: series.id }, data: { status: 'paused' } });
    try {
      await prisma.auditLog.create({ data: { action: 'series:auto_pause', detail: JSON.stringify({ seriesId: series.id, deadOccurrences: finished.map(f => f.id) }) } });
    } catch { /* audit must not block */ }
    return true;
  }
  return false;
}
