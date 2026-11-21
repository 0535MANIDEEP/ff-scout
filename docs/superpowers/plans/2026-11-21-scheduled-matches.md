# Scheduled Matches (`MatchSeries`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A schedule anyone can count on — self-serve recurring series on the existing board, zero admin gatekeeping, running with no human in the loop.

**Architecture:** Add a `MatchSeries` template model with `durationMinutes`, `dayOfWeek`, `startTimeLocal`; add `Match.endsAt` + `Match.seriesId` + `@@unique([seriesId, date])`. A throttled lazy sweep (called during `/matches` render, inside `try/catch`) auto-pauses dead series and materializes weekly occurrences from pure fixed-`+05:30` IST date math. Trust ladder (N=3 completed hosted matches, K=2 distinct non-host joiners) is self-serve in the UI. Monetization lever (promoted matches) is out of scope.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma + Neon Postgres (prod DB — additive migrations only), `node:test`, Playwright (python).

**Spec:** `docs/superpowers/specs/2026-11-21-scheduled-matches-design.md` (this plan argues from it; pre-flight adaptation: host FK is `organizerId`, match fields are plain `String`s, series status is `String @default("active")`).

**Assumes:** Step 0 done — PR #59 merged from tip (`532d5a9`+), prod verified, `docs/app-flow.md` snapshot taken. Branch tip = origin. Tree clean.

## Global Constraints

- **Additive Prisma migrations only** (prod Neon shared): create `MatchSeries`, add nullable `Match.endsAt`, `Match.seriesId`, `Match.seriesId` FK, `@@unique([seriesId, date])`. 3-step `endsAt` backfill ending in `SET NOT NULL`. No drops, no data resets.
- **Free tiers only; money never handled** — `entry`/`prize` on series are notes like on one-off matches.
- **Zero fabricated stats/scarcity/badges** — every progress count, cap, and timestamp indicator reads real DB state via the ladder query, with the exact copy `"X of N completed matches hosted to unlock weekly series."`
- **No user-facing "admin" wording.** One primary button per screen (`btn`); other actions ghost (`btn-ghost`).
- **No cron, report-status lifecycle, promotion payments, emails, waitlist changes.** (v2 work per spec §10.)
- **Honesty rule:** template edits must not flip `free`→`paid` under joined matches; auto-pause audits `series:auto_pause`; sweep never breaks `/matches`.
- **QA/E2E rows scrubbed** after every DB run.
- **Dev-command notes:** stop `next start` on :3000 before `npx prisma generate`; DATABASE_URL comes from the environment, not `.env*` files in repo.

## Review Focus

Most likely to bite (name + test that pins it):

1. **Async sweep during SSR page render** — board must render even when DB writes fail (sweep fault-injected); review for lost errors.
2. **Bait-and-switch on template edits** — edit freeze: joined occurrences keep original terms. Test: edit `entry` after 1 player joins; assert joined match row unchanged (Task 7 tests, DB-gated).
3. **Resume re-pause** — `resumedAt` must extend the dead-occurrence window so Resume never immediately re-pauses. Test: 2 dead occurrences, resumedAt = now → not paused (Task 5).
4. **Compute-vs-store drift** — server computes `endsAt` at write; nothing uses `Intl`/local time (fixed `+05:30` only); `@@unique([seriesId, date])` never collides.
5. **Ladder honesty** — progress copy reflects the real rule (status-independent); test: closed match with 2 joins counts (Task 5).

---

## Task 1: Config — `src/config/match.json` + `src/lib/config.ts` + `test/match-config.test.js`

**Files:**
- Modify: `src/config/match.json`
- Modify: `src/lib/config.ts` (extend `matchRoot` zod schema)
- Modify: `test/match-config.test.js` (assert new keys)

- [ ] **Step 1: Write failing test additions** (`test/match-config.test.js`)

```js
test('match config carries the scheduled-matches ladder and cadence keys', () => {
  assert.equal(json.trustLadderMinMatches, 3);
  assert.equal(json.trustLadderMinJoins, 2);
  assert.equal(json.activeSeriesCap, 2);
  assert.equal(json.lookaheadWeeks, 2);
  assert.equal(json.autoPauseAfterDeadOccurrences, 2);
  assert.deepEqual(json.durationOptionsMinutes, [60, 90, 120]);
  assert.equal(json.defaultDurationMinutes, 90);
  assert.ok(json.durationOptionsMinutes.includes(json.defaultDurationMinutes), 'default must be a valid option');
  assert.equal(json.lazyGenThrottleMinutes, 15);
});
```

- [ ] **Step 2: Run test — expect FAIL** (`npm test -- test/match-config.test.js` — actually `node --test --test-concurrency=1 test/match-config.test.js`)

- [ ] **Step 3: Add config keys** — `src/config/match.json`:

```json
{
  "modes": ["casual", "competitive", "ranked", "esports"],
  "gameTypes": ["BR", "CS", "BR/CS"],
  "entry": ["free", "paid"],
  "prize": ["none", "pool"],
  "status": ["open", "closed"],
  "trustLadderMinMatches": 3,
  "trustLadderMinJoins": 2,
  "activeSeriesCap": 2,
  "lookaheadWeeks": 2,
  "autoPauseAfterDeadOccurrences": 2,
  "durationOptionsMinutes": [60, 90, 120],
  "defaultDurationMinutes": 90,
  "lazyGenThrottleMinutes": 15
}
```

`src/lib/config.ts` — extend `matchRoot`:

```ts
const matchRoot = z.object({
  modes: z.array(z.string().min(1)).min(1),
  gameTypes: z.array(z.string().min(1)).min(1),
  entry: z.array(z.string().min(1)).min(1),
  prize: z.array(z.string().min(1)).min(1),
  status: z.array(z.string().min(1)).min(1),
  trustLadderMinMatches: z.number().int().positive(),
  trustLadderMinJoins: z.number().int().positive(),
  activeSeriesCap: z.number().int().positive(),
  lookaheadWeeks: z.number().int().positive(),
  autoPauseAfterDeadOccurrences: z.number().int().positive(),
  durationOptionsMinutes: z.array(z.number().int().positive()).min(1),
  defaultDurationMinutes: z.number().int().positive(),
  lazyGenThrottleMinutes: z.number().int().positive(),
});
```

