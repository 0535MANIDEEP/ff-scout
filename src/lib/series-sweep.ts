import { prisma } from './db';
import { MATCH } from './config';
import { autoPauseCheck, materializeSeries } from './series';

// Lazy sweep (Flag 4 + TP4): throttled per active series; auto-pause first; materialize; stamp.
// Every failure is caught — the board must render even when DB writes hiccup.
export async function runSeriesSweep(now = new Date()): Promise<number> {
  let touched = 0;
  try {
    const cutoff = new Date(now.getTime() - MATCH.lazyGenThrottleMinutes * 60_000);
    const due = await prisma.matchSeries.findMany({
      where: { status: 'active', OR: [{ lastGeneratedAt: null }, { lastGeneratedAt: { lt: cutoff } }] },
    });
    for (const series of due) {
      if (series.status !== 'active') continue;
      try {
        const paused = await autoPauseCheck(series, now); // auto-pause BEFORE generation (TP4 order)
        if (paused) {
          await prisma.matchSeries.update({ where: { id: series.id }, data: { lastGeneratedAt: now } });
          touched++;
          continue;
        }
        touched += await materializeSeries(series.id, now);
      } catch { /* per-series fault isolation (TP4) */ }
    }
  } catch { /* sweep must never break the board (TP4) */ }
  return touched;
}
