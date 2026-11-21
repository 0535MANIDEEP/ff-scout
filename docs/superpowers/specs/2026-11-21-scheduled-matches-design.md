# Scheduled Matches (`MatchSeries`) — Design Spec (v1)

**Date:** 2026-11-21
**Status:** Locked — approved in review with Flags 1–5 and Tightening Points 1–4 folded in.
**Supersedes:** the scheduled-matches section discussed in `2026-11-19-match-platform-design.md`.

## 0. Goal

A schedule anyone can count on — "Friday 8 PM BR scrim" — that runs **without a human in the loop**: self-serve recurring series, automatic weekly occurrences on the existing board, self-policing via a trust ladder. Free Fire Keeda feel, zero manual process, zero admin gatekeeping.

**End-goal context:** steady small income; first revenue lever is promoted matches (separate track, reuses the existing `paidUntil` stub).

**Non-goals (v1):** cron jobs/queues, multi-week cadences (monthly+), report-status lifecycle, promotion payments, email reminders, waitlist changes.

## 0.1 Operating guardrails

- Next.js + TypeScript + Prisma on Neon Postgres. **The prod DB is shared: additive migrations only, never drop/reset data. Scrub all QA/E2E rows after testing.**
- Honesty rules: zero fabricated stats/scarcity/badges; every progress count and clock indicator reflects real DB state and the server clock.
- UI rules: one primary button per screen; secondary actions ghost-styled; no user-facing "admin" wording.
- Patterns to reuse, not reinvent: `src/lib/permissions.ts` capabilities, session-cookie auth, `checkRateLimit`, `auditLog` try/catch pattern, `src/config/match.json`.

## 1. Locked decisions

| # | Decision |
|---|---|
| Q1 | **Host-picked duration:** one select (on `/post` and the series form): 60 / 90 / 120 min, default 90, from `src/config/match.json`. `endsAt = date + durationMinutes` computed and **stored at write time**. |
| Q2 | **Trust ladder:** `trustLadderMinMatches = 3`, `trustLadderMinJoins = 2`, both config constants (tunable without migration). |
| Flag 1 | **Doc timing:** merge PR #59 *from branch tip* (push `532d5a9`+ into #59 or open #60) → verify prod → only then snapshot `docs/app-flow.md`. Merging the stale tip would misdescribe prod. |
| Flag 2 | **No `occurrenceAt`.** `Match.date` (full `DateTime`, collected via `datetime-local`) is the canonical start. New `endsAt`. Idempotency key `@@unique([seriesId, date])` — Postgres NULLs don't collide, so one-off matches are unaffected. |
| Flag 3 | **No report-status sub-feature.** Ladder has no "clean standing" clause; auto-pause + admin close cover dead hosts. |
| Flag 4 | **Generate-on-read, not cron.** Primary trigger: throttled lazy sweep during `/matches` render. Secondary: on series create/resume. The board can never render stale, because rendering it *is* the tick. |
| Flag 5 | **Auto-pause counts only finished occurrences** (`endsAt < now`), audited as `series:auto_pause`. |
| TP1 | **Migration backfills `endsAt = date + 90 min`** for existing rows → `endsAt` ships non-null; no null branches anywhere. |
| TP2 | **Schedule-time edits purge future 0-join slots** of the old schedule before regenerating; future occurrences with ≥1 join stay frozen. IST math uses a **fixed `+05:30` offset** — never `Intl` or server-local time — so `date` and `@@unique([seriesId, date])` never drift. |
| TP3 | **`resumedAt` (nullable)** on the series; auto-pause evaluates only occurrences with `date >= COALESCE(resumedAt, createdAt)` → Resume can never immediately re-pause. |
| TP4 | **Sweep order + fault isolation:** throttle claim → auto-pause → materialize → stamp `lastGeneratedAt`; the whole sweep runs inside `try/catch` so a transient DB error never breaks `/matches`. |
| Ladder | **Qualification is status-independent:** a hosted match qualifies iff `endsAt < now` AND distinct joiners **excluding the host** `>= trustLadderMinJoins`, **regardless of `status`**. Closing a full lobby early counts (good host behavior); the anti-farming gate is the time window, not status. The UI progress counter reads this exact rule. |

### Repo-fit adaptations (identified during pre-flight inspection)