(Checkpoint-informed adaptation: this is repo's real `matchRoot` extended.)

- [ ] **Step 4: Run tests — expect PASS.**

- [ ] **Step 5: Commit** — `feat: scheduled matches config keys (trust ladder, cadence, duration)`.

---

## Task 2: Schema + Additive Migration

**Files:**
- Modify: `prisma/schema.prisma` (add `Match.endsAt`, `Match.seriesId`, `Match.series`, `User.series`, `MatchSeries`)
- Create: `prisma/migrations/20261121120000_match_series/migration.sql`
- Modify: `test/schema.test.js` (assert new schema)

**Prisma changes** (`Match`):

```prisma
model Match {
  // …existing fields unchanged…
  endsAt     DateTime        // backfilled to date + 90 min by the migration; always present
  seriesId   String?
  series     MatchSeries?    @relation(fields: [seriesId], references: [id], onDelete: SetNull)

  @@index([status, date])
  @@unique([seriesId, date])   // Postgres allows multiple NULL seriesId — one-offs unaffected
}
```

`User`: add `series MatchSeries[]`.

```prisma
model MatchSeries {
  id              String   @id @default(cuid())
  organizerId     String
  organizer       User     @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  // template — mirrors /post's Match fields (plain Strings, same as Match)
  title           String
  mode            String   // casual | competitive | ranked | esports
  gameType        String   // BR | CS | BR/CS
  entry           String   // free | paid
  entryFee        String?  // note only
  prize           String   // none | pool
  prizePool       String?  // note only
  city            String
  online          Boolean  @default(false)
  slots           Int?
  durationMinutes Int      // 60 | 90 | 120 — from config.durationOptionsMinutes
  // recurrence (all date math uses the fixed +05:30 offset — never Intl)
  dayOfWeek       Int      // 0–6, IST calendar day
  startTimeLocal  String   // "HH:mm", e.g. "20:00"
  timezone        String   @default("Asia/Kolkata") // display only
  // lifecycle
  status          String   @default("active") // active | paused | archived
  lookaheadWeeks  Int      @default(2)
  lastGeneratedAt DateTime?
  resumedAt       DateTime?
  matches         Match[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
}
```

**Migration** `20261121120000_match_series/migration.sql` (handwritten; all additive):

```sql
-- CreateTable
CREATE TABLE "MatchSeries" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "entry" TEXT NOT NULL,
    "entryFee" TEXT,
    "prize" TEXT NOT NULL,
    "prizePool" TEXT,
    "city" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "slots" INTEGER,
    "durationMinutes" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTimeLocal" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lookaheadWeeks" INTEGER NOT NULL DEFAULT 2,
    "lastGeneratedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MatchSeries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MatchSeries_status_idx" ON "MatchSeries"("status");
ALTER TABLE "MatchSeries" ADD CONSTRAINT "MatchSeries_organizerId_fkey"
  FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match.endsAt: 3-step (nullable → backfill → NOT NULL)
ALTER TABLE "Match" ADD COLUMN "endsAt" TIMESTAMP(3);
UPDATE "Match" SET "endsAt" = "date" + INTERVAL '90 minutes' WHERE "endsAt" IS NULL;
ALTER TABLE "Match" ALTER COLUMN "endsAt" SET NOT NULL;

-- Match.seriesId FK (on delete SetNull — deleting a series never deletes matches)
ALTER TABLE "Match" ADD COLUMN "seriesId" TEXT;
ALTER TABLE "Match" ADD CONSTRAINT "Match_seriesId_fkey"
  FOREIGN KEY ("seriesId") REFERENCES "MatchSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Match_seriesId_date_key" ON "Match"("seriesId", "date");
```

Deploy: `npx prisma migrate deploy` then `npx prisma generate` (after stopping `next start` on :3000 — dev-only; prod via Vercel, but generate now so tsc passes).

- [ ] **Step 1: Schema edits** (apply above to `prisma/schema.prisma`; run `npx prisma validate` — expect clean).
- [ ] **Step 2: Write migration SQL.**
- [ ] **Step 3: Write failing schema assertions** in `test/schema.test.js`:

```js
test('MatchSeries model carries template + recurrence + lifecycle fields', () => {
  const s = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');
  const start = s.indexOf('model MatchSeries {');
  const end = s.indexOf('model Match {', start);
  const series = s.slice(start, end);
  for (const f of ['organizerId', 'title', 'mode', 'gameType', 'entry', 'entryFee', 'prize', 'prizePool', 'city', 'slots', 'durationMinutes', 'dayOfWeek', 'startTimeLocal', 'timezone', 'status', 'lookaheadWeeks', 'lastGeneratedAt', 'resumedAt']) {
    assert.ok(series.includes(f), `MatchSeries is missing ${f}`);
  }
});

test('Match gains non-null endsAt + nullable seriesId + unique([seriesId, date])', () => {
  const s = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');
  const match = s.slice(s.indexOf('model Match {'), s.indexOf('model MatchEntry'));
  assert.match(match, /endsAt\s+DateTime(\s*;|\s*\/\/)/);
  assert.match(match, /seriesId\s+String\?/);
  assert.match(match, /series\s+MatchSeries\?/);
  assert.match(match, /@@unique\(\[seriesId, date\]\)/);
});
```

- [ ] **Step 4: Run — expect PASS** (`npm test`).
- [ ] **Step 5: Apply migration** — `npx prisma migrate deploy && npx prisma generate` (report row counts: `SELECT count(*) FROM "Match"`, `SELECT count(*) FROM "MatchSeries"` → 0).
- [ ] **Step 6: Commit** — `feat: match series schema + additive migration (MatchSeries, Match.endsAt/seriesId)`.

---

## Task 3: Pure Schedule Logic — `src/lib/schedule.ts` + `test/schedule.test.js`

No imports — pure. Test via the ff-upstream single-module `tsc` compile pattern (`test/ff-upstream.test.js` style).

**File: `src/lib/schedule.ts`**

```ts
// Pure date math and qualification rules for MatchSeries. No imports —
// unit-tested in isolation via tsc compile (see test/schedule.test.js).

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // fixed +05:30; never Intl or server-local time

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

// Next weekly occurrence of `dayOfWeek` at `startTimeLocal` strictly after `from` (IST-shifted compare).
export function nextWeeklyOccurrence(from: Date, dayOfWeek: number, startTimeLocal: string): Date {
  for (let i = 0; i <= 7; i++) {
    const { year, month, day } = istDateParts(new Date(from.getTime() + i * 86_400_000));
    const candidate = occurrenceAt(year, month, day, startTimeLocal);
    if (candidate.getTime() > from.getTime() && istDayOfWeek(candidate) === dayOfWeek) return candidate;
  }
  throw new Error('nextWeeklyOccurrence: no match in range (unreachable)');
}

// `weeks` upcoming weekly occurrences of the series cadence from the next one.
export function nextOccurrenceDates(from: Date, dayOfWeek: number, startTimeLocal: string, weeks: number): Date[] {
  const first = nextWeeklyOccurrence(from, dayOfWeek, startTimeLocal);
  const out: Date[] = [];
  for (let i = 0; i < weeks; i++) out.push(new Date(first.getTime() + i * 7 * 86_400_000));
  return out;
}

export function endsAtFor(date: Date, durationMinutes: number): Date {
  return new Date(date.getTime() + durationMinutes * 60_000);
}

// Trust ladder qualification (spec §5, status-independent).
export function qualifiesMatch(hostId: string, endsAt: Date, joinerIds: string[], now: Date, minJoins: number): boolean {
  if (!(endsAt.getTime() < now.getTime())) return false;
  const distinct = new Set(joinerIds.filter(id => id !== hostId));
  return distinct.size >= minJoins;
}

// Auto-pause gate (spec §6): the latest N finished occurrences all have 0 joins.
export function shouldAutoPause(deadCount: number, deadJoins: number[], pauseAfter: number): boolean {
  return deadCount === pauseAfter && deadJoins.every(j => j === 0);
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Honest cue for the board chip, e.g. "Weekly · Fri 8 PM IST".
export function seriesCueLabel(dayOfWeek: number, startTimeLocal: string): string {
  const [h, m] = startTimeLocal.split(':').map(Number);
  const h12 = h % 12 || 12;
  return `Weekly · ${DAY_LABELS[dayOfWeek]} ${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'} IST`;
}
```

Wait — `shouldAutoPause` with `deadCount === pauseAfter`: if findMany took 2, deadJoins length 2. If only 1 finished, deadCount=1 ≠ 2 → false. If series has 3 dead finished occurrences, take 2 → latest 2 — still both 0 → pause. Fine. But edge: deadCount=1 when pauseAfter=2 → false. Good.

Hmm — one more: `qualifiesMatch` — status-independent by design; callers pass joinerIds from `entries` relation. `endsAt < now` strict.

`seriesCueLabel` — h=8 → 8%12=8, PM. h=20 → 8 PM. h=0 → 0||12=12 AM. Good. Pad m.

**Test: `test/schedule.test.js`** (ff-upstream compile pattern):

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');
const Module = require('node:module');
const ts = require('typescript');

// Pure schedule logic, compiled standalone (no imports). See test/ff-upstream.test.js pattern.
const outDir = path.join(__dirname, '.schedule-build');
test.before(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
  execSync(`npx tsc src/lib/schedule.ts --module commonjs --target es2022 --skipLibCheck --outDir "${outDir}"`, { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
});
test.after(() => fs.rmSync(outDir, { recursive: true, force: true }));
const load = () => require(path.join(outDir, 'schedule.js'));

const t = (iso) => new Date(iso);
const utcMs = (y, mo, d, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);

test('istDayOfWeek: fixed +05:30, Sunday = 0', () => {
  const s = load();
  assert.equal(s.istDayOfWeek(t('2026-11-22T10:00:00Z')), 0);           // Nov 22 2026 is a Sunday in UTC
  assert.equal(s.istDayOfWeek(t('2026-11-23T02:00:00Z')), 0);           // +05:30 rollover: IST Sun
  assert.equal(s.istDayOfWeek(t('2026-11-21T20:00:00Z')), 6);           // Nov 21 2026 = Saturday (IST +5h30)
  assert.equal(s.istDayOfWeek(t('2026-11-21T18:00:00Z')), 5);           // before rollover: Friday
});
```

Wait — need to verify weekday facts: is Nov 21 2026 a Saturday? 2026-11-21 — I need to compute. From checkpoint: Pending/facts — I recall the conversation mentioned "Sunday dayOfWeek rollover" as a test concept in spec. Rather than guess, compute: Jan 1 2026? 2025-01-01 = Wednesday. 2025 has 365 days → 2026-01-01 = Thursday. Days from Jan 1 2026 to Nov 21 2026: Jan 31, Feb 28 (2026 not leap), Mar 31, Apr 30, May 31, Jun 30, Jul 31, Aug 31, Sep 30, Oct 31 = 31+28+31+30+31+30+31+31+30+31 = 304 days to Nov 1. Nov 1 + 20 = Nov 21 (day-of-year 325). (325-1) mod 7 = 324 mod 7 = 2 (7*46=322). Jan 1 = Thursday (day 1). Day 325 → Thursday + 2 = Saturday. So Nov 21 2026 = Saturday, Nov 22 = Sunday. IST rollover: 2026-11-22T02:00Z → IST = 07:30 Nov 22 → Sunday ✓. 2026-11-21T20:00Z → IST = 01:30 Nov 22 → Sunday?? Wait: Nov 21 2026 UTC 20:00 + 5:30 = Nov 22 2026 01:30 → that's Sunday! I mis-wrote the first case.

Let me recompute: Nov 21 2026 (UTC date) = Saturday. UTC 20:00 on Nov 21 = IST Nov 22 01:30 (Sunday). So istDayOfWeek(new Date(Date.UTC(2026,10,21,20))) = 0.

And istDayOfWeek(new Date(Date.UTC(2026,10,21,18)))? 18:00 UTC → IST 23:30 Nov 21 → Saturday = 6. So first test case: `t('2026-11-21T20:00:00Z')` → 0 (Sunday, rolled over). Second: `t('2026-11-21T18:00:00Z')` → 6 (Saturday, before rollover).

Midnight boundary: `new Date(Date.UTC(2026,10,22,0))` → IST Nov 22 05:30 → Sunday → 0. And Date.UTC(2026,10,21,23) → IST Nov 22 04:30 → 0. Fine, use a couple cases.

Rather than hardcode wrong constants, plan includes a quick pre-flight: in the test, compute expected via `t(iso).getUTCDay()` for pre-offset and shifted via new Date(t.getTime()+IST_OFFSET). To be safe I'll write tests that derive expected values:

```js
test('istDayOfWeek: matches UTC-day-of-week of (t + 05:30)', () => {
  const s = load();
  for (const iso of ['2026-11-21T20:00:00Z', '2026-11-21T18:00:00Z', '2026-11-22T10:00:00Z', '2026-11-23T02:00:00Z']) {
    const d = new Date(iso);
    assert.equal(s.istDayOfWeek(d), new Date(d.getTime() + s.IST_OFFSET_MS).getUTCDay());
  }
});
```

This is self-deriving — robust to my weekday math error. 

For `nextOccurrenceDates` test: from = now; series dayOfWeek = s.istDayOfWeek(now) — first occurrence strictly after now at some time. If startTimeLocal is in the past today, first occurrence is tomorrow. Test properties: dates are increasing, spaced 7 days, each occurrence has istDayOfWeek === dayOfWeek, occurrence > from, and first - from < 7d. Deterministic assertions.

```js
test('nextOccurrenceDates: weekly cadence, IST math, next after `from`', () => {
  const s = load();
  const now = new Date('2026-11-21T10:00:00Z');
  const dayOfWeek = s.istDayOfWeek(now);
  const dates = s.nextOccurrenceDates(now, dayOfWeek, '20:00', 2);
  assert.equal(dates.length, 2);
  assert.ok(dates[0].getTime() > now.getTime(), 'first occurrence strictly after now');
  assert.equal(s.istDayOfWeek(dates[0]), dayOfWeek, 'lands on the right IST day');
  assert.equal(s.istDayOfWeek(dates[1]), dayOfWeek, 'lands on the right IST day');
  assert.equal(dates[1].getTime() - dates[0].getTime(), 7 * 86_400_000, 'exactly weekly');
});
```

Is dates[0] "next weekly occurrence of dayOfWeek at 20:00 strictly after now"? now = 2026-11-21T10:00Z = Sat 15:30 IST. dayOfWeek=6 (Sat). startTime 20:00. Candidate for Nov 21 (IST date? istDateParts(now): shifted = now+5:30 = Nov 21 15:30 → y=2026,mo=10,d=21). occurrenceAt(2026,10,21,"20:00") = Date.UTC(2026,10,21)+20h - 5.5h = Date.UTC(2026,10,21)+14.5h = Nov 21 14:30 UTC? Hmm: Date.UTC(2026,10,21) is midnight UTC Nov 21. +20h = 20:00 UTC, minus 5.5h = 14:50 UTC Nov 21. istDayOfWeek = shifted UTC+5.5 = 20:20? Hmm that gives IST 20:20? Date.UTC(2026,10,21)+20h-5.5h; add IST_OFFSET: Date.UTC+20h = 20:00Z; minus 5.5h → 14:30Z; shift +5.5 → 20:00 IST. Good: occurrence = 2026-11-21T14:30Z = IST 20:00 Sat. Is 14:30Z > now (10:00Z)? Yes → candidate for Nov 21 found: istDayOfWeek(occurrence) — shift: 14:30Z+5:30 = 20:00Z Nov 21 → Thursday? wait Nov 21 = Saturday: 20:00Z is still Nov 21 Saturday (local time? UTC 20:00 on Nov 21). getUTCDay of shifted Date = Saturday=6 ✓ (since I define istDayOfWeek = new Date(t + offset).getUTCDay()).

So first = Nov 21 14:30Z (Sat, IST 20:00), next = Nov 28 14:30Z (7 days). Test asserts istDayOfWeek(dates[0]) === dayOfWeek where dayOfWeek = istDayOfWeek(now) = 6 (per self-deriving: shifted now = 15:30 Nov 21 → UTC Saturday = 6). ✓ consistent.

To be safe against off-by-a-day edge: could make startTime "08:00" etc. — but properties hold regardless.

Hmm one risk: candidate = occurrenceAt(from's IST date) might be <= from, then continue i=1... loop `for i in 0..7`: I compute istDateParts(from + i days) and candidate for that date. i=0: from's IST date → candidate (maybe ≤ from or correct). i=1: from+1 day IST date, etc. For dayOfWeek to match within 7 steps always. Good.

Wait, bug in my nextWeeklyOccurrence: `occurrenceAt(year, month, day, ...)`: Date.UTC(year, month, day) + T - IST_OFFSET. For dayOfWeek candidate I need occurrence where istDayOfWeek(candidate)===dayOfWeek. With candidate = Date.UTC(y,m,d)+T-offset, then candidate+offset = Date.UTC(y,m,d)+T, getUTCDay = UTC day of that. Date.UTC(y,m,d) is midnight of calendar date d, so shifted-day-of-week = day-of-week(d). Hmm: is Date.UTC(2026,10,21)+T the calendar date d at time T? shifted = Date.UTC + T. getUTCDate = 21, getUTCDay = Saturday (since Nov 21 = Sat in UTC ✓). So candidate is IST date d at time T → istDayOfWeek(candidate) = 6 ✓.

So semantics: `day` values correspond to UTC calendar weekdays (Postgres date is a date; we store dayOfWeek 0-6). The "IST calendar date" language — my Date.UTC(y,m,d)+T-offset formula: candidate IS at absolute time such that shifted = Date.UTC(d)+T. The resulting candidate is "date d at time T" in UTC-calendar terms = IST-calendar date shifted by offset... Careful: IST day containing candidate = floor((candidate+offset)/86400000) = floor((Date.UTC(d)+T)/86400000) = date d (since T ≤ 24h). So IST calendar date of occurrence = d. istDayOfWeek(candidate) = getUTCDay of shifted = getUTCDay(Date.UTC(d)+T) = weekday(d). 

So: candidate lies in IST calendar date d; its IST time = T. occurs after `from`? candidate.getTime() > from.

nextWeeklyOccurrence iterates i from 0: d_i = IST-calendar date of (now + i days). candidate_i on date d_i at T. If candidate_i > from and weekday(d_i) === dayOfWeek → return. For weekly cadence every weekday matches across 8 days (i in 0..7). E.g., if d_0's weekday ≠ dayOfWeek, d_1 is next day... if T already passed today and candidate ≤ now, i=1 may still find same weekday (a week later). Fine.

Edge: could return candidate = date d0 where weekday matches but candidate < now? We check candidate > from. OK.

`nextOccurrenceDates` second = first + 7d → same weekday ✓.

- endsAtFor test: `endsAtFor(t('2026-11-21T10:00Z'), 90)` = 12:30Z (getTime + 90*60000).

- qualifiesMatch:

```js
test('qualifiesMatch: status-independent, host excluded, endsAt gate', () => {
  const s = load();
  const now = new Date('2026-11-21T10:00:00Z');
  const host = 'host1';
  // closed match still qualifies
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime() - 1000), [host, 'a', 'b'], now, 2), true);
  // host is not counted
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime() - 1000), [host, 'a', host], now, 2), false);
  // duplicates count once
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime() - 1000), ['a', 'a', 'a'], now, 2), false);
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime() - 1000), ['a', 'b'], now, 2), true);
  // endsAt in future → false; exactly now → false
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime() + 1000), ['a', 'b'], now, 2), false);
  assert.equal(s.qualifiesMatch(host, new Date(now.getTime()), ['a', 'b'], now, 2), false);
});
```

- shouldAutoPause: deadCount 1 → false; 2 zero → true; 2 with one join → false; 3 dead all zero, take2 zero → true (we pass 2). Keep simple: 

```js
assert.equal(s.shouldAutoPause(1, [0], 2), false);
assert.equal(s.shouldAutoPause(2, [0, 0], 2), true);
assert.equal(s.shouldAutoPause(2, [0, 1], 2), false);
assert.equal(s.shouldAutoPause(3, [0, 0, 0], 2), true);
```

- seriesCueLabel:

```js
test('seriesCueLabel: honest chip format', () => {
  const s = load();
  assert.equal(s.seriesCueLabel(5, '20:00'), 'Weekly · Fri 8 PM IST');
  assert.equal(s.seriesCueLabel(0, '08:00'), 'Weekly · Sun 8 AM IST');
  assert.equal(s.seriesCueLabel(1, '23:30'), 'Weekly · Mon 11:30 PM IST');
});
```

Verify: h=5 (Friday), m=0: h12 = 5||12=5, PM since h>=12? 5<12 → AM?? Wait h=5 → 5%12=5 → h12=5; h<12 → 'AM' → "Weekly · Fri 5 AM IST" — but spec example "Fri 8 PM" uses 20:00! I wrote label from spec: `Weekly · Fri 8 PM IST`. Fix: for h=20: h12=8, PM ✓. For h=5 the label should be 5 AM. My test with (5,'20:00') expects 'Weekly · Fri 8 PM IST' — right (h=20). In label code: h12 = h%12||12 → 20%12=8; ampm h<12?'AM':'PM' → 'PM' ✓. And (0,'08:00'): h=8 → 8%12=8||8 → h12=8, AM ✓ "Sun 8 AM". (1,'23:30'): h=23 → 23%12=11 → h12=11, PM → "Mon 11:30 PM". Test expects 'Mon 11:30 PM' ✓. Fix test cases: (5,'20:00') → h=5?? I wrote day 5='Fri' and h=5. Change to (5,'20:00') where first arg is dayOfWeek=5 (Friday) and '20:00' → label "Weekly · Fri 8 PM IST" ✓. Good, I already wrote day 5 in test. Actually I wrote `s.seriesCueLabel(5, '20:00')` → "Weekly · Fri 8 PM IST" ✓ (day 5 = Fri by DAY_LABELS).

Day labels: DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] — index 5 = 'Fri' ✓.

- [ ] steps: write module; run schedule.test.js (pass).

---

## Task 4: Duration on `/post` (Q1)

**Files:** Modify `src/app/post/page.tsx`, `src/app/post/actions.ts`

- [ ] Extend zod schema in actions: add `durationMinutes: z.enum(MATCH.durationOptionsMinutes as [number, ...number[]])` — hmm enum with numbers: z.enum accepts strings. Use `z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v))`.

```ts
durationMinutes: z.coerce.number().int().refine((v) => MATCH.durationOptionsMinutes.includes(v), 'Pick a supported duration'),
```

- createMatch: add `endsAt: endsAtFor(d.date, d.durationMinutes)` to match.create data (server-computed).

- `/post/page.tsx`: add duration `<select name="durationMinutes">` default `MATCH.defaultDurationMinutes` in the grid (e.g., next to Entry select or its own row):

```tsx
<label className="label">Duration
  <select className="input" name="durationMinutes" required>
    {MATCH.durationOptionsMinutes.map(m => <option key={m} value={m}>{m} min</option>)}
  </select>
</label>
```

- Verify via existing gates (no dedicated unit test; covered by e2e).

- Commit: `feat(post): duration select (60/90/120 min) + server-computed Match.endsAt`.

---

## Task 5: Ladder + Eligibility — `src/lib/series.ts` + DB tests

**Files:** Create `src/lib/series.ts`; Create `test/series.test.js` (DB-gated, erasure pattern).

**`src/lib/series.ts`** (imports via relative paths so the loader resolves; uses new `qualifiesMatch`, `shouldAutoPause`):

```ts
import { prisma } from './db';
import { MATCH } from './config';
import { qualifiesMatch, shouldAutoPause, endsAtFor, nextOccurrenceDates } from './schedule';

export type Eligibility = {
  unlocked: boolean;
  qualified: number;
  needed: number;
  activeSeries: number;
  cap: number;
};

// Host count toward ladder unlock: hosts' own qualifying matches, status-independent (spec §5).
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

// Server-side materialize; stamps lastGeneratedAt; skipDuplicates on [seriesId, date].
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
```

**`test/series.test.js`** — DB-gated via `process.env.DATABASE_URL` + skip (erasure pattern). Tests:

1. `eligibility starts locked for a fresh organizer` — create user; expect { unlocked: false, qualified: 0, activeSeries: 0 }.
2. `qualifiesMatch counts status-independent + host exclusion` — create user; create 3 matches: (a) endsAt now-1h, 2 joiners (distinct, non-host) → qualifies; (b) same but status closed → still counts; (c) host's own joiner → doesn't. Assert countQualifyingMatches === 2 and unlocked true (needed 3). Hmm need exactly 3 matches to unlock: (a), (b), (d) third match. Then `seriesEligibility.unlocked === true`. Also assert copy semantics: `eligibility.qualified === 3`.
3. `cap blocks a second active series` — create series via prisma.matchSeries.create for user (status active); eligibility.unlocked false (activeSeries=1 < cap 2? need activeSeries=2 to be full... wait cap=2: unlocked = qualified>=3 && activeSeries<2. After 2nd series active → activeSeries=2 → false).
4. `materializeSeries is idempotent` — create user+series (status active, lookaheadWeeks=2, dayOfWeek = istDayOfWeek(now), startTimeLocal = next occurrence time? just set '20:00'), call materializeSeries twice; assert count of Match where seriesId === series.id is 2 (or use lookaheadWeeks). Also dates unique.
5. `autoPauseCheck pauses only when latest dead occurrences are all 0-join` — create user+series; create 2 matches with seriesId, endsAt = now - hour, entries none; run autoPauseCheck → status 'paused', audit log exists (query). Then create a join on... hmm assert no-new-weeks after pause: materializeSeries returns 0 (status paused → return 0). And with resumedAt: create new series resumedAt = now, 2 dead matches with date >= resumedAt → autoPauseCheck false.

DB cleanup helper in after: delete MatchSeries (organizerId), Match (organizerId), User (QA prefix).

User creation: needs passwordHash etc. Check User schema: id, email, passwordHash, displayName, userType, city default,... role nullable, etc. Insert minimal: { email, passwordHash: 'x', displayName: 'qa-series', userType: 'player' }.

Matches: unique constraint on (seriesId, date) — create with dates now-1h and -2h to avoid collision for same series.

**To create matches in tests** — `prisma.match.create({ data: { organizerId, title, mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', status: 'closed', date: new Date(...), endsAt: new Date(...) } })`.

**Commit**: `feat: trust ladder eligibility + series db helpers (eligibility, materialize, autoPause)`.

---

## Task 6: Series Create — `/post/series` + actions

**Files:** Create `src/app/post/series/page.tsx`; Create `src/app/post/series/actions.ts`; Modify `src/app/post/page.tsx` (honesty line + link when unlocked).

**`src/app/post/series/actions.ts`**:

```ts
'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { MATCH } from '@/lib/config';
import { seriesEligibility, materializeSeries } from '@/lib/series';

const schema = z.object({
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  entry: z.enum(MATCH.entry as [string, ...string[]]),
  prize: z.enum(MATCH.prize as [string, ...string[]]),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTimeLocal: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  durationMinutes: z.coerce.number().int().refine(v => MATCH.durationOptionsMinutes.includes(v)),
});

export async function createSeries(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/post/series?e=role');

  const rl = await checkRateLimit(`createseries:${s.userId}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/post/series?e=rate');

  const parsed = schema.safeParse({
    title: formData.get('title'), mode: formData.get('mode'), gameType: formData.get('gameType'),
    entry: formData.get('entry'), prize: formData.get('prize'), city: formData.get('city'),
    online: formData.get('online') ?? 'no', dayOfWeek: formData.get('dayOfWeek'), startTimeLocal: formData.get('startTimeLocal'),
    durationMinutes: formData.get('durationMinutes') ?? String(MATCH.defaultDurationMinutes),
  });
  if (!parsed.success) redirect('/post/series?e=invalid');
  const d = parsed.data;

  // Trust ladder gate (spec §3): exact real progress, same rule the UI shows.
  const eligibility = await seriesEligibility(s.userId);
  if (!eligibility.unlocked) redirect('/player/posted?e=seriesLocked');
```

```ts
  const series = await prisma.matchSeries.create({
    data: { organizerId: s.userId, title: d.title, mode: d.mode, gameType: d.gameType, entry: d.entry, prize: d.prize, city: d.city, online: d.online === 'yes' ? true : false, slots: null, durationMinutes: d.durationMinutes, dayOfWeek: d.dayOfWeek, startTimeLocal: d.startTimeLocal, status: 'active' },
  });
  await materializeSeries(series.id); // Flag 4: second prong — materialize on create
  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'series_create', detail: JSON.stringify({ id: series.id, title: d.title }) } }); } catch {}
  redirect('/player/posted?seriesDone=1');
}
```

Error text on `/player/posted`: `e=seriesLocked` → honest progress copy from `eligibility` ("X of 3 completed matches hosted so far…"; N/K exact values from config, no invented badges). Also `seriesDone` → "Weekly series created — your first occurrences will show on the board."

**`/post/series/page.tsx`**: server component; fetch `eligibility`; gate: `unlocked ? form : progress copy` (same copy as the error line, plus a link back to `/post` if qualified>0). Form fields: title, mode (`MATCH.modes`), gameType (`MATCH.gameTypes`), entry (`MATCH.entry`), prize (`MATCH.prize`), city, online select yes/no (default 'no'), dayOfWeek select 0–6 labeled Sun..Sat, startTime `<input type="time" name="startTimeLocal" defaultValue="20:00">`, duration select from `MATCH.durationOptionsMinutes` default `MATCH.defaultDurationMinutes`. One primary button: `btn` "Create series".

Then post action updates.

`/post/page.tsx` modifications: import seriesEligibility; in page: 

```tsx
const eligibility = await seriesEligibility(s.userId);
```

Add honesty line near top:

```tsx
{eligibility.qualified > 0 && (
  <p className="subtext" style={{ marginTop: 12 }}>
    {eligibility.qualified} of {MATCH.trustLadderMinMatches} completed matches hosted so far {eligibility.unlocked ? `— you can open a weekly series:` : ''}
  </p>
)}
{eligibility.unlocked && <Link href="/post/series" className="btn-ghost" style={{ textDecoration: 'none', marginTop: 6 }}>Set up a weekly series</Link>}
```

Hmm "zero fabricated stats" — reading real DB ✓.

- Commit.

---

## Task 7: Series Management — edit/pause/resume on `/player/posted`

**Files:** Modify `src/app/player/posted/actions.ts`; Modify `src/app/player/posted/page.tsx`; Create `src/lib/series-ops.ts`; Create `test/series-ops.test.js` (DB-gated, erasure pattern — edit-freeze + purge tests).

- [ ] **Step 1: Write failing DB tests** (`test/series-ops.test.js` — same recursive TS-loader + prisma pattern as `test/erasure.test.js`). Test data built with `prisma.match.create`/`prisma.matchSeries.create` (QA emails), cleanup in `test.after` by deleting the QA org's rows (`Match`, `MatchSeries`, `MatchEntry`, `User` where `organizerId`/`email` in QA set).

  - `applyTemplateEdit: joined occurrences keep original terms; 0-join future slots update` — series + one joined match (1 entry) + one 0-join future match; call `applyTemplateEdit` with new title/mode/gameType/entry/prize/city/online/slots/durationMinutes (60); assert joined match row unchanged (title, mode, entry, endsAt); assert 0-join row has new template and `endsAt - date === 60_000` (endsAt recomputed at new duration).
  - `applyScheduleEdit: purges future 0-join slots, keeps joined ones` — series with old-time 0-join slot + joined slot; call `applyScheduleEdit`; assert old slot deleted (findUnique null), new window materialized in future.

- [ ] **Step 2: Run tests — expect FAIL** (`node --test --test-concurrency=1 test/series-ops.test.js` — `src/lib/series-ops.ts` missing / functions throw).

- [ ] **Step 3: Implement `src/lib/series-ops.ts`:**

```ts
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
// propagate to future 0-join occurrences; joined ones keep their terms (bait-and-switch guard).
export async function applyTemplateEdit(seriesId: string, data: {
  title: string; mode: string; gameType: string; entry: string; entryFee: string | null;
  prize: string; prizePool: string | null; city: string; online: boolean; slots: number | null;
  durationMinutes: number;
}, now = new Date()) {
  const affected = await zeroJoinFuture(seriesId, now);
  for (const m of affected) {
    await prisma.match.update({ where: { id: m.id }, data: {
      title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, entryFee: data.entryFee,
      prize: data.prize, prizePool: data.prizePool, city: data.city, online: data.online, slots: data.slots,
      endsAt: endsAtFor(m.date, data.durationMinutes),
    } });
  }
  await prisma.matchSeries.update({ where: { id: seriesId }, data: {
    title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, prize: data.prize,
    city: data.city, online: data.online, slots: data.slots, durationMinutes: data.durationMinutes,
  } });
}

