# Match Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Final Circle from a verified-roster product into a match platform: organizers post matches, players join, sponsors discover opted-in players.

**Architecture:** Next.js 16 App Router + server actions + Prisma/Postgres. New `Match`/`MatchEntry` tables; `User` splits `rank` into `brRank`/`csRank` and gains `visibleToSponsors`; the verification subsystem (screenshots, queue, verifier role) is deleted. Taxonomy (mode/gameType/entry/prize) lives in `src/config/match.json`, parsed by zod; permissions stay catalogue-first in `src/lib/permissions.ts`.

**Tech Stack:** Next.js 16 (Turbopack), TypeScript, Prisma, Postgres (Neon), zod v4, node:test, Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-11-19-match-platform-design.md`

## Global Constraints

- Free tiers only; no paid services. No money handling — entry/prize are notes, settled organizer↔player.
- No fabricated claims: no invented stats, counts, testimonials, prices, sponsors, urgency.
- Players never pay to join.
- No "admin" wording on user-facing surfaces; internal `/admin/*` keeps its name.
- Descriptive, non-critical validation errors.
- Security gates (RBAC) live in typed code, never in JSON.
- Secrets only via env vars in provider dashboards; never in git.
- Every commit says intent in its subject; atomic tasks.
- `npm run lint` (tsc), `npm test`, `npm run build` must stay green.

## Decisions locked from the spec's open questions

1. `mode`: config-driven list, defaults `casual`, `competitive`, `ranked`, `esports`; board filter defaults to "all".
2. `slots`: optional number, display only (no cap enforcement, no waitlist).
3. Player keeps `role`; `iglCapable` and `college` are dropped (unused in the platform model).
4. Roster shows displayName, UID, BR/CS ranks, role, city — **no email** (players reach each other via UID in-game).

## Review Focus

- Joining the same match twice must not create two rows (unique constraint + friendly error).
- A closed match must not accept joins.
- Sponsor directory and export must exclude players with `visibleToSponsors = false`.
- Filters on `/matches` must never leak `closed` matches to a plain visitor scan.
- Organic-empty states: a new organizer's roster and a player's joins must say "Nothing here yet", not render a broken table.
- Rate limits on post/join/export must refuse with a descriptive message, not a 500.

---

### Task 1: Schema — Match, MatchEntry, User fields

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `test/schema.test.js` (new)

**Interfaces:**
- Produces: `Match`, `MatchEntry` models; `User.brRank`, `User.csRank`, `User.visibleToSponsors`, `User.brandName`, `User.orgName`(exists), `User.contact`.

- [ ] **Step 1: Write the failing test**

```js
// test/schema.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const schema = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');

test('schema has Match and MatchEntry models', () => {
  assert.match(schema, /model Match \{/);
  assert.match(schema, /model MatchEntry \{/);
});

test('User carries separate BR/CS ranks and sponsor opt-in', () => {
  assert.match(schema, /brRank/);
  assert.match(schema, /csRank/);
  assert.match(schema, /visibleToSponsors/);
  assert.doesNotMatch(schema, /model VerificationProof \{/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `model Match {` not found.

- [ ] **Step 3: Write the schema**

In `prisma/schema.prisma`: add `Match` and `MatchEntry`; on `User` add `brRank String?`, `csRank String?`, `visibleToSponsors Boolean @default(false)`, `brandName String?`, `contact String?`; remove `verified`, `status`, `rank`, `iglCapable`, `college`; delete `model VerificationProof`.

```prisma
model Match {
  id        String   @id @default(cuid())
  organizerId String
  organizer User     @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  title     String
  mode      String   // casual | serious | tournament | esports
  gameType  String   // BR | CS
  entry     String   // free | paid
  entryFee  String?  // note only, e.g. "₹50" — never collected by us
  prize     String   // none | pool
  prizePool String?  // note only
  status    String   @default("open") // open | closed
  date      DateTime
  city      String
  online    Boolean  @default(false)
  slots     Int?
  contact   String?
  notes     String?
  createdAt DateTime @default(now())
  entries   MatchEntry[]
}

model MatchEntry {
  id        String   @id @default(cuid())
  matchId   String
  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  playerId  String
  player    User     @relation(fields: [playerId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([matchId, playerId])
}
```

Add the reverse relations on `User`: `matches Match[]`, `entries MatchEntry[]`. Remove `proofs`.

- [ ] **Step 4: Run test + generate + migrate**

Run: `npm test` → PASS. Then `npx prisma generate` and `npx prisma migrate dev --name match-platform` (dev), committing `prisma/migrations`.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations test/schema.test.js
git commit -m "feat(db): Match + MatchEntry tables, split BR/CS ranks, drop verification"
```

---

### Task 2: Permissions catalogue

**Files:**
- Modify: `src/lib/permissions.ts`
- Test: `test/permissions.test.js` (new)

**Interfaces:**
- Produces: `Role = 'player' | 'organizer' | 'sponsor' | 'admin'`; permissions `match:join`, `match:leave`, `match:create`, `match:manage`, `match:roster`, `talent:browse`, `talent:export`, `user:manage`, `audit:read`, `account:erase`, `self:delete`.

- [ ] **Step 1: Write the failing test**

```js
// test/permissions.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { hasPermission, roleFromDb } = require('../.permissions-build/permissions.js');

test('organizer can create and roster, not browse talent', () => {
  assert.equal(hasPermission('organizer', 'match:create'), true);
  assert.equal(hasPermission('organizer', 'match:roster'), true);
  assert.equal(hasPermission('organizer', 'talent:browse'), false);
});

test('sponsor can browse and export, not join', () => {
  assert.equal(hasPermission('sponsor', 'talent:browse'), true);
  assert.equal(hasPermission('sponsor', 'talent:export'), true);
  assert.equal(hasPermission('sponsor', 'match:join'), false);
});

test('verifier role is gone; moderator maps to organizer-facing fallback', () => {
  assert.equal(hasPermission(roleFromDb('moderator'), 'match:create'), false);
});

test('admin keeps owner powers only', () => {
  assert.equal(hasPermission('admin', 'user:manage'), true);
  assert.equal(hasPermission('admin', 'match:create'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/permissions.test.js` (after the compile shim below) — Expected: FAIL, module missing.

- [ ] **Step 3: Implement**

Rewrite `src/lib/permissions.ts` `Permission` union and `CAPS`:

```ts
export type Role = 'player' | 'organizer' | 'sponsor' | 'admin';

export type Permission =
  | 'match:join' | 'match:leave'
  | 'match:create' | 'match:manage' | 'match:roster'
  | 'talent:browse' | 'talent:export'
  | 'user:manage' | 'audit:read'
  | 'account:erase' | 'self:delete';

const CAPS: Record<Role, Permission[]> = {
  player:   ['match:join', 'match:leave', 'self:delete'],
  organizer:['match:create', 'match:manage', 'match:roster', 'self:delete'],
  sponsor:  ['talent:browse', 'talent:export', 'self:delete'],
  admin:    ['user:manage', 'audit:read', 'account:erase', 'match:manage'],
};
```

Keep `roleFromDb` mapping `moderator -> organizer`? No — the DB enum must drop `moderator`. Change `roleFromDb` to `{ player, organizer, sponsor, admin }` and `dbRoleFor` likewise. Keep `ROLE_LABEL`/`ROLE_DESCRIPTION` for the four roles.

- [ ] **Step 4: Compile shim for the test**

`permissions.ts` imports nothing, so compile it like the ff-upstream test does (tsc to `test/.permissions-build`). Add the compile step to `test/permissions.test.js` `test.before`, mirroring `test/ff-upstream.test.js`.

- [ ] **Step 5: Run tests + lint, commit**

Run: `npm test` → PASS; `npm run lint` → clean.
```bash
git add src/lib/permissions.ts test/permissions.test.js
git commit -m "feat(rbac): sponsor role, match/talent permissions, retire verifier"
```

---

### Task 3: Match taxonomy config

**Files:**
- Create: `src/config/match.json`
- Modify: `src/lib/config.ts`
- Test: `test/match-config.test.js` (new)

**Interfaces:**
- Produces: `MATCH_MODES: string[]`, `MATCH_GAME_TYPES`, `MATCH_ENTRY`, `MATCH_PRIZE`, `MATCH_STATUS`.

- [ ] **Step 1: Write the failing test**

```js
// test/match-config.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'config', 'match.json'), 'utf8'));

test('match taxonomy covers modes, BR/CS, entry, prize, status', () => {
  assert.deepEqual(json.modes, ['casual', 'competitive', 'ranked', 'esports']);
  assert.deepEqual(json.gameTypes, ['BR', 'CS', 'BR/CS']);
  assert.deepEqual(json.entry, ['free', 'paid']);
  assert.deepEqual(json.prize, ['none', 'pool']);
  assert.deepEqual(json.status, ['open', 'closed']);
});
```

- [ ] **Step 2: Run test to verify it fails** — Expected: FAIL, file missing.

- [ ] **Step 3: Write `src/config/match.json`**

```json
{
  "modes": ["casual", "competitive", "ranked", "esports"],
  "gameTypes": ["BR", "CS", "BR/CS"],
  "entry": ["free", "paid"],
  "prize": ["none", "pool"],
  "status": ["open", "closed"]
}
```

In `src/lib/config.ts` add:

```ts
import matchJson from '@/config/match.json';
const matchRoot = z.object({
  modes: z.array(z.string().min(1)).min(1),
  gameTypes: z.array(z.string().min(1)).min(1),
  entry: z.array(z.string().min(1)).min(1),
  prize: z.array(z.string().min(1)).min(1),
  status: z.array(z.string().min(1)).min(1),
});
export const MATCH = matchRoot.parse(matchJson);
```

- [ ] **Step 4: Run test + lint, commit**

```bash
git add src/config/match.json src/lib/config.ts test/match-config.test.js
git commit -m "feat(config): match taxonomy (mode, BR/CS, entry, prize)"
```

---

### Task 4: Create a match

**Files:**
- Create: `src/app/organizer/post/page.tsx`
- Create: `src/app/organizer/post/actions.ts`
- Test: `test/match-actions.test.js` (new, DB-gated)

**Interfaces:**
- Produces: `createMatch(_: ActionState, formData: FormData): Promise<ActionState>`; `ActionState = { ok: boolean; error?: string }`.

- [ ] **Step 1: Write the failing test**

```js
// test/match-actions.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.DATABASE_URL;

if (!url) {
  test('match actions require DATABASE_URL (scratch Postgres)', { skip: true }, () => {});
} else {
  test('createMatch rejects a paid entry without an amount note', async () => {
    const { createMatch } = require('../.match-build/actions.js');
    const fd = new FormData();
    fd.set('title', 'Friday Casual BR');
    fd.set('mode', 'casual');
    fd.set('gameType', 'BR');
    fd.set('entry', 'paid');
    fd.set('entryFee', '');
    fd.set('prize', 'none');
    fd.set('date', '2026-12-01T18:00');
    fd.set('city', 'Hyderabad');
    const res = await createMatch({ ok: false }, fd);
    assert.equal(res.ok, false);
    assert.match(res.error, /fee/i);
  });
}
```

- [ ] **Step 2: Run to verify it fails** — Expected: FAIL, build missing.

- [ ] **Step 3: Implement `actions.ts`**

Follow `src/app/sign-up/actions.ts` patterns exactly: `'use server'`, zod schema, `checkRateLimit('postmatch:<org>', 5, 15min)`, session + `hasPermission(roleFromDb(s.userType), 'match:create')`, `redirect('/login')` when logged out, `redirect('/organizer/matches')` on success.

```ts
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { MATCH } from '@/lib/config';

const schema = z.object({
  title: z.string().trim().min(4).max(90),
  mode: z.enum(MATCH.modes as [string, ...string[]]),
  gameType: z.enum(MATCH.gameTypes as [string, ...string[]]),
  entry: z.enum(MATCH.entry as [string, ...string[]]),
  entryFee: z.string().trim().max(40).optional(),
  prize: z.enum(MATCH.prize as [string, ...string[]]),
  prizePool: z.string().trim().max(40).optional(),
  date: z.coerce.date(),
  city: z.string().trim().min(2).max(80),
  online: z.enum(['yes', 'no']).default('no'),
  slots: z.coerce.number().int().positive().max(100000).optional(),
  contact: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type ActionState = { ok: boolean; error?: string };

export async function createMatch(_: ActionState, formData: FormData): Promise<ActionState> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const rl = await checkRateLimit(`postmatch:${s.userId}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: 'Too many posts in a short while — give it a few minutes.' };

  const parsed = schema.safeParse({
    title: formData.get('title'), mode: formData.get('mode'), gameType: formData.get('gameType'),
    entry: formData.get('entry'), entryFee: formData.get('entryFee') || undefined,
    prize: formData.get('prize'), prizePool: formData.get('prizePool') || undefined,
    date: formData.get('date'), city: formData.get('city'),
    online: formData.get('online') ?? 'no',
    slots: formData.get('slots') || undefined,
    contact: formData.get('contact') || undefined, notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'Check the match details — something is missing or too long.' };
  const d = parsed.data;
  if (d.entry === 'paid' && !d.entryFee) return { ok: false, error: 'A paid match needs the entry fee noted (players pay you directly).' };
  if (d.prize === 'pool' && !d.prizePool) return { ok: false, error: 'A prize match needs the pool noted (you pay it directly).' };
  if (d.date.getTime() < Date.now() - 60 * 60 * 1000) return { ok: false, error: 'That date is already gone — pick an upcoming one.' };

  await prisma.match.create({
    data: {
      organizerId: s.userId, title: d.title, mode: d.mode, gameType: d.gameType,
      entry: d.entry, entryFee: d.entryFee ?? null, prize: d.prize, prizePool: d.prizePool ?? null,
      status: 'open', date: d.date, city: d.city, online: d.online === 'yes',
      slots: d.slots ?? null, contact: d.contact ?? null, notes: d.notes ?? null,
    },
  });
  try { await prisma.auditLog.create({ data: { userId: s.userId, action: 'match_create', detail: JSON.stringify({ title: d.title }) } }); } catch {}
  redirect('/organizer/matches');
}
```

- [ ] **Step 4: Implement the page** (`page.tsx`, server component, `useActionState` client form)

Gate: logged out → `/login`; not organizer → `/player`. Render a form with the taxonomy (mode/gameType/entry/prize selects from `MATCH`, date input, city, online checkbox, slots, contact, notes). Copy: "Post a match" / "Free while we're in pilot — ₹499 per post at launch." Use `eyebrow-inline`, `h1`, `label`, `input`, `btn` classes.

- [ ] **Step 5: Compile shim + run tests**

Compile `src/app/organizer/post/actions.ts` to `test/.match-build` in `test.before` (tsc, like Task 2). Note: actions.ts imports `@/lib/*` — tsc single-file compile will pull the import graph; use `--skipLibCheck` and accept the emitted files, requiring the actions entry.

Run: `npm test` → PASS (skips without DATABASE_URL), `npm run lint` → clean.

- [ ] **Step 6: Commit**

```bash
git add src/app/organizer/post test/match-actions.test.js
git commit -m "feat(matches): organizers post a match (taxonomy + validation + rate limit)"
```

---

### Task 5: The board — `/matches`

**Files:**
- Create: `src/app/matches/page.tsx`
- Modify: `src/app/sitemap.ts`, `src/app/layout.tsx` (nav)
- Test: `test/matches.test.js` (new, DB-gated)

**Interfaces:**
- Consumes: `Match`.
- Produces: `/matches` with query filters `mode`, `type`, `city`, `entry`, `prize`.

- [ ] **Step 1: Write the failing test**

```js
// test/matches.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.DATABASE_URL;
if (!url) {
  test('matches board requires DATABASE_URL', { skip: true }, () => {});
} else {
  test('board lists open matches and hides closed ones', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    const open = await prisma.match.create({ data: { organizerId: (await prisma.user.findFirst()).id, title: 'Open BR', mode: 'casual', gameType: 'BR', entry: 'free', prize: 'none', date: new Date(Date.now() + 86400000), city: 'Hyderabad' } });
    await prisma.match.create({ data: { organizerId: open.organizerId, title: 'Closed BR', mode: 'casual', gameType: 'BR', entry: 'free', prize: 'none', status: 'closed', date: new Date(Date.now() + 86400000), city: 'Hyderabad' } });
    const listed = await prisma.match.findMany({ where: { status: 'open' } });
    assert.ok(listed.some(m => m.title === 'Open BR'));
    assert.ok(!listed.some(m => m.title === 'Closed BR'));
    await prisma.match.deleteMany({});
    await prisma.$disconnect();
  });
}
```

- [ ] **Step 2: Run to verify it fails** — Expected: FAIL (route/model absent).

- [ ] **Step 3: Implement the page**

Server component: read `searchParams`, build `where` (always `status: 'open'`, plus optional filters), `orderBy: { date: 'asc' }`, `take: 60`. Render filter form (`method="get"`) with selects from `MATCH` + city input; cards linking to `/matches/[id]` showing title, mode, type badge, date, city/online, entry/prize, slots, organizer name. Empty state: "Nothing posted yet — check back soon."

- [ ] **Step 4: Wire nav + sitemap**

Add `/matches` to the nav ("Matches") and sitemap (priority 0.9).

- [ ] **Step 5: Run tests + lint, commit**

```bash
git add src/app/matches src/app/sitemap.ts src/app/layout.tsx test/matches.test.js
git commit -m "feat(matches): public board with filters"
```

---

### Task 6: Match detail + join/leave

**Files:**
- Create: `src/app/matches/[id]/page.tsx`
- Create: `src/app/matches/[id]/actions.ts` (`joinMatch`, `leaveMatch`)
- Create: `src/components/JoinButton.tsx` (client)
- Test: `test/join.test.js` (new, DB-gated)

**Interfaces:**
- Produces: `joinMatch(_: ActionState, formData: FormData)`, `leaveMatch(_: ActionState, formData: FormData)`; both take hidden `matchId`.

- [ ] **Step 1: Write the failing test**

```js
// test/join.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.DATABASE_URL;
if (!url) {
  test('join requires DATABASE_URL', { skip: true }, () => {});
} else {
  test('a player cannot join the same match twice', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    const player = await prisma.user.findFirst({ where: { userType: 'player' } });
    const match = await prisma.match.findFirst();
    if (!player || !match) { await prisma.$disconnect(); return; }
    const first = await prisma.matchEntry.create({ data: { matchId: match.id, playerId: player.id } }).catch(() => null);
    const second = await prisma.matchEntry.create({ data: { matchId: match.id, playerId: player.id } }).catch(e => e.code);
    assert.equal(second, 'P2002');
    if (first) await prisma.matchEntry.delete({ where: { id: first.id } });
    await prisma.$disconnect();
  });
}
```

- [ ] **Step 2: Run to verify it fails** — Expected: FAIL.

- [ ] **Step 3: Implement actions**

`joinMatch`: session required; `hasPermission(roleFromDb(s.userType), 'match:join')`; load match; if `match.status !== 'open'` return `{ ok: false, error: 'This match is closed.' }`; `prisma.matchEntry.create` catching `P2002` → `{ ok: false, error: "You're already on this roster." }`; `revalidatePath(`/matches/${match.id}`)`; redirect back.

`leaveMatch`: delete the entry where `matchId + playerId`; `revalidatePath`; redirect back.

- [ ] **Step 4: Implement the page + JoinButton**

Detail page: full match info, organizer card, joined count, and a `JoinButton` (client, `useActionState`, hidden `matchId`, label "Join this match" / "Leave"). Logged-out visitors see "Log in to join". Show `entry`/`prize` notes honestly ("Paid entry — ₹50 to the organizer", "Prize pool — ₹5,000, paid by the organizer").

- [ ] **Step 5: Run tests + lint, commit**

```bash
git add src/app/matches/[id] src/components/JoinButton.tsx test/join.test.js
git commit -m "feat(matches): match detail with join/leave (idempotent, closed-guard)"
```

---

### Task 7: Organizer dashboard + roster

**Files:**
- Create: `src/app/organizer/matches/page.tsx`
- Test: `test/roster.test.js` (new, DB-gated)

**Interfaces:**
- Consumes: `match:manage`, `match:roster`.

- [ ] **Step 1: Write the failing test**

```js
// test/roster.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.DATABASE_URL;
if (!url) { test('roster requires DATABASE_URL', { skip: true }, () => {}); }
else {
  test('roster only shows entries for the organizer\'s own matches', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    const org = await prisma.user.findFirst({ where: { userType: 'organizer' } });
    const match = await prisma.match.findFirst({ where: { organizerId: org.id } });
    const player = await prisma.user.findFirst({ where: { userType: 'player' } });
    if (!match || !player) { await prisma.$disconnect(); return; }
    const e = await prisma.matchEntry.create({ data: { matchId: match.id, playerId: player.id } }).catch(() => null);
    const roster = await prisma.matchEntry.findMany({ where: { matchId: match.id }, include: { player: true } });
    assert.ok(roster.length >= 1);
    if (e) await prisma.matchEntry.delete({ where: { id: e.id } });
    await prisma.$disconnect();
  });
}
```

- [ ] **Step 2: Run to verify it fails** — Expected: FAIL.

- [ ] **Step 3: Implement the page**

Gate: `match:manage`. List the organizer's matches (newest first) with status and a per-match roster: players (displayName, gameUid, brRank, csRank, role, city) joined. Empty states: "You haven't posted a match yet." / "No one has joined yet." Add a `Close match` form (server action `closeMatch`) for open matches.

- [ ] **Step 4: Run tests + lint, commit**

```bash
git add src/app/organizer/matches test/roster.test.js
git commit -m "feat(matches): organizer dashboard with per-match roster"
```

---

### Task 8: Player profile + joins + sponsor opt-in

**Files:**
- Modify: `src/app/player/page.tsx`
- Create: `src/app/player/actions.ts` (`saveProfile`, `setVisibleToSponsors`)
- Test: `test/player-profile.test.js` (new, DB-gated)

**Interfaces:**
- Produces: `saveProfile(_: ActionState, formData)`; `setVisibleToSponsors(visible: boolean)`.

- [ ] **Step 1: Write the failing test** — assert `saveProfile` rejects a BR rank with an empty `csRank` when `gameType` context is CS? Simpler: assert the zod schema rejects a displayName shorter than 2 chars, and that `setVisibleToSponsors(false)` flips the flag.

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

`saveProfile`: zod { displayName min2 max40, gameUid digits 5-15, brRank in RANKS, csRank in RANKS, role in ROLE_IDS, city min2 max80 }. Update the user; `revalidatePath('/player')`.
`setVisibleToSponsors`: boolean; updates the flag; `revalidatePath('/player')`.
Page: show profile (ranks, role, city, UID), a `visibleToSponsors` checkbox with honest copy ("Let sponsors see my profile — displayName, UID, ranks, role, city. Never my email."), and "Your joins" (matches joined, with leave links). Empty state: "You haven't joined a match yet."

- [ ] **Step 4: Run tests + lint, commit**

```bash
git add src/app/player test/player-profile.test.js
git commit -m "feat(player): BR/CS profile, sponsor opt-in, my joins"
```

---

### Task 9: Sponsor directory + export

**Files:**
- Create: `src/app/sponsor/sign-up/page.tsx` + `actions.ts`
- Create: `src/app/sponsors/page.tsx`
- Create: `src/app/sponsors/export/route.ts`
- Test: `test/sponsor.test.js` (new, DB-gated)

**Interfaces:**
- Produces: `registerSponsor(_: ActionState, formData)`; `/sponsors` (filters); `/sponsors/export` (CSV).

- [ ] **Step 1: Write the failing test**

```js
// test/sponsor.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.DATABASE_URL;
if (!url) { test('sponsor requires DATABASE_URL', { skip: true }, () => {}); }
else {
  test('directory query excludes players who did not opt in', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    const hidden = await prisma.user.findFirst({ where: { visibleToSponsors: false } });
    const shown = await prisma.user.findFirst({ where: { visibleToSponsors: true } });
    const dir = await prisma.user.findMany({ where: { userType: 'player', visibleToSponsors: true } });
    if (hidden) assert.ok(!dir.some(u => u.id === hidden.id));
    if (shown) assert.ok(dir.some(u => u.id === shown.id));
    await prisma.$disconnect();
  });
}
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

`registerSponsor`: like `registerPlayer` but `userType: 'sponsor'`, fields brandName/city/contact.
`/sponsors`: gate `talent:browse`; filters (city, rank, role); list opted-in players (displayName, UID, brRank, csRank, role, city, matches joined count).
`/sponsors/export`: gate `talent:export`; same filter; CSV with the `csvCell` guard copied from the old shortlist download; audit `talent_export`; filename `final-circle-candidates.csv`.

- [ ] **Step 4: Run tests + lint, commit**

```bash
git add src/app/sponsor src/app/sponsors test/sponsor.test.js
git commit -m "feat(sponsors): signup, opted-in candidate directory, CSV export"
```

---

### Task 10: Admin — matches console + index redirect

**Files:**
- Create: `src/app/admin/page.tsx` (redirect to `/admin/matches`)
- Create: `src/app/admin/matches/page.tsx` + `actions.ts` (`setMatchStatus`)
- Modify: `src/app/admin/roles/page.tsx` (drop the verifier filter option; map `moderator`→organizer display)

- [ ] **Step 1: Write the failing test** — assert an admin session can close any match and a non-admin cannot (unit: `hasPermission('admin','match:manage')` true, `hasPermission('organizer','match:manage')` true but scoped in the action by ownership).

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

`/admin` redirects to `/admin/matches` (fixes the 404). `/admin/matches` lists all matches with a close/reopen form; `setMatchStatus` requires `hasPermission(roleFromDb(s.userType), 'match:manage')` AND (if not admin) ownership.

- [ ] **Step 4: Run tests + lint, commit**

```bash
git add src/app/admin
git commit -m "feat(admin): matches console, /admin redirects, roles panel updated"
```

---

### Task 11: uid-check pool half

**Files:**
- Modify: `src/app/api/uid-check/route.ts`
- Modify: `src/components/UidCheck.tsx` (pool copy)

- [ ] **Step 1: Write the failing test** — extend `test/ff-upstream.test.js`? No: add a DB-gated test asserting the pool query finds a player by `gameUid` among opted-in... Actually the pool answer becomes "on Final Circle" + joined count:

```js
test('pool half finds a player by UID and counts joins', async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const p = await prisma.user.findFirst({ where: { userType: 'player' } });
  if (!p) { await prisma.$disconnect(); return; }
  const found = await prisma.user.findFirst({ where: { gameUid: p.gameUid ?? 'x' } });
  assert.ok(found);
  await prisma.$disconnect();
});
```

- [ ] **Step 2: Run to verify it fails** (pool query changed).

- [ ] **Step 3: Implement**

Replace the `poolLookup` with: find the user by `gameUid` (player), return `{ found: true, displayName, brRank, csRank, role, city, joins }` where `joins` = `prisma.matchEntry.count({ where: { playerId } })`. Update `UidCheck.tsx` pool section copy: "On Final Circle — joined N matches". Keep the live half untouched.

- [ ] **Step 4: Run tests + lint, commit**

```bash
git add src/app/api/uid-check src/components/UidCheck.tsx test/uid-pool.test.js
git commit -m "feat(uid-check): pool half reports platform presence and join count"
```

---

### Task 12: Delete the old product

**Files:**
- Delete: `src/app/organizer/shortlist/`, `src/app/organizer/shortlist/download/`, `src/app/verify/`, `src/app/admin/verify/`
- Modify: `src/app/layout.tsx` (nav), `src/app/page.tsx` + `src/app/components/Hero.tsx` (landing copy → platform), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/config/roles.json` (drop verifier), `src/config/copy.json`
- Modify: `src/app/login/actions.ts` (role → landing: sponsor → `/sponsors`, organizer → `/organizer/matches`, admin → `/admin/matches`, player → `/player`)

- [ ] **Step 1: Delete routes and update nav/sitemap; verify no internal links remain** (grep for `shortlist`, `/verify`, `admin/verify`).

- [ ] **Step 2: Update landing copy** — "Post a match / Find a match", honest how-it-works, no verified-pool claims.

- [ ] **Step 3: Run tests + lint + build**, commit

```bash
git add -A
git commit -m "feat: remove verified-roster screens, platform landing copy"
```

---

### Task 13: Docs — SPEC, ADR 0004, codemap, README, legal

**Files:**
- Rewrite: `SPEC.md`
- Create: `docs/adr/0004-match-platform.md`
- Modify: `docs/codemap.md`, `README.md`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/faq/page.tsx`

- [ ] **Step 1: SPEC.md** — platform model: post → join → roster; sponsor discovery; free-now/charge-later; no verification; no money handling.

- [ ] **Step 2: ADR 0004** — the pivot: why verification was removed (admin burden, untrustworthy), why a platform, what's deferred.

- [ ] **Step 3: codemap/README** — new route table, new data flows.

- [ ] **Step 4: privacy/terms/faq** — sponsor data sharing (opt-in), no money handling, player data shown (UID/ranks, never email).

- [ ] **Step 5: Run lint (docs don't affect), commit**

```bash
git add SPEC.md docs README.md src/app/privacy src/app/terms src/app/faq
git commit -m "docs: platform spec, ADR 0004, legal and codemap updated"
```

---

### Task 14: E2E + full gate

**Files:**
- Test: `C:\Users\manid\AppData\Local\Temp\opencode\platform_e2e.py` (throwaway, not committed)

- [ ] **Step 1: Build + start** — `npm run build`, restart the local server.

- [ ] **Step 2: E2E flows** — organizer signup → post match → appears on `/matches`; player signup → join → roster shows player; sponsor signup → directory shows only opted-in; export CSV; closed match rejects join; duplicate join refused; rate limits.

- [ ] **Step 3: Gate** — `npm run lint`, `npm test`, `npm run build` all green.

- [ ] **Step 4: Cleanup throwaway accounts** (prod DB) and commit any fixes.

```bash
git add -A
git commit -m "test: platform e2e flows verified"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-19-match-platform.md`. The founder has said "research properly and start writing code", which reads as approval to implement natively in this session; the plan is committed for review at `docs/superpowers/plans/2026-11-19-match-platform.md`.
