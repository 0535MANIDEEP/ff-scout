import { prisma } from './db';
import { materializeSeries } from './series';
import { endsAtFor } from './schedule';

// Future occurrences with zero joins: the freeze set for template edits (spec §7).
async function zeroJoinFuture(seriesId: string, now: Date) {
  return prisma.match.findMany({
    where: { seriesId, date: { gt: now }, entries: { none: {} } },
    select: { id: true, date: true },
  });
}

// Template edits (title/mode/gameType/entry/entryFee/prize/prizePool/city/online/slots/durationMinutes):
// propagate to future 0-join occurrences; joined ones keep their terms (bait-and-switch guard, spec §7).
export async function applyTemplateEdit(seriesId: string, data: {
  title: string; mode: string; gameType: string; entry: string; entryFee: string | null;
  prize: string; prizePool: string | null; city: string; online: boolean; slots: number | undefined;
  durationMinutes: number;
}, now = new Date()) {
  const affected = await zeroJoinFuture(seriesId, now);
  for (const m of affected) {
    await prisma.match.update({ where: { id: m.id }, data: {
      title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, entryFee: data.entryFee,
      prize: data.prize, prizePool: data.prizePool, city: data.city, online: data.online, slots: data.slots ?? null,
      endsAt: endsAtFor(m.date, data.durationMinutes),
    } });
  }
  await prisma.matchSeries.update({ where: { id: seriesId }, data: {
    title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, prize: data.prize,
    city: data.city, online: data.online, slots: data.slots ?? null, durationMinutes: data.durationMinutes,
  } });
}

// Schedule edits (dayOfWeek/startTimeLocal): purge future 0-join slots of the old schedule, keep joined,
// then regenerate the window at the new schedule (spec §7; TP2).
export async function applyScheduleEdit(seriesId: string, now = new Date()) {
  await prisma.match.deleteMany({ where: { seriesId, date: { gt: now }, entries: { none: {} } } });
  await materializeSeries(seriesId, now);
}

// Pause: deletes future 0-join occurrences; joined futures stay for their players.
export async function pauseSeries(seriesId: string, now = new Date()) {
  await prisma.match.deleteMany({ where: { seriesId, date: { gt: now }, entries: { none: {} } } });
  await prisma.matchSeries.updateMany({ where: { id: seriesId }, data: { status: 'paused' } });
}

// Resume: resets the auto-pause window (TP3), immediately materializes.
export async function resumeSeries(seriesId: string, now = new Date()) {
  await prisma.matchSeries.updateMany({ where: { id: seriesId }, data: { status: 'active', resumedAt: now } });
  await materializeSeries(seriesId, now);
}
