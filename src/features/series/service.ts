import 'server-only';
import { MATCH } from '@/lib/config';
import { FREE_ENTRY_TERMS } from '@/features/disclosure/copy';
import { qualifiesMatch, shouldAutoPause, endsAtFor, nextOccurrenceDates } from '@/features/trust/rules';
import {
  loadEligibilityData, loadHostedEndedMatches, generateOccurrences, evaluateAutoPause,
  applyTemplate, purgeAndRegenerate, pause, resume, findDueSeries, stampGeneratedAt,
} from './repository';

export type Eligibility = {
  unlocked: boolean;
  qualified: number;
  needed: number;
  activeSeries: number;
  cap: number;
};

type EndedMatch = { endsAt: Date; entries: { playerId: string }[] };

function qualifiedCount(matches: EndedMatch[], hostId: string, now: Date): number {
  return matches.filter(m => qualifiesMatch(hostId, m.endsAt, m.entries.map(e => e.playerId), now, MATCH.trustLadderMinJoins)).length;
}

function datesForSeries(now: Date) {
  return (s: { dayOfWeek: number; startTimeLocal: string; lookaheadWeeks: number }) =>
    nextOccurrenceDates(now, s.dayOfWeek, s.startTimeLocal, s.lookaheadWeeks);
}

// Host count toward ladder unlock — spec §5, status-independent (ending early counts).
export async function countQualifyingMatches(userId: string, now = new Date()): Promise<number> {
  const matches = await loadHostedEndedMatches(userId, now);
  return qualifiedCount(matches, userId, now);
}

export async function seriesEligibility(userId: string): Promise<Eligibility> {
  const now = new Date();
  const { endedMatches, activeSeries } = await loadEligibilityData(userId, now);
  const qualified = qualifiedCount(endedMatches, userId, now);
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
  return generateOccurrences(seriesId, now, FREE_ENTRY_TERMS, datesForSeries(now), endsAtFor);
}

export async function autoPauseCheck(series: { id: string; organizerId: string; resumedAt: Date | null; createdAt: Date }, now = new Date()): Promise<boolean> {
  return evaluateAutoPause(series, now, MATCH.autoPauseAfterDeadOccurrences,
    deadJoins => shouldAutoPause(deadJoins, MATCH.autoPauseAfterDeadOccurrences));
}

// Template edits propagate to future 0-join occurrences; joined ones keep their terms
// (bait-and-switch guard, spec §7). Entry and prize are fixed by the free-entry rule.
export async function applyTemplateEdit(seriesId: string, data: {
  title: string; mode: string; gameType: string; city: string; online: boolean;
  slots: number | undefined; durationMinutes: number;
}, now = new Date()) {
  await applyTemplate(seriesId, data, now, FREE_ENTRY_TERMS, endsAtFor);
}

// Schedule edits (dayOfWeek/startTimeLocal): purge future 0-join slots of the old schedule, keep joined,
// then regenerate the window at the new schedule (spec §7; TP2).
export async function applyScheduleEdit(seriesId: string, now = new Date()) {
  await purgeAndRegenerate(seriesId, now, FREE_ENTRY_TERMS, datesForSeries(now), endsAtFor);
}

// Pause: deletes future 0-join occurrences; joined futures stay for their players.
export async function pauseSeries(seriesId: string, now = new Date()) {
  await pause(seriesId, now);
}

// Resume: resets the auto-pause window (TP3), immediately materializes.
export async function resumeSeries(seriesId: string, now = new Date()) {
  await resume(seriesId, now, FREE_ENTRY_TERMS, datesForSeries(now), endsAtFor);
}

// Lazy sweep (Flag 4 + TP4): throttled per active series; auto-pause first; materialize; stamp.
// Every failure is caught — the board must render even when DB writes hiccup.
export async function runSeriesSweep(now = new Date()): Promise<number> {
  let touched = 0;
  try {
    const cutoff = new Date(now.getTime() - MATCH.lazyGenThrottleMinutes * 60_000);
    const due = await findDueSeries(cutoff);
    for (const series of due) {
      if (series.status !== 'active') continue;
      try {
        const paused = await autoPauseCheck(series, now); // auto-pause BEFORE generation (TP4 order)
        if (paused) {
          await stampGeneratedAt(series.id, now);
          touched++;
          continue;
        }
        touched += await materializeSeries(series.id, now);
      } catch { /* per-series fault isolation (TP4) */ }
    }
  } catch { /* sweep must never break the board (TP4) */ }
  return touched;
}