- The host foreign key is **`organizerId`** (as on `Match`), not `hostId`.
- `Match` stores `mode`/`gameType`/`entry`/`prize`/`status` as plain **`String`**, not Prisma enums. `MatchSeries` mirrors these exact types; series status is `String @default("active")` (`active | paused | archived`), matching `Match.status` style.
- Template field list mirrors `/post`'s zod schema exactly, including `entryFee`/`prizePool` note fields and `online`.

## 2. Config — `src/config/match.json` (single source of truth)

Existing taxonomy keys stay; new keys are added alongside:

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

## 3. Data model — additive migration only

```prisma
model MatchSeries {
  id             String   @id @default(cuid())
  organizerId    String
  organizer      User     @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  // template — mirrors Match /post fields (plain Strings, same as Match)
  title          String
  mode           String
  gameType       String
  entry          String
  entryFee       String?
  prize          String
  prizePool      String?
  city           String
  online         Boolean  @default(false)
  slots          Int?
  durationMinutes Int     // 60 | 90 | 120 — config durationOptionsMinutes
  // recurrence
  dayOfWeek      Int      // 0–6, IST calendar day
  startTimeLocal String   // "HH:mm", e.g. "20:00"
  timezone       String   @default("Asia/Kolkata") // display only; math is fixed +05:30
  // lifecycle
  status         String   @default("active") // active | paused | archived
  lookaheadWeeks Int      @default(2)
  lastGeneratedAt DateTime?
  resumedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  matches        Match[]

  @@index([status])
}

model Match {
  // …existing fields unchanged…
  endsAt     DateTime    // backfilled by the migration (date + 90 min); always present
  seriesId   String?
  series     MatchSeries? @relation(fields: [seriesId], references: [id], onDelete: SetNull)

  @@unique([seriesId, date])   // new — NULLs don't collide, one-offs unaffected
}
```

**Migration steps (single additive migration):**
1. Create `MatchSeries`.
2. Three-step `endsAt` (all in this one migration): add `Match.endsAt` nullable → `UPDATE "Match" SET "endsAt" = "date" + INTERVAL '90 minutes' WHERE "endsAt" IS NULL` → set `NOT NULL`. v1 code therefore reads/writes `endsAt` as always-present, with zero null branches.
3. Add `Match.seriesId` nullable FK (on delete `SetNull` — deleting a series never deletes matches).
4. Add `@@unique([seriesId, date])`.

`durationMinutes` lives only on `MatchSeries`; every materialized `Match` carries concrete `date` + `endsAt`.

## 4. Duration on `/post` and the series form (Q1)

- One `<select>` populated from `durationOptionsMinutes`, default `defaultDurationMinutes` (90).
- `createMatch` stores `endsAt = new Date(date.getTime() + durationMinutes * 60_000)` — computed server-side from the parsed zod value, never from client math.

## 5. Self-serve trust ladder (D)

**Qualifying hosted match** (all three, exactly as the UI will show it):
1. `endsAt < now`
2. distinct `MatchEntry.playerId` on that match **excluding `organizerId`** `>= trustLadderMinJoins` (2)
3. any `status` — open or closed both count

**Eligibility to create a series:** qualifying matches `>= trustLadderMinMatches` (3) **and** current `active` series count `< activeSeriesCap` (2).

**Honest UI:** `/post` and `/player/posted` render exact DB progress with the same rule, e.g. *"1 of 3 completed matches hosted to unlock weekly series."* No invented badges or "almost there" copy.

## 6. Lazy materialization & auto-pause (E, TP4)

**Triggers:** (primary) throttled lazy sweep during `/matches` render, fully wrapped in `try/catch` — a sweep failure logs and renders the board normally; (secondary) the same materialize step runs inside series create and resume.

**Sweep order (critical):**
1. **Claim/throttle:** `active` series where `lastGeneratedAt IS NULL` or older than `lazyGenThrottleMinutes` (15).
2. **Auto-pause first:** among occurrences with `endsAt < now` AND `date >= COALESCE(resumedAt, createdAt)`, take the latest `autoPauseAfterDeadOccurrences` (2) by `date DESC`. If 2 exist and **both have 0 joins** → `status = paused`, audit `series:auto_pause`, skip generation for this series.
3. **Materialize:** compute upcoming occurrences within `lookaheadWeeks` (2) of the next scheduled instant using fixed `+05:30` IST calendar arithmetic → `createMany` with `skipDuplicates: true` against `@@unique([seriesId, date])`.
4. **Stamp:** `lastGeneratedAt = now`.