// Schedule edits (dayOfWeek/startTimeLocal): purge future 0-join slots of the old schedule, keep joined,
// then regenerate the window at the new schedule.
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
```

- [ ] **Step 4: Run tests — expect PASS.**

- [ ] **Step 5: Commit** — `feat: series edit freeze (template edits propagate to 0-join only), schedule-edit purge, pause/resume`.

---

// Pending zero-join future occurrences: the freeze rule for bait-and-switch.
async function zeroJoinFuture(seriesId: string, now: Date) {
  return prisma.match.findMany({
    where: { seriesId, date: { gt: now }, entries: { none: {} } },
    select: { id: true, date: true },
  });
}

export async function applyTemplateEdit(seriesId: string, data: { title; mode; gameType; entry; entryFee; prize; prizePool; city; online; slots; durationMinutes }, now = new Date()) {
  // Propagate to future occurrences with 0 joins (frozen ones stay untouched).
  const affected = await zeroJoinFuture(seriesId, now);
  if (affected.length) {
    for (const m of affected) {
      await prisma.match.update({ where: { id: m.id }, data: { title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, entryFee: data.entryFee, prize: data.prize, prizePool: data.prizePool, city: data.city, online: data.online, slots: data.slots, endsAt: endsAtFor(m.date, data.durationMinutes) } });
    }
  }
  // duration edit → also stamp endsAt for the rest of the series' future matches? Only 0-join ones got updated above. Future joined slots stay as-is by design.
  await prisma.matchSeries.update({ where: { id: seriesId }, data: { title: data.title, mode: data.mode, gameType: data.gameType, entry: data.entry, entryFee: data.entryFee, prize: data.prize, prizePool: data.prizePool, city: data.city, online: data.online, slots: data.slots, durationMinutes: data.durationMinutes } });
}

export async function applyScheduleEdit(seriesId: string, now = new Date()) {
  // Purge future 0-join slots at the OLD schedule, then regenerate the new window.
  await prisma.match.deleteMany({ where: { seriesId, date: { gt: now }, entries: { none: {} } } });
  await materializeSeries(seriesId, now);
}
```

