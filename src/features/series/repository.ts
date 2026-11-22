import 'server-only';
import { prisma } from '@/shared/db/client';

type SeriesRow = {
  id: string; organizerId: string; title: string; mode: string; gameType: string;
  city: string; online: boolean; slots: number | null; durationMinutes: number;
  dayOfWeek: number; startTimeLocal: string; lookaheadWeeks: number;
  status: string; resumedAt: Date | null; createdAt: Date;
};
type FreeEntryTerms = { entry: string; entryFee: null; prize: string; prizePool: null };
type DatesFor = (series: SeriesRow) => Date[];
type EndsAtFor = (date: Date, durationMinutes: number) => Date;

export async function loadEligibilityData(userId: string, now: Date) {
  const endedMatches = await prisma.match.findMany({
    where: { organizerId: userId, endsAt: { lt: now } },
    select: { endsAt: true, entries: { select: { playerId: true } } },
  });
  const activeSeries = await prisma.matchSeries.count({ where: { organizerId: userId, status: 'active' } });
  return { endedMatches, activeSeries };
}

export async function loadHostedEndedMatches(userId: string, now: Date) {
  return prisma.match.findMany({
    where: { organizerId: userId, endsAt: { lt: now } },
    select: { endsAt: true, entries: { select: { playerId: true } } },
  });
}

async function insertOccurrences(series: SeriesRow, dates: Date[], now: Date, terms: FreeEntryTerms, endsAt: EndsAtFor) {
  if (dates.length) {
    await prisma.match.createMany({
      data: dates.map(date => ({
        organizerId: series.organizerId,
        title: series.title,
        mode: series.mode,
        gameType: series.gameType,
        entry: terms.entry,
        entryFee: terms.entryFee,
        prize: terms.prize,
        prizePool: terms.prizePool,
        city: series.city,
        online: series.online,
        slots: series.slots,
        status: 'open',
        date,
        endsAt: endsAt(date, series.durationMinutes),
        seriesId: series.id,
      })),
      skipDuplicates: true,
    });
  }
  await prisma.matchSeries.update({ where: { id: series.id }, data: { lastGeneratedAt: now } });
  return dates.length;
}

export async function generateOccurrences(seriesId: string, now: Date, terms: FreeEntryTerms, datesFor: DatesFor, endsAt: EndsAtFor) {
  const series = await prisma.matchSeries.findUnique({ where: { id: seriesId } });
  if (!series || series.status !== 'active') return 0;
  return insertOccurrences(series, datesFor(series), now, terms, endsAt);
}

export async function evaluateAutoPause(
  series: { id: string; organizerId: string; resumedAt: Date | null; createdAt: Date },
  now: Date,
  pauseAfter: number,
  gate: (deadJoins: number[]) => boolean,
) {
  const windowStart = series.resumedAt ?? series.createdAt;
  const finished = await prisma.match.findMany({
    where: { seriesId: series.id, endsAt: { lt: now }, date: { gte: windowStart } },
    orderBy: { date: 'desc' },
    take: pauseAfter,
    select: { id: true, _count: { select: { entries: true } } },
  });
  if (!gate(finished.map(f => f._count.entries))) return false;
  await prisma.matchSeries.update({ where: { id: series.id }, data: { status: 'paused' } });
  try {
    await prisma.auditLog.create({ data: { userId: series.organizerId, action: 'series:auto_pause', detail: JSON.stringify({ seriesId: series.id, deadOccurrences: finished.map(f => f.id) }) } });
  } catch { /* audit must not block */ }
  return true;
}

export async function applyTemplate(
  seriesId: string,
  data: {
    title: string; mode: string; gameType: string; city: string; online: boolean;
    slots: number | undefined; durationMinutes: number;
  },
  now: Date,
  terms: FreeEntryTerms,
  endsAt: EndsAtFor,
) {
  const affected = await prisma.match.findMany({
    where: { seriesId, date: { gt: now }, entries: { none: {} } },
    select: { id: true, date: true },
  });
  for (const m of affected) {
    await prisma.match.update({ where: { id: m.id }, data: {
      title: data.title, mode: data.mode, gameType: data.gameType,
      ...terms, city: data.city, online: data.online, slots: data.slots ?? null,
      endsAt: endsAt(m.date, data.durationMinutes),
    } });
  }
  await prisma.matchSeries.update({ where: { id: seriesId }, data: {
    title: data.title, mode: data.mode, gameType: data.gameType,
    ...terms, city: data.city, online: data.online, slots: data.slots ?? null,
    durationMinutes: data.durationMinutes,
  } });
}

export async function purgeAndRegenerate(seriesId: string, now: Date, terms: FreeEntryTerms, datesFor: DatesFor, endsAt: EndsAtFor) {
  await prisma.match.deleteMany({ where: { seriesId, date: { gt: now }, entries: { none: {} } } });
  const series = await prisma.matchSeries.findUnique({ where: { id: seriesId } });
  if (!series || series.status !== 'active') return 0;
  return insertOccurrences(series, datesFor(series), now, terms, endsAt);
}

export async function pause(seriesId: string, now: Date) {
  await prisma.match.deleteMany({ where: { seriesId, date: { gt: now }, entries: { none: {} } } });
  await prisma.matchSeries.updateMany({ where: { id: seriesId }, data: { status: 'paused' } });
}

export async function resume(seriesId: string, now: Date, terms: FreeEntryTerms, datesFor: DatesFor, endsAt: EndsAtFor) {
  await prisma.matchSeries.updateMany({ where: { id: seriesId }, data: { status: 'active', resumedAt: now } });
  const series = await prisma.matchSeries.findUnique({ where: { id: seriesId } });
  if (!series || series.status !== 'active') return 0;
  return insertOccurrences(series, datesFor(series), now, terms, endsAt);
}

export async function findDueSeries(cutoff: Date) {
  return prisma.matchSeries.findMany({
    where: { status: 'active', OR: [{ lastGeneratedAt: null }, { lastGeneratedAt: { lt: cutoff } }] },
  });
}

export async function stampGeneratedAt(seriesId: string, now: Date) {
  await prisma.matchSeries.update({ where: { id: seriesId }, data: { lastGeneratedAt: now } });
}
