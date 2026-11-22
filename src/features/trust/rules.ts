// Pure date math and qualification rules for MatchSeries. No imports —
// unit-tested in isolation via tsc compile (see test/schedule.test.js).

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // fixed +05:30 — never Intl or server-local time (TP2)

export function istDateParts(date: Date): { year: number; month: number; day: number } {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
}

export function istDayOfWeek(date: Date): number { // 0 = Sunday
  return new Date(date.getTime() + IST_OFFSET_MS).getUTCDay();
}

function istTimeToMs(startTimeLocal: string): number {
  const [h, m] = startTimeLocal.split(':').map(Number);
  return (h * 60 + m) * 60_000;
}

// Absolute time of "IST calendar date `d` at `startTimeLocal`" = Date.UTC(d) + T - offset.
function occurrenceAt(year: number, month: number, day: number, startTimeLocal: string): Date {
  return new Date(Date.UTC(year, month, day) + istTimeToMs(startTimeLocal) - IST_OFFSET_MS);
}

// Next weekly occurrence of `dayOfWeek` at `startTimeLocal` strictly after `from`.
export function nextWeeklyOccurrence(from: Date, dayOfWeek: number, startTimeLocal: string): Date {
  for (let i = 0; i <= 7; i++) {
    const { year, month, day } = istDateParts(new Date(from.getTime() + i * 86_400_000));
    const candidate = occurrenceAt(year, month, day, startTimeLocal);
    if (candidate.getTime() > from.getTime() && istDayOfWeek(candidate) === dayOfWeek) return candidate;
  }
  throw new Error('nextWeeklyOccurrence: no match in range (unreachable)');
}

// `weeks` upcoming weekly occurrences of the series cadence, starting from the next one.
export function nextOccurrenceDates(from: Date, dayOfWeek: number, startTimeLocal: string, weeks: number): Date[] {
  const first = nextWeeklyOccurrence(from, dayOfWeek, startTimeLocal);
  const out: Date[] = [];
  for (let i = 0; i < weeks; i++) out.push(new Date(first.getTime() + i * 7 * 86_400_000));
  return out;
}

export function endsAtFor(date: Date, durationMinutes: number): Date {
  return new Date(date.getTime() + durationMinutes * 60_000);
}

// Trust ladder qualification (spec §5, status-independent):
// `endsAt < now` AND distinct joiners excluding host >= minJoins — regardless of status.
export function qualifiesMatch(hostId: string, endsAt: Date, joinerIds: string[], now: Date, minJoins: number): boolean {
  if (!(endsAt.getTime() < now.getTime())) return false;
  const distinct = new Set(joinerIds.filter(id => id !== hostId));
  return distinct.size >= minJoins;
}

// Auto-pause gate (spec §6): caller passes the latest `pauseAfter` finished
// occurrences' join counts; pause when there are N of them and all are 0.
export function shouldAutoPause(deadJoins: number[], pauseAfter: number): boolean {
  return deadJoins.length === pauseAfter && deadJoins.every(j => j === 0);
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Honest cue for the board chip, e.g. "Weekly · Fri 8 PM IST".
export function seriesCueLabel(dayOfWeek: number, startTimeLocal: string): string {
  const [h, m] = startTimeLocal.split(':').map(Number);
  const h12 = h % 12 || 12;
  const minutes = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `Weekly · ${DAY_LABELS[dayOfWeek]} ${h12}${minutes} ${h < 12 ? 'AM' : 'PM'} IST`;
}