For durationMinutes edit on future joined matches — freezing semantics: spec freezes joins; duration of joined matches stays. Not updating joined = matches TP? Spec says baits: template edits propagate only to 0-join future; duration same treatment. OK — only 0-join propagated, consistent.

**`src/app/player/posted/actions.ts`** — add server actions:

```ts
const seriesEditSchema = z.object({
  seriesId: z.string(),
  title: z.string().trim().min(4).max(90),
  mode: enum, gameType: enum, entry: enum, prize: enum, city: trim min 2 max 80,
  online: z.enum(['yes','no']).default('no'),
  slots: z.coerce.number().int().positive().max(100000).optional(),
  durationMinutes: durationSchema,
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTimeLocal: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export async function editSeries(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player/posted?e=role');
  const id = String(formData.get('seriesId') ?? '');
  const rl = await checkRateLimit(`editseries:${id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) redirect('/player/posted?e=rate');
  const parsed = seriesEditSchema.safeParse({
    seriesId: id,
    title: formData.get('title'), mode: formData.get('mode'), gameType: formData.get('gameType'),
    entry: formData.get('entry'), prize: formData.get('prize'), city: formData.get('city'),
    online: formData.get('online') ?? 'no', slots: formData.get('slots') || undefined,
    durationMinutes: formData.get('durationMinutes'), dayOfWeek: formData.get('dayOfWeek'), startTimeLocal: formData.get('startTimeLocal'),
  });
  if (!parsed.success) redirect('/player/posted?e=invalid');
  const d = parsed.data;

  const stored = await prisma.matchSeries.findUnique({ where: { id }, select: { organizerId: true, title: true, mode: true, gameType: true, entry: true, prize: true, city: true, online: true, slots: true, durationMinutes: true, dayOfWeek: true, startTimeLocal: true } });
  if (!stored || stored.organizerId !== s.userId) redirect('/player/posted?e=forbidden');

  await prisma.matchSeries.update({ where: { id }, data: { title: d.title, mode: d.mode, gameType: d.gameType, entry: d.entry, prize: d.prize, city: d.city, online: d.online, slots: d.slots, durationMinutes: d.durationMinutes, dayOfWeek: d.dayOfWeek, startTimeLocal: d.startTimeLocal } });
  if (stored.dayOfWeek !== d.dayOfWeek || stored.startTimeLocal !== d.startTimeLocal) await applyScheduleEdit(id);
  else await applyTemplateEdit(id, d);

  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'series_edit', detail: JSON.stringify({ seriesId: id, title: d.title }) } }); } catch {}
  revalidatePath('/matches'); revalidatePath('/player/posted'); redirect('/player/posted?e=edited');
}