## 7. Series edits, pause/resume, bait-and-switch guard (F)

- **Template edits** (`title`, `mode`, `gameType`, `entry`, `entryFee`, `prize`, `prizePool`, `city`, `online`, `slots`, `durationMinutes`): update `MatchSeries`, then propagate **only** to future occurrences (`date > now`) with **0 joins**. Any future occurrence with ≥1 join stays **frozen** at the terms its players joined under (a `free` listing can never flip to `paid` under a joined lobby).
- **Schedule edits** (`dayOfWeek`, `startTimeLocal`): delete future occurrences (`date > now`) with 0 joins — no orphaned old-time slots on `/matches` — keep ≥1-join occurrences frozen, then immediately materialize the new window. (Deletion, not closing: avoids `@@unique([seriesId, date])` collisions and stuck-closed weeks.)
- **Pause/archive:** stops generation. Future 0-join occurrences are deleted (same `@@unique` reasoning as above); future ≥1-join occurrences stay visible to host and joined players unless the host explicitly closes them.
- **Resume:** `status = active`, `resumedAt = now` (TP3), immediately materialize the window.
- **Rate limits:** series create/edit share the existing `checkRateLimit` pattern (per-user, e.g. 5/15min). **Audits:** `series:create`, `series:edit`, `series:pause`, `series:resume`, `series:auto_pause` (try/catch, never blocks).

## 8. Board, UX, permissions, admin (G)

- **`/matches`:**
  - **Happening now:** `status = open` AND `date <= now <= endsAt` — pure server-clock check, honest chip.
  - **Next up:** `status = open` AND `date > now`, ordered ascending (existing `orderBy date asc`).
  - **Series cue:** muted ghost chip `Weekly · Fri 8 PM IST` when `seriesId != null`.
  - The lazy sweep (§6) runs here, throttled and fault-isolated.
- **Join/leave/report:** unchanged — the existing serializable transaction on `/matches/[id]`, one occurrence at a time, no ghost rosters.
- **`/post`:** duration select (§4); when eligible, a "recurring series" option gated by the ladder with exact progress copy.
- **`/player/posted`:** series management section — create (ladder-gated), edit, pause/resume/archive; occurrences listed alongside one-offs as today.
- **`/admin/matches`:** series-linked matches appear normally; add an audited action to pause the parent series.
- **Permissions:** series actions require `match:create` / `match:manage` (player + admin already hold both; sponsors hold neither) — no new capability needed, gates stay in `src/lib/permissions.ts` style.

## 9. Testing & acceptance gates

**Unit (`node:test`, DB-gated skip pattern respected):**
- Fixed `+05:30` IST date math across week/month boundaries and midnight (incl. a Sunday `dayOfWeek` rollover).
- Ladder qualification: closed-with-K-joins counts; host's own join excluded; `endsAt > now` excluded; K−1 joins excluded.
- Lazy sweep idempotency: double run → zero duplicate occurrences.
- Auto-pause window: old dead occurrences ignored after `resumedAt`; auto-pause evaluated before generation.

**E2E (Playwright, throwaway accounts, scrub after):**
1. Below-threshold host sees exact progress copy and cannot create a series.
2. After 3 qualifying matches → unlock → create series → occurrences materialize on `/matches`.
3. Player joins an occurrence → roster shows them; template edit does **not** alter the joined occurrence; schedule edit purges the old-time 0-join slot.
4. Two finished dead occurrences → `series:auto_pause` audited, series paused, no new weeks generated.
5. Resume → `resumedAt` set → no immediate re-pause → window regenerated.
6. Fault injection: sweep throws → `/matches` still renders (board never 500s).

**Final gates:** `npm run lint` (tsc) + `npm test` + `npm run build` all green; zero console errors in e2e; QA rows scrubbed from the shared DB.

## 10. Rollout order

1. **Step 0 — parity:** push branch tip into PR #59 (or open #60 from tip) → merge → verify prod → snapshot `docs/app-flow.md` (carries the dark-theme fix).
2. **Step 1 — this spec:** implementation plan → additive migration → build → tests → e2e. No external keys or payments required.
3. **Step 2 — parallel:** `GAMESKINBO_API_KEY`, Resend/Brevo key, Oracle/Cloudflare provisioning.
4. **Step 3 — promoted matches** (`paidUntil`), visually separated from organic Happening-now/Next-up.
5. **Step 4 — waitlist 2.0** after the email key is live.