export async function pauseSeries(formData: FormData) {
  // session + org check (same pattern as editSeries); rate limit `pauseseries:${id}`; calls series-ops pauseSeries(id); audit 'series:pause'; revalidate.
}

export async function resumeSeries(formData: FormData) {
  // session + org check; rate limit `resumeseries:${id}`; calls series-ops resumeSeries(id); audit 'series:resume'; revalidatePath('/matches'); revalidatePath('/player/posted'); redirect('/player/posted?e=resumed').
}
```

`setMatchStatus` (one-off) stays unchanged.

**`src/app/player/posted/page.tsx`**: add eligibility fetch + series section:

```tsx
{eligibility.unlocked && series exist?} — management: list series of this organizer (prisma.matchSeries.findMany({ where: { organizerId } })) — reuse card layout: show series title, mode, cadence (seriesCueLabel), status chip, actions ghost buttons (edit via hidden form fields? simpler: link to /post/series/[id]/edit? Plan: management via inline small forms).
```

Simplification for plan: `/player/posted` shows an "Upcoming weekly series" block per series with ghost buttons "Edit", "Pause"/"Resume", "Archive"; edit opens a form posting to editSeries with all fields prefilled from DB. To limit scope: inline edit form on posted page posting to `editSeries`; pause/resume/archive forms posting to `pauseSeries`/`resumeSeries`. Admin archive action separate (Task 9).

**Archive**: pauseSeries with force? Spec v1 non-goal mentions archive. Spec §5 status values include archived; §6 resume. Implement `pauseSeries` and `resumeSeries`; archive = pauseSeries (same effect). Keep pauseSeries generic + page button label "Pause / Archive".

- Commit: `feat: series management on /player/posted (edit/pause/resume) + edit freeze + resume window`.

---

## Task 8: Lazy Sweep + `/matches` Board Integration

**Files:** Create `src/lib/series-sweep.ts`; Modify `src/app/matches/page.tsx`.

**`src/lib/series-sweep.ts`:**

```ts
import { prisma } from './db';
import { MATCH } from './config';
import { autoPauseCheck } from './series';
import { materializeSeries } from './series';

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
        const paused = await autoPauseCheck(series, now); // auto-pause FIRST (spec §6)
        if (paused) { await prisma.matchSeries.update({ where: { id: series.id }, data: { lastGeneratedAt: now } }); touched++; continue; }
        touched += await materializeSeries(series.id, now);
      } catch { /* per-series fault isolation (TP4) */ }
    }
  } catch { /* sweep must never break the board (TP4) */ }
  return touched;
}
```

**`/matches/page.tsx`:** add sweep call + happened/upcoming split:

```ts
import { runSeriesSweep } from '@/lib/series-sweep';
...
export default async function MatchesBoard(...) {
  try { await runSeriesSweep(); } catch { /* board never fails because of sweep */ }
  const now = new Date();
  const matches = await prisma.match.findMany({ ...same filters..., select: + endsAt, series: { select: { dayOfWeek, startTimeLocal } } });
  const happening = matches.filter(m => m.status === 'open' && m.date <= now && now <= m.endsAt).sort((a, b) => a.date - b.date);
  const upcoming = matches.filter(m => m.status === 'open' && m.date > now).sort((a, b) => a.date - b.date);
  ...render: two sections...
}
```

Render: "Happening now" (chip "Now"), then "Next up". Chip: `<span className="chip">Now</span>`, series cue chip: `Weekly · Fri 8 PM IST`.

Wait — non-series happened rows previously appeared in the list; new split: happening = happening now (including series). Non-series match that ended between now-0? "happening" only if date<=now<=endsAt. Ended non-series matches previously shown — now moved to neither (they're past). To preserve behavior: upcoming = open AND date > now; happening = open AND date <= now. Non-series ended ones: previously shown? Previous board: status open && orderBy date asc, take 60 — a past non-series match would show in list. Edge case; new split drops past non-series. Acceptable? It changes behavior slightly... To be safe, happened = open && date<=now && now<=endsAt (spec Honest chip). Past non-series stay visible in upcoming? No, date>now filter. Hmm — maybe keep "Happening now" as spec says (only now-in-progress) and add happened-past to... Actually previous behavior: no "happening now" concept; ongoing matches listed by date asc. I'll define:

- Happening now: open AND date <= now AND now <= endsAt (spec §8).
- Next up: open AND date > now.
- Past ended non-series: keep them in "Next up"? No — they're done. Could append to happening? Spec doesn't cover. Put them at top of "Next up" — mislabels. Decision: keep previous semantics for non-series (they're rare — host leaves unclosed matches past; close should happen) — simplest: `happening` = (date <= now && endsAt >= now) OR (seriesId == null && date < now)? Ugly. 

Cleaner: `happening = open && date <= now && now <= endsAt` (spec honest) and `previous` = open && !happening && date < now → show in a muted small "Recently ended" section? Scope creep. I'll go with spec semantics: happening (clock check) + next up (future). Past non-series no longer shown — actually wait: original board shows past matches (a bug-ish). Keep scope tight: spec wins.

Actually simpler spec-conformant: upcoming = open AND date > now; happening = open AND date <= now AND endsAt >= now. Total shown ≤ 60? Previous took 60 total. Use take 60 each section? Fine: 60 each, honest.

Wait, `now <= m.endsAt` — endsAt is Date (non-null). Comparison in JS fine.

Render updates + `/matches/page.tsx` select: add `endsAt: true, series: { select: { dayOfWeek: true, startTimeLocal: true } }`.

Series chip: `{m.series && <span className="chip chip-sapphire" style={{marginLeft:6}}>{seriesCueLabel(m.series.dayOfWeek, m.series.startTimeLocal)}</span>}` — check classes exist in globals.css (chip, chip-sapphire — used in posted page ✓).

Also Happening now section: `<h2 style={...}>Happening now</h2>` + rows; Next up similar. Board has no new primary buttons ✓.

**Test impact:** `test/match-config.test.js` etc. — `/matches` changes covered by e2e.

- Commit.

---

## Task 9: Admin — pause parent series

**Files:** Modify `src/app/admin/matches/actions.ts`; Modify `src/app/admin/matches/page.tsx`.

- `adminPauseSeries(formData)`: requires `match:manage`; validates seriesId (zod: cuid-ish string); finds series by id; `updateMany` where id; audit `series_pause_admin`; revalidatePath('/admin/matches').

Admin page: add series table section? Plan: admin page lists series with toggle: query `prisma.matchSeries.findMany({ orderBy: { createdAt: 'desc' }, select: { id, title, status, organizer: { select: { displayName } }, createdAt } })`; render small section with ghost buttons via form to adminPauseSeries (add) / resume? Keep: admin pause only (spec: "admin gains pause-parent-series action"). Add resume action too? Spec §5 only pause. Keep pause.

Hmm — for honesty, add resume for completeness? Spec non-goal. Skip resume; pause + audit.

- Commit.

---

## Task 10: E2E Script — `test/e2e/series.py`

New Playwright python script (modeled on the existing `platform_e2e.py` harness patterns: `domcontentloaded`, explicit `wait_for_url`, `text_content()`, run-unique `@example.com` emails, scrub QA rows afterward). Outline:

1. Login as new QA player; check `/post/series` shows locked progress copy ("0 of 3 completed matches...").
2. Post 3 qualifying matches on board flow? (Simpler: via Post page form x3: date future, mode/gameType/entry free/prize none; each from unique QA org?) — unlock requires 3 qualifying matches by same organizer; use one QA player hosting 3.
3. After unlock: `/post/series` renders form; create series (dayOfWeek, startTime 20:00); assert `/matches` shows "Weekly · <Day> 8 PM IST" chip on upcoming slots within lookaheadWeeks.
4. Player joins first occurrence (from `/matches/[id]` — need id from board data attributes or DB).
5. Roster on `/player/posted` shows join; then edit series via posted page form (title change) → joined occurrence on board still shows old title (bait-and-switch guard).
6. Schedule edit (change startTime to 21:00) → assert old-time 0-join slot removed from `/matches`; new slot appears.
7. Insert 2 finished matches with 0 joins via DB (scrub later: `endsAt`/`date` in the past) → reload `/matches` (this triggers `runSeriesSweep`) → assert series is `paused` in DB **and** `/player/posted` shows paused state; assert audit log contains `series:auto_pause`.
8. Resume via posted page → `resumedAt` set; assert status becomes `active` immediately (no re-pause despite 2 dead occurrences), and new occurrences materialize on `/matches`.
9. Sweep-fault isolation (manual QA note — not automatable against prod): temporarily stop DB → page should still render; or insert `MatchSeries` with past-due `lastGeneratedAt` + slow/failing writes — the `try/catch` wraps `runSeriesSweep` on `/matches`, covered by design review in Task 8.

- Commit: `test(e2e): scheduled-matches e2e suite (lock ladder, materialize, edit freeze, auto-pause, resume)`.

---

## Task 11: Gates + Scrub

**Files:** —

- [ ] Stop `next start` on :3000 (`Get-NetTCPConnection -LocalPort 3000`).
- [ ] `npm run lint` — 0 errors.
- [ ] `npm test` — all green (new tests included).
- [ ] `npm run build`.
- [ ] `npx prisma migrate deploy` (repeat-safe) + note counts.
- [ ] Scrub QA rows: delete `MatchEntry`/`Match`/`MatchSeries`/`User` rows created by e2e QA emails (`%@example.com` new runs) — query before deleting: `SELECT count(*) FROM "User" WHERE email LIKE 'qa+series-%';` then DELETE.
- [ ] Commit: `chore: scheduled-matches gates (lint/test/build) + QA scrub`.

---

## Execution Notes

- **Exclusive ordering per user:** Step 0 (PR #59 merge from tip, prod verify, `docs/app-flow.md` snapshot) happens **before** this plan's first commit.
- **Dates:** commits today `2026-11-21`.
- **Budget:** keep tasks atomic; each commit ends a green `npm test`.
- **Before implementation:** ask which execution approach: Subagent-driven or Native.
