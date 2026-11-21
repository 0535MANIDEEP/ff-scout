# Final Circle reframe in place Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the existing Final Circle app in place so it uses the chosen stack properly: thin routes, server-only feature services, opaque database sessions, and Tailwind v4 as the single styling system, with out-of-scope surfaces removed.

**Architecture:** Keep the repository, database, deploy and product behaviour. Move domain logic from `src/app/actions.ts` and `src/lib/` into `features/<slice>/{actions,service,repository,schema,components,tests}` with `shared/` as the kernel. Replace `jose` JWT cookies with a `Session` table and SHA-256 token hashes. Convert global CSS and inline styles to Tailwind v4 utilities slice by slice, verifying in real Chrome after each slice.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 + Postgres, Zod 4, Tailwind v4 + `@tailwindcss/postcss`, `bcryptjs`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-22-reframe-in-place-design.md`

## Global Constraints

- Exact disclosure, imported never retyped: `Free entry only. No money handled by Final Circle. 18+.`
- Players never pay. No checkout, entry fee, paid tier, prize pool, escrow, KYC, payout, or money custody.
- 18+ only. No verified badges, screenshot review, approval queue, appeal queue, or admin bypass.
- Grievance and sponsor contact: `manideepdaram@gmail.com`.
- No fabricated statistics, scarcity, timestamps, counters, testimonials, or compliance claims.
- No tracking cookies, analytics cookies, ad pixels, or cross-site identity.
- One primary button per screen; secondary actions outlined or quiet.
- No destructive database migration. Legacy columns `entry`, `entryFee`, `prize`, `prizePool`, `paidUntil`, `visibleToSponsors` stay and are never rendered.
- Tests never read production `DATABASE_URL`. No-DB command: `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`.
- No new dependency except `tailwindcss@^4` and `@tailwindcss/postcss@^4`. `motion` and `jose` are removed.
- Every task ends with `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and a commit whose subject states the intent.
- Do not touch uncommitted files `next-env.d.ts`, `src/components/SiteHeader.tsx`, `src/components/ToastProvider.tsx`, `src/app/layout.tsx`, `src/styles/globals.css` beyond what each task explicitly lists; they are owner work.

## Review Focus

These five inputs are implied by the spec but not covered by ordinary route tests. Each has a pinned test in the task that owns the code.

1. Expired or revoked session cookie → treated as logged out, never grants access or throws. Pinned in Task 2, Step 2 and Task 3, Step 4.
2. Paused host calling `createMatch` directly → refused server-side even if the UI is bypassed. Pinned in Task 8, Step 2.
3. Concurrent joins on the last slot → exactly one succeeds, no oversell. Pinned in Task 8, Step 2.
4. Third `payment_request` report → must not extend the host's existing 7-day pause. Pinned in Task 10, Step 2.
5. Legacy row with non-null `entryFee`/`prizePool` → public DTO never exposes money fields. Pinned in Task 11, Step 2.

---

### Task 1: Realign intent docs

**Files:**
- Modify: `SPEC.md`
- Create: `docs/adr/0006-reframe-in-place.md`
- Modify: `docs/codemap.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-11-22-reframe-in-place-design.md` sections 4, 5 and 10.
- Produces: a repo where product line, roles, revenue and dismissals are readable in 60 seconds.

- [ ] **Step 1: Rewrite SPEC.md to the reframe scope**

Replace the "Who it serves" sponsor row and "Current scope" section so they no longer mention sponsor discovery, CSV export, appearance presets or waitlist. Keep the three revenue surfaces from spec section 10 verbatim. Add one line: "The app is reframed in place; the database and deploy are unchanged."

- [ ] **Step 2: Write ADR 0006**

```md
# ADR 0006: Reframe in place instead of a clean rebuild

Date: 2026-11-22

## Status
Accepted.

## Context
The existing Final Circle is deployed, passes CI, SEO and real-Chrome audits, and already uses Next 16, React 19, TypeScript strict, Prisma 6 + Postgres and Zod 4. A clean rebuild would discard working behaviour, SEO and traffic to gain internal tidiness.

## Decision
Keep the repository, database and deploy. Rework internals slice by slice: feature services, opaque database sessions, Tailwind v4 as the single styling system. Remove sponsor directory/export, appearance presets, admin role console and waitlist capture.

## Consequences
No destructive migration. All users are signed out once when JWT cookies are replaced. Tailwind conversion is the largest visual risk and is verified in real Chrome after each slice. Lawyer review remains required before launch.
```

- [ ] **Step 3: Update codemap folder structure and routes**

In `docs/codemap.md` replace the "Folder structure" block with the `src/` tree from spec section 6, delete the "Appearance" section, delete the `/sponsors`, `/admin/roles` and `/api/waitlist` route rows, and set `Last updated: 2026-11-22` and `Branch: ui-ux-audit-fixes`.

- [ ] **Step 4: Update README**

Replace any instruction referring to `SESSION_SECRET`, the sponsor directory, appearance presets or a paid guide. Add the no-DB test command from Global Constraints.

- [ ] **Step 5: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass.
Run: `git add SPEC.md README.md docs/adr/0006-reframe-in-place.md docs/codemap.md && git commit -m "docs: realign repo intent to in-place reframe"`

---

### Task 2: Add Session model and shared auth kernel

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261122130000_add_session/migration.sql`
- Create: `src/shared/db/client.ts`
- Create: `src/shared/auth/session.ts`
- Create: `test/session.test.js`
- Modify: `test/schema.test.js`

**Interfaces:**
- Consumes: existing `User` model, `src/lib/db.ts`.
- Produces:
  - `SESSION_COOKIE_NAME: 'fc_session'`
  - `SESSION_MAX_AGE_SECONDS: 604800`
  - `SESSION_COOKIE_OPTIONS` with `httpOnly: true`, `sameSite: 'lax'`, `secure` in production, `path: '/'`, `maxAge`.
  - `createSessionToken(userId: string): Promise<string>`
  - `readSessionUserId(token: string | undefined): Promise<string | null>`
  - `revokeSessionToken(token: string | undefined): Promise<void>`
  - `getCurrentUser(): Promise<SessionUser | null>` where `SessionUser = { id, email, displayName, userType, postingPausedUntil: Date | null }`

- [ ] **Step 1: Write the failing schema test**

Append to `test/schema.test.js`:

```js
test('Session model stores only a token hash and supports revocation', () => {
  const session = schema.slice(schema.indexOf('model Session {'), schema.indexOf('}', schema.indexOf('model Session {')) + 1);
  for (const f of ['tokenHash', 'userId', 'expiresAt', 'revokedAt', 'createdAt']) {
    assert.ok(session.includes(f), `Session is missing ${f}`);
  }
  assert.match(session, /@@unique\(\[tokenHash\]\)/);
  for (const gone of ['token String', 'rawToken', 'secret']) {
    assert.ok(!session.includes(gone), `Session must not store ${gone}`);
  }
});
```

- [ ] **Step 2: Add the Session model and migration**

In `prisma/schema.prisma` add after `model User`:

```prisma
model Session {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
}
```

Add `sessions Session[]` to `model User`. Create `prisma/migrations/20261122130000_add_session/migration.sql`:

```sql
CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

This is additive only; no existing column is dropped or backfilled.

- [ ] **Step 3: Create shared DB client**

Create `src/shared/db/client.ts` with the exact body of `src/lib/db.ts`. Do not delete `src/lib/db.ts` yet; consumers move in Task 8.

- [ ] **Step 4: Write the failing session unit test**

Create `test/session.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'shared', 'auth', 'session.ts'), 'utf8');

test('session token is random and only its hash is stored', () => {
  assert.match(source, /randomBytes\(32\)/);
  assert.match(source, /createHash\('sha256'\)/);
  assert.match(source, /tokenHash/);
  assert.doesNotMatch(source, /SignJWT|jwtVerify|SESSION_SECRET/);
});

test('cookie is httpOnly, lax and secure only in production', () => {
  assert.match(source, /httpOnly:\s*true/);
  assert.match(source, /sameSite:\s*'lax'/);
  assert.match(source, /secure:\s*process\.env\.NODE_ENV === 'production'/);
  assert.match(source, /maxAge:\s*SESSION_MAX_AGE_SECONDS/);
});

test('expired and revoked sessions cannot be read', () => {
  assert.match(source, /expiresAt:\s*\{ gt:/);
  assert.match(source, /revokedAt:\s*null/);
});

test('logout revokes the row', () => {
  assert.match(source, /revokedAt:\s*new Date\(\)/);
});
```

- [ ] **Step 5: Implement shared auth**

Create `src/shared/auth/session.ts`:

```ts
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/shared/db/client';

export const SESSION_COOKIE_NAME = 'fc_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  userType: 'player' | 'sponsor' | 'admin';
  postingPausedUntil: Date | null;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });
  return token;
}

export async function readSessionUserId(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const row = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true, revokedAt: true },
  });
  if (!row || row.revokedAt || row.expiresAt.getTime() <= Date.now()) return null;
  return row.userId;
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const userId = await readSessionUserId(jar.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, userType: true, postingPausedUntil: true },
  });
  if (!user) return null;
  return user as SessionUser;
}
```

- [ ] **Step 6: Verify the pinned failure mode**

Run: `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`
Expected: `schema.test.js` and `session.test.js` pass; no other test changes.

- [ ] **Step 7: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add prisma src/shared test/schema.test.js test/session.test.js && git commit -m "feat: add opaque session table and shared auth kernel"`

---

### Task 3: Move identity into a feature and cut over sessions

**Files:**
- Create: `src/features/identity/schema.ts`
- Create: `src/features/identity/repository.ts`
- Create: `src/features/identity/service.ts`
- Create: `src/features/identity/actions.ts`
- Create: `src/features/identity/service.test.ts`
- Modify: `src/app/login/actions.ts`
- Modify: `src/app/sign-up/actions.ts`
- Modify: `src/app/sign-out/route.ts`
- Delete: `src/lib/auth.ts`

**Interfaces:**
- Consumes: `createSessionToken`, `readSessionUserId`, `revokeSessionToken`, `getCurrentUser`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_OPTIONS` from Task 2; `checkRateLimit` from `src/lib/rate-limit.ts` until Task 13.
- Produces: `login(input: {email, password}): Promise<SessionUser | null>`, `signUp(input: {email, password, displayName, ageConfirmed}): Promise<SessionUser>`, `logout(): Promise<void>`, `identitySchemas.login`, `identitySchemas.signUp`.

- [ ] **Step 1: Write the failing identity service test**

Create `src/features/identity/service.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identitySchemas } from './schema';

test('login schema rejects a blank password and a bad email', () => {
  assert.equal(identitySchemas.login.safeParse({ email: 'not-an-email', password: 'x' }).success, false);
  assert.equal(identitySchemas.login.safeParse({ email: 'a@b.com', password: '' }).success, false);
  assert.equal(identitySchemas.login.safeParse({ email: 'a@b.com', password: 'ok' }).success, true);
});

test('signup schema requires explicit age confirmation', () => {
  const base = { email: 'a@b.com', password: 'longenough', displayName: 'Player' };
  assert.equal(identitySchemas.signUp.safeParse({ ...base, ageConfirmed: false }).success, false);
  assert.equal(identitySchemas.signUp.safeParse({ ...base, ageConfirmed: true }).success, true);
});
```

- [ ] **Step 2: Implement identity schema, repository and service**

Create `src/features/identity/schema.ts`:

```ts
import { z } from 'zod';

export const identitySchemas = {
  login: z.object({ email: z.email(), password: z.string().min(1) }),
  signUp: z.object({
    email: z.email(),
    password: z.string().min(8),
    displayName: z.string().trim().min(2).max(40),
    ageConfirmed: z.literal(true),
  }),
};
```

Create `src/features/identity/repository.ts`:

```ts
import 'server-only';
import { prisma } from '@/shared/db/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
```

Create `src/features/identity/service.ts`:

```ts
import 'server-only';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcryptjs';
import { identitySchemas } from './schema';
import { findUserByEmail } from './repository';
import {
  createSessionToken, revokeSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS,
  type SessionUser,
} from '@/shared/auth/session';

export async function login(input: unknown): Promise<SessionUser | null> {
  const parsed = identitySchemas.login.safeParse(input);
  if (!parsed.success) return null;
  const user = await findUserByEmail(parsed.data.email.toLowerCase());
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
  const token = await createSessionToken(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return {
    id: user.id, email: user.email, displayName: user.displayName,
    userType: user.userType, postingPausedUntil: user.postingPausedUntil,
  };
}

export async function signUp(input: unknown): Promise<SessionUser> {
  const parsed = identitySchemas.signUp.parse(input);
  const existing = await findUserByEmail(parsed.data.email.toLowerCase());
  if (existing) throw new Error('EMAIL_TAKEN');
  const user = await prismaCreateUser(parsed.data);
  const token = await createSessionToken(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return {
    id: user.id, email: user.email, displayName: user.displayName,
    userType: user.userType, postingPausedUntil: user.postingPausedUntil,
  };
}

async function prismaCreateUser(d: { email: string; password: string; displayName: string }) {
  const { prisma } = await import('@/shared/db/client');
  return prisma.user.create({
    data: {
      email: d.email.toLowerCase(), displayName: d.displayName,
      passwordHash: await hash(d.password, 12), userType: 'player',
      ageConfirmed: true,
    },
  });
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  await revokeSessionToken(token);
  jar.delete(SESSION_COOKIE_NAME);
}
```

The existing schema field is `ageConfirmed Boolean @default(false)`, so signup writes `ageConfirmed: true`.

- [ ] **Step 3: Thin the routes**

Replace `src/app/login/actions.ts` with:

```ts
'use server';
import { redirect } from 'next/navigation';
import { login, type ActionState } from '@/features/identity/actions';

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await login({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!user) return { ok: false, error: "We don't find that email and password. Sign up if this is your first time." };
  redirect(user.userType === 'sponsor' ? '/advertise' : '/player');
}
```

Create `src/features/identity/actions.ts`:

```ts
'use server';
import { login as loginService, signUp as signUpService, logout as logoutService } from './service';
import type { SessionUser } from '@/shared/auth/session';

export type ActionState = { ok: boolean; error?: string };

export async function login(input: unknown): Promise<SessionUser | null> {
  return loginService(input);
}

export async function signUp(input: unknown): Promise<SessionUser> {
  return signUpService(input);
}

export async function logout(): Promise<void> {
  return logoutService();
}
```

Apply the same thin pattern to `src/app/sign-up/actions.ts` (call `signUp`, redirect `/player`) and `src/app/sign-out/route.ts` (call `logout`, redirect `/`).

- [ ] **Step 4: Verify the pinned failure mode**

Append to `test/session.test.js`:

```js
test('a missing token returns null before any database lookup', () => {
  assert.match(source, /if \(!token\) return null/);
  assert.match(source, /if \(!row \|\| row\.revokedAt \|\| row\.expiresAt/);
});
```

Run: `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`
Expected: all tests pass.

Run: `grep -r "jose\|SESSION_SECRET\|ffscout_session\|signSession\|verifySession" src test`
Expected: no matches.

- [ ] **Step 5: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A src/features/identity src/app/login src/app/sign-up src/app/sign-out src/lib/auth.ts test && git commit -m "feat: cut over identity to opaque database sessions"`

---

### Task 4: Remove out-of-scope surfaces

**Files:**
- Delete: `src/app/sponsors/` (entire folder including `export/route.ts`)
- Delete: `src/app/sponsor/` (entire folder)
- Delete: `src/app/admin/roles/`
- Delete: `src/app/api/waitlist/route.ts`
- Delete: `src/components/AppearanceControl.tsx`
- Delete: `src/components/Waitlist.tsx`
- Delete: `src/lib/appearance.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/player/page.tsx`
- Modify: `test/appearance.test.js`
- Modify: `docs/moderation.md`, `docs/roles.md`, `docs/permissions.md`

**Interfaces:**
- Consumes: spec sections 5 and 10.
- Produces: no public route or nav link to sponsor discovery, waitlist, appearance presets, or role management.

- [ ] **Step 1: Delete the surfaces and their imports**

Delete the folders and files listed above. In `src/app/layout.tsx` remove the `appearanceInitScript` import and `<script dangerouslySetInnerHTML...>` line, remove `data-preset`, `data-density`, `data-motion` from `<html>`, remove `ToastProvider` only if it is unused elsewhere (keep it if `SiteHeader` imports it), and remove any nav link to `/sponsors`, `/admin` or `/learn` that a reviewer identifies as role management.

In `src/app/page.tsx` remove the card titled "3. Sponsors scout the opted-in" and its paragraph. Replace it with a card describing sponsor placements on `/advertise`, using this exact copy:

```tsx
<article className="card">
  <h3>3. Sponsors fund the board</h3>
  <p>Brands can fund a placement or a free event by email. Players never pay and Final Circle never handles money.</p>
</article>
```

- [ ] **Step 2: Delete the obsolete test and rewrite the copy contract test**

Delete `test/appearance.test.js`. Create `test/scope.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src');

test('no out-of-scope routes survive', () => {
  for (const p of ['app/sponsors', 'app/sponsor', 'app/admin/roles', 'app/api/waitlist']) {
    assert.equal(fs.existsSync(path.join(root, p)), false, `${p} still exists`);
  }
});

test('no appearance preset or jose import survives', () => {
  const files = [];
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else if (/\.(ts|tsx)$/.test(e.name)) files.push(full);
  });
  walk(root);
  const source = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  assert.doesNotMatch(source, /AppearanceControl|fc-appearance|from 'jose'/);
});
```

- [ ] **Step 3: Rewrite docs that describe removed roles**

In `docs/moderation.md`, `docs/roles.md`, `docs/permissions.md`, delete sections describing sponsor accounts, moderator roles, the sponsor directory and appearance presets. Keep only `player`, `sponsor` (email contact only) and `admin` (match close), matching the shipped permission model.

- [ ] **Step 4: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: `test/scope.test.js` passes; no broken imports.
Run: `git add -A && git commit -m "chore: remove sponsor directory, presets, waitlist and role console"`

---

### Task 5: Add Tailwind v4 foundation and shared UI primitives

**Files:**
- Modify: `package.json`
- Create: `postcss.config.mjs`
- Modify: `src/styles/globals.css`
- Create: `src/shared/ui/Button.tsx`
- Create: `src/shared/ui/Field.tsx`
- Create: `src/shared/ui/DisclosureBanner.tsx`
- Create: `test/tailwind.test.js`

**Interfaces:**
- Consumes: tokens in `src/styles/globals.css` lines 6-58.
- Produces: `Button`, `Field`, `DisclosureBanner` with Tailwind-only class names; `@theme` tokens named `--color-paper`, `--color-vermilion`, `--font-ui`, `--font-display`, `--font-mono`, `--radius-card`, `--content-width`.

- [ ] **Step 1: Install dependencies and PostCSS config**

Run: `npm install tailwindcss@^4 @tailwindcss/postcss@^4`

Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Write the failing Tailwind config test**

Create `test/tailwind.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'globals.css'), 'utf8');
const pkg = require('../package.json');

test('Tailwind v4 is installed and imported', () => {
  assert.ok(pkg.dependencies.tailwindcss.startsWith('^4'));
  assert.ok(pkg.devDependencies['@tailwindcss/postcss'] || pkg.dependencies['@tailwindcss/postcss']);
  assert.match(css, /@import "tailwindcss"/);
  assert.match(css, /@theme/);
});

test('the disclosure text lives in one module', () => {
  const files = fs.readdirSync(path.join(__dirname, '..', 'src', 'features', 'disclosure'));
  assert.ok(files.includes('copy.ts'));
});
```

- [ ] **Step 3: Replace globals.css with Tailwind tokens**

Replace `src/styles/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-paper: #f6f3ee;
  --color-ink: #171717;
  --color-vermilion: #d1442b;
  --color-line: #d9d3c8;
  --font-ui: var(--font-grotesk), system-ui, sans-serif;
  --font-display: var(--font-anton), 'Arial Black', sans-serif;
  --font-mono: var(--font-jbmono), ui-monospace, monospace;
  --radius-card: 12px;
  --content-width: 1120px;
}

:root { color-scheme: light; }

html { scroll-behavior: smooth; }

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-ui);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

:focus-visible { outline: 2px solid var(--color-vermilion); outline-offset: 2px; }
```

Keep the exact hex values from the current `globals.css` if they differ; do not invent new colours.

- [ ] **Step 4: Build shared UI primitives**

Create `src/shared/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const base = 'min-h-11 rounded-lg px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';
  const tone = variant === 'primary'
    ? 'bg-vermilion text-white hover:brightness-95'
    : 'border border-line bg-transparent text-ink hover:bg-black/5';
  return <button className={`${base} ${tone} ${className}`} {...rest} />;
}
```

Create `src/shared/ui/Field.tsx`:

```tsx
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode };

export function Field({ label, hint, id, className = '', ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input id={id} className={`min-h-11 rounded-lg border border-line bg-white px-3 ${className}`} {...rest} />
      {hint && <span className="text-ink/70">{hint}</span>}
    </label>
  );
}
```

Create `src/shared/ui/DisclosureBanner.tsx`:

```tsx
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';

export function DisclosureBanner() {
  return <p className="rounded-lg border border-line px-4 py-3 text-sm">{GLOBAL_DISCLOSURE}</p>;
}
```

Create `src/features/disclosure/copy.ts` now so the import resolves:

```ts
export const GLOBAL_DISCLOSURE = 'Free entry only. No money handled by Final Circle. 18+.';
export const FREE_ENTRY_NOTICE = 'Free entry only. Final Circle does not advertise cash prizes or handle money.';
export const FREE_ENTRY_TERMS = { entry: 'free', entryFee: null, prize: 'none', prizePool: null } as const;
export const PAYMENT_REPORT_CATEGORY = 'payment_request';
export const PAYMENT_REPORT_THRESHOLD = 2;
export const PAYMENT_REPORT_PAUSE_DAYS = 7;
```

- [ ] **Step 5: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: `test/tailwind.test.js` passes; build emits Tailwind CSS.
Run: `git add -A && git commit -m "feat: add Tailwind v4 tokens and shared UI primitives"`

---

### Task 6: Convert public routes to Tailwind

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/components/Hero.tsx`
- Modify: `src/app/matches/page.tsx`
- Modify: `src/app/matches/[id]/page.tsx`
- Modify: `src/app/safety/page.tsx`
- Modify: `src/app/advertise/page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/faq/page.tsx`
- Modify: `src/app/learn/page.tsx`
- Modify: `src/app/loadout/page.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/Wire.tsx`
- Modify: `src/components/Reveal.tsx`
- Modify: `src/components/BackToTop.tsx`
- Modify: `src/components/ZoneShrink.tsx`
- Modify: `src/components/RoleAvatar.tsx`
- Modify: `src/components/SignOut.tsx`

**Interfaces:**
- Consumes: `@theme` tokens and `Button`, `Field`, `DisclosureBanner` from Task 5.
- Produces: public routes with no global class names and no inline `style={{ ... }}` objects.

**Class mapping table** — apply to every file in this task:

| Existing | Tailwind |
|---|---|
| `className="shell"` | `mx-auto w-full max-w-[1120px] px-4` |
| `className="section"` | `py-12 md:py-16` |
| `className="card"` | `rounded-card border border-line bg-white p-5 shadow-sm` |
| `className="grid-3"` | `grid gap-4 md:grid-cols-3` |
| `className="lead"` | `text-lg text-ink/80` |
| `className="skip-link"` | `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-white focus:p-2` |
| `style={{ maxWidth: '42ch' }}` | `max-w-[42ch]` |
| `style={{ marginTop: 12 }}` | `mt-3` |
| `style={{ marginTop: 36 }}` | `mt-9` |
| `style={{ background: 'var(--panel)' }}` | `bg-paper` |

- [ ] **Step 1: Convert shared header and footer first**

In `src/components/SiteHeader.tsx` and `src/app/layout.tsx`, replace every `className` using the mapping table, replace `style` objects with the listed utilities, and import `Button` from `@/shared/ui/Button` wherever a button needs the one primary action. Keep the skip link and disclosure paragraph present. Confirm `data-theme`, `data-preset`, `data-density`, `data-motion` are gone from `<html>`.

- [ ] **Step 2: Convert each public route**

For each file listed above, replace `className` values using the mapping table and delete inline `style` objects. Keep all copy text byte-identical except the sponsor card already changed in Task 4. Where a route renders `GLOBAL_DISCLOSURE` or `FREE_ENTRY_NOTICE`, import from `@/features/disclosure/copy` instead of `@/lib/free-entry`.

- [ ] **Step 3: Verify no global classes remain**

Run: `grep -rn "className=\"shell\|className=\"section\|className=\"card\|style={{" src/app src/components`
Expected: no matches.

- [ ] **Step 4: Real Chrome check**

Open `http://localhost:3000/` in a real Chrome tab. Check at 375, 768 and 1440 px: no horizontal scroll, visible focus outline on the header links, exact disclosure visible in the footer, no console errors. Then check `/matches`, `/safety` and `/advertise` the same way.

- [ ] **Step 5: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A && git commit -m "style: convert public routes to Tailwind v4"`

---

### Task 7: Convert account routes to Tailwind

**Files:**
- Modify: `src/app/login/page.tsx`, `src/app/login/layout.tsx`
- Modify: `src/app/sign-up/page.tsx`, `src/app/sign-up/layout.tsx`
- Modify: `src/app/settings/page.tsx`, `src/app/settings/loading.tsx`
- Modify: `src/app/player/page.tsx`, `src/app/player/loading.tsx`
- Modify: `src/app/player/posted/page.tsx`
- Modify: `src/app/post/page.tsx`
- Modify: `src/app/post/series/page.tsx`
- Modify: `src/app/admin/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/matches/page.tsx`

**Interfaces:**
- Consumes: mapping table in Task 6, `Button` and `Field` from Task 5.
- Produces: account routes with no global class names and no inline styles.

- [ ] **Step 1: Convert forms to shared primitives**

In `src/app/login/page.tsx`, `src/app/sign-up/page.tsx`, `src/app/post/page.tsx` and `src/app/post/series/page.tsx`, replace each `<input>` and its `<label>` with `<Field label="..." id="..." name="..." />`, and each submit `<button>` with `<Button type="submit">`. Keep one primary button per screen, one focal point.

- [ ] **Step 2: Convert remaining markup**

Apply the Task 6 mapping table to every remaining file in this task. Delete inline `style` objects. Keep server action bindings and form field names unchanged.

- [ ] **Step 3: Verify and check in real Chrome**

Run: `grep -rn "className=\"shell\|className=\"section\|className=\"card\|style={{" src/app`
Expected: no matches.
Open `/login`, `/sign-up`, `/player`, `/post` in real Chrome at 375 and 1440 px: no horizontal scroll, focus visible, no console errors. Do not submit real account data.

- [ ] **Step 4: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A && git commit -m "style: convert account routes to Tailwind v4"`

---

### Task 8: Move matches into a feature slice

**Files:**
- Create: `src/features/matches/schema.ts`
- Create: `src/features/matches/repository.ts`
- Create: `src/features/matches/service.ts`
- Create: `src/features/matches/actions.ts`
- Create: `src/features/matches/service.test.js`
- Modify: `src/app/post/actions.ts`
- Modify: `src/app/matches/[id]/actions.ts`
- Delete: `src/lib/db.ts` (after all consumers import `@/shared/db/client`)

**Interfaces:**
- Consumes: `getCurrentUser` from Task 2, `FREE_ENTRY_TERMS` from Task 5, `checkRateLimit` from `src/lib/rate-limit.ts`.
- Produces:
  - `matchSchemas.create`
  - `createMatch(input: unknown): Promise<{ id: string }>`
  - `joinMatch(matchId: string): Promise<{ ok: true } | { ok: false; reason: string }>`
  - `listOpenMatches(): Promise<MatchCardDTO[]>` where `MatchCardDTO = { id, title, mode, gameType, date: string, city, online, slots: number | null, joined: number }`
  - `matchDTO(m: PrismaMatch): MatchCardDTO` — money fields are never in the DTO.

- [ ] **Step 1: Write the failing service tests**

Create `src/features/matches/service.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'service.ts'), 'utf8');

test('a paused host is refused in the service, not just the UI', () => {
  assert.match(source, /postingPausedUntil/);
  assert.match(source, /PAUSED/);
});

test('join is atomic and refuses oversell and host join', () => {
  assert.match(source, /\$transaction/);
  assert.match(source, /status:\s*'open'/);
  assert.match(source, /organizerId:\s*\{\s*not:/);
  assert.match(source, /PAYMENT_REPORT_THRESHOLD|slots/);
});

test('DTO never exposes legacy money fields', () => {
  assert.match(source, /export function matchDTO/);
  assert.doesNotMatch(source, /entryFee:|prizePool:/);
});
```

- [ ] **Step 2: Implement repository, service and schema**

Create `src/features/matches/schema.ts` using the exact `schema` object currently in `src/app/post/actions.ts`, exported as `matchSchemas.create`.

Create `src/features/matches/repository.ts`:

```ts
import 'server-only';
import { prisma } from '@/shared/db/client';

export async function findHost(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { postingPausedUntil: true },
  });
}

export async function listOpen() {
  return prisma.match.findMany({
    where: { status: 'open' },
    orderBy: { date: 'asc' },
    select: {
      id: true, title: true, mode: true, gameType: true, date: true,
      city: true, online: true, slots: true,
      _count: { select: { entries: true } },
    },
  });
}
```

Create `src/features/matches/service.ts`:

```ts
import 'server-only';
import { prisma } from '@/shared/db/client';
import { getCurrentUser, type SessionUser } from '@/shared/auth/session';
import { matchSchemas } from './schema';
import { findHost, listOpen } from './repository';
import { FREE_ENTRY_TERMS } from '@/features/disclosure/copy';
import { endsAtFor } from '@/lib/schedule';
import { checkRateLimit } from '@/lib/rate-limit';
import type { Match } from '@prisma/client';

export type MatchCardDTO = {
  id: string; title: string; mode: string; gameType: string;
  date: string; city: string; online: boolean;
  slots: number | null; joined: number;
};

export function matchDTO(m: Match): MatchCardDTO {
  return {
    id: m.id, title: m.title, mode: m.mode, gameType: m.gameType,
    date: m.date.toISOString(), city: m.city, online: m.online,
    slots: m.slots, joined: 0,
  };
}

export async function createMatch(input: unknown): Promise<{ id: string }> {
  const user = await requireUser();
  const host = await findHost(user.id);
  if (host?.postingPausedUntil && host.postingPausedUntil.getTime() > Date.now()) {
    throw new Error('PAUSED');
  }
  const rl = await checkRateLimit(`postmatch:${user.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) throw new Error('RATE_LIMIT');
  const d = matchSchemas.create.parse(input);
  if (d.date.getTime() < Date.now() - 60 * 60 * 1000) throw new Error('BAD_DATE');
  const match = await prisma.match.create({
    data: {
      organizerId: user.id,
      title: d.title, mode: d.mode, gameType: d.gameType,
      ...FREE_ENTRY_TERMS,
      status: 'open', date: d.date,
      endsAt: endsAtFor(d.date, d.durationMinutes),
      city: d.city, online: d.online === 'yes',
      slots: d.slots ?? null,
      contact: d.contact ?? null,
      notes: d.notes ?? null,
    },
  });
  return { id: match.id };
}

export async function joinMatch(matchId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await requireUser();
  return prisma.$transaction(async tx => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match || match.status !== 'open') return { ok: false, reason: 'CLOSED' };
    if (match.organizerId === user.id) return { ok: false, reason: 'HOST' };
    const existing = await tx.matchEntry.findUnique({
      where: { matchId_playerId: { matchId, playerId: user.id } },
    });
    if (existing) return { ok: false, reason: 'DUPLICATE' };
    if (match.slots !== null) {
      const updated = await tx.match.updateMany({
        where: { id: matchId, slots: { gt: 0 } },
        data: { slots: { decrement: 1 } },
      });
      if (updated.count === 0) return { ok: false, reason: 'FULL' };
    }
    await tx.matchEntry.create({ data: { matchId, playerId: user.id } });
    return { ok: true };
  }, { isolationLevel: 'Serializable' });
}

export async function listMatches(): Promise<MatchCardDTO[]> {
  const rows = await listOpen();
  return rows.map(r => ({
    id: r.id, title: r.title, mode: r.mode, gameType: r.gameType,
    date: r.date.toISOString(), city: r.city, online: r.online,
    slots: r.slots, joined: r._count.entries,
  }));
}

async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
```

- [ ] **Step 3: Thin the actions**

Replace `src/app/post/actions.ts` with a Zod-validating action that calls `createMatch` once and redirects. Replace `src/app/matches/[id]/actions.ts` `joinMatch` with an action that reads `formData.get('matchId')`, calls the service once, and redirects. Keep `reportMatch` unchanged until Task 10.

- [ ] **Step 4: Replace remaining `@/lib/db` imports**

Run: `grep -rln "@/lib/db" src`
For each match, change the import to `@/shared/db/client`. When no matches remain, delete `src/lib/db.ts`.

- [ ] **Step 5: Verify the pinned failure modes**

Run the existing `test/smoke.test.js` and `test/erasure.test.js` with the no-DB command. Expected: pass or skip only for missing DB, no assertion failures.

- [ ] **Step 6: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A && git commit -m "refactor: move matches into server-only feature slice"`

---

### Task 9: Move series and trust rules into features

**Files:**
- Create: `src/features/trust/rules.ts`
- Create: `src/features/series/repository.ts`
- Create: `src/features/series/service.ts`
- Modify: `src/app/post/series/actions.ts`
- Modify: `src/app/player/posted/actions.ts`
- Modify: `src/app/matches/page.tsx`
- Delete: `src/lib/series.ts`, `src/lib/series-ops.ts`, `src/lib/series-sweep.ts`, `src/lib/schedule.ts`

**Interfaces:**
- Consumes: `getCurrentUser` from Task 2, `prisma` from Task 2.
- Produces: `seriesEligibility(userId)`, `createSeries(input)`, `runSeriesSweep()` with unchanged behaviour.

- [ ] **Step 1: Move pure rules first**

Copy the pure functions from `src/lib/series.ts` and `src/lib/schedule.ts` into `src/features/trust/rules.ts` without changing logic. Keep the fixed `+05:30` IST math exactly as shipped. Run `test/schedule.test.js`, `test/series.test.js` and `test/series-ops.test.js` — expected pass.

- [ ] **Step 2: Move data access**

Create `src/features/series/repository.ts` from the Prisma queries in `src/lib/series-ops.ts` and `src/lib/series-sweep.ts`. Create `src/features/series/service.ts` that owns authorization and calls exactly one repository function per operation. Import free-entry terms from `@/features/disclosure/copy`, not `@/lib/free-entry`.

- [ ] **Step 3: Update callers and delete old files**

Update `src/app/post/series/actions.ts`, `src/app/player/posted/actions.ts` and `src/app/matches/page.tsx` to import from `@/features/series/service`. Delete the four old `src/lib` files once no imports remain.

- [ ] **Step 4: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: `test/schedule.test.js`, `test/series.test.js`, `test/series-ops.test.js` pass unchanged.
Run: `git add -A && git commit -m "refactor: move series and trust rules into features"`

---

### Task 10: Move reports into a feature and pin the pause rule

**Files:**
- Create: `src/features/reports/schema.ts`
- Create: `src/features/reports/repository.ts`
- Create: `src/features/reports/service.ts`
- Modify: `src/app/matches/[id]/actions.ts`
- Create: `test/report-pause.test.js`

**Interfaces:**
- Consumes: `PAYMENT_REPORT_CATEGORY`, `PAYMENT_REPORT_THRESHOLD`, `PAYMENT_REPORT_PAUSE_DAYS` from Task 5, `getCurrentUser` from Task 2.
- Produces: `reportMatch(input: { matchId, category, reason }): Promise<{ ok: true } | { ok: false; reason: string }>`.

- [ ] **Step 1: Write the failing pause test**

Create `test/report-pause.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'reports', 'service.ts'), 'utf8');

test('only joined reporters count', () => {
  assert.match(source, /matchEntry/);
  assert.match(source, /PAYMENT_REPORT_CATEGORY/);
});

test('threshold is two and a third report does not extend the pause', () => {
  assert.match(source, /PAYMENT_REPORT_THRESHOLD/);
  assert.match(source, /length < PAYMENT_REPORT_THRESHOLD/);
  assert.match(source, /postingPausedUntil:\s*null/);
  assert.match(source, /PAYMENT_REPORT_PAUSE_DAYS/);
});
```

- [ ] **Step 2: Implement the report service**

Create `src/features/reports/schema.ts` with a Zod object: `matchId` string, `category` enum of `payment_request | fake_match | other`, `reason` string min 5 max 500.

Create `src/features/reports/repository.ts` with Prisma queries for `report.findUnique`, `report.count`, `report.create`.

Create `src/features/reports/service.ts`:

```ts
import 'server-only';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { reportSchemas } from './schema';
import {
  PAYMENT_REPORT_CATEGORY, PAYMENT_REPORT_THRESHOLD, PAYMENT_REPORT_PAUSE_DAYS,
} from '@/features/disclosure/copy';

export async function reportMatch(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, reason: 'UNAUTHENTICATED' };
  const d = reportSchemas.parse(input);
  try {
    await prisma.$transaction(async tx => {
      const joined = await tx.matchEntry.findUnique({
        where: { matchId_playerId: { matchId: d.matchId, playerId: user.id } },
      });
      await tx.report.create({
        data: {
          matchId: d.matchId, reporterId: user.id,
          category: d.category, reason: d.reason,
        },
      });
      if (d.category !== PAYMENT_REPORT_CATEGORY || !joined) return;
      const count = await tx.report.count({
        where: { matchId: d.matchId, category: PAYMENT_REPORT_CATEGORY },
      });
      if (count < PAYMENT_REPORT_THRESHOLD) return;
      const match = await tx.match.findUnique({ where: { id: d.matchId } });
      if (!match || match.status === 'closed') return;
      await tx.match.update({ where: { id: d.matchId }, data: { status: 'closed' } });
      await tx.user.updateMany({
        where: { id: match.organizerId, postingPausedUntil: null },
        data: { postingPausedUntil: new Date(Date.now() + PAYMENT_REPORT_PAUSE_DAYS * 86400000) },
      });
      await tx.auditLog.create({
        data: { userId: user.id, action: 'report:auto_pause', detail: d.matchId },
      });
    }, { isolationLevel: 'Serializable' });
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: 'DUPLICATE' };
  }
}
```

The `postingPausedUntil: null` filter in `updateMany` is what stops a third report from extending the pause. Confirm the column is nullable in `prisma/schema.prisma` before running.

- [ ] **Step 3: Thin the report action**

In `src/app/matches/[id]/actions.ts`, replace the body of `reportMatch` with one call to the service and a redirect. Remove the duplicated counting logic.

- [ ] **Step 4: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: `test/report-pause.test.js` passes and all existing report tests pass.
Run: `git add -A && git commit -m "refactor: move reports into feature and pin pause idempotence"`

---

### Task 11: Move disclosure and sponsors, pin the DTO boundary

**Files:**
- Create: `src/features/sponsors/placement.ts`
- Create: `src/features/matches/dto.test.js`
- Modify: all remaining files importing `@/lib/free-entry`
- Delete: `src/lib/free-entry.ts`, `src/lib/brand.ts` (move contents to `src/shared/config/brand.ts`)

**Interfaces:**
- Consumes: `src/features/disclosure/copy.ts` from Task 5.
- Produces: one import path for all disclosure strings: `@/features/disclosure/copy`; `SPONSOR_LINE` read from `process.env` in `src/features/sponsors/placement.ts`.

- [ ] **Step 1: Write the failing DTO boundary test**

Create `src/features/matches/dto.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'service.ts'), 'utf8');

test('public match DTO has no money field', () => {
  const dto = source.slice(source.indexOf('export function matchDTO'), source.indexOf('export async function createMatch'));
  for (const gone of ['entryFee', 'prizePool', 'paidUntil', 'visibleToSponsors']) {
    assert.ok(!dto.includes(gone), `DTO exposes ${gone}`);
  }
});

test('legacy rows with non-null money values cannot reach the board', () => {
  assert.match(source, /select:\s*\{/);
  assert.doesNotMatch(source, /select:\s*\{\s*\*/);
});
```

- [ ] **Step 2: Create sponsor placement copy**

Create `src/features/sponsors/placement.ts`:

```ts
export const SPONSOR_CONTACT_EMAIL = 'manideepdaram@gmail.com';
export const SPONSOR_LINE = process.env.SPONSOR_LINE ?? '';
export const SPONSOR_COPY = 'Sponsor placements and sponsor-funded free events are arranged by email. Players never pay and Final Circle never handles money.';
```

- [ ] **Step 3: Repoint all disclosure imports**

Run: `grep -rln "@/lib/free-entry\|@/lib/brand" src`
For each file, change imports to `@/features/disclosure/copy` and `@/shared/config/brand` respectively. Move `src/lib/brand.ts` verbatim to `src/shared/config/brand.ts`. Delete `src/lib/free-entry.ts` when no imports remain.

- [ ] **Step 4: Verify exact disclosure**

Run: `grep -rn "Free entry only. No money handled by Final Circle. 18+." src`
Expected: only `src/features/disclosure/copy.ts` contains the literal; all other routes import it.

- [ ] **Step 5: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A && git commit -m "refactor: centralise disclosure and sponsor copy, pin DTO boundary"`

---

### Task 12: Relabel notes as Requirements

**Files:**
- Modify: `src/app/post/page.tsx`
- Modify: `src/app/matches/[id]/page.tsx`
- Modify: `src/features/matches/schema.ts`
- Create: `test/requirements.test.js`

**Interfaces:**
- Consumes: existing `notes String?` column on `Match`; no schema change.
- Produces: post form label `Requirements` and match detail label `Requirements`, still backed by `notes`.

- [ ] **Step 1: Write the failing test**

Create `test/requirements.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const post = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'post', 'page.tsx'), 'utf8');
const detail = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'matches', '[id]', 'page.tsx'), 'utf8');
const schema = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');

test('the Requirements label reuses notes without a new column', () => {
  assert.match(post, /Requirements/);
  assert.match(post, /name="notes"/);
  assert.match(detail, /Requirements/);
  assert.doesNotMatch(schema, /requirements\s+String/);
});
```

- [ ] **Step 2: Change labels only**

In `src/app/post/page.tsx`, change the visible label for the `notes` field to `Requirements` and add hint copy: `Role, mic, experience or skill in your own words.` Keep `name="notes"` and the 500-character limit from `src/features/matches/schema.ts`. In `src/app/matches/[id]/page.tsx`, change the rendered `notes` label to `Requirements`.

- [ ] **Step 3: Gate and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Run: `git add -A && git commit -m "feat: label match notes as Requirements"`

---

### Task 13: Remove leftovers and run full verification

**Files:**
- Modify: `package.json`
- Delete remaining files under `src/lib/` if empty
- Modify: `docs/codemap.md`
- Create: `docs/handoff-launch.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a clean `src/` tree, all gates green, a launch handoff document.

- [ ] **Step 1: Move the remaining lib helpers and remove unused dependencies**

Move each file verbatim, then repoint its importers:

| From | To |
|---|---|
| `src/lib/config.ts` | `src/shared/config/match.ts` |
| `src/lib/permissions.ts` | `src/shared/auth/permissions.ts` |
| `src/lib/rate-limit.ts` | `src/shared/rate-limit.ts` |
| `src/lib/seo.ts` | `src/shared/seo.ts` |
| `src/lib/account.ts` | `src/features/identity/account.ts` |
| `src/lib/team.ts` | `src/features/matches/team.ts` |
| `src/lib/learn.ts` | `src/features/disclosure/learn.ts` |
| `src/lib/aff.ts` | `src/features/sponsors/affiliate.ts` |
| `src/lib/hero-data.ts` | `src/features/matches/hero-data.ts` |

`src/shared/test/` is created only when a DB-backed test actually needs factories. Do not add an empty placeholder folder now.

Run: `npm uninstall motion jose`
Run: `grep -rn "from '@/lib/\|require.*lib/" src test`
Expected: no matches. Delete `src/lib/` once empty.

Run: `npm run lint && npm run typecheck && npm test && npm run build` before continuing.

- [ ] **Step 2: Copy audit**

Run a script over the built public routes that asserts the exact disclosure is present and rejects `₹`, `entry fee`, `prize pool`, `verified`, and `Sponsors scout the opted-in`. Confirm no public route contains a sponsor directory link.

- [ ] **Step 3: SEO audit**

Run the regex audit: internal links including `route.ts`, canonical uniqueness, title and description lengths, title/H1 agreement, broken links. All checks must pass.

- [ ] **Step 4: Real Chrome verification**

Open the live local app in a real Chrome tab. At 375, 768 and 1440 px, and at 200% zoom, check `/`, `/matches`, `/matches/[id]`, `/safety`, `/advertise`, `/login`, `/sign-up`, `/post`: no horizontal scroll, visible focus, keyboard operation, exact disclosure, no console errors. Confirm all users are signed out once after the session cutover and that logging in again works.

- [ ] **Step 5: Full local gate**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass. Record the output in `docs/handoff-launch.md`, including the explicit release note line: "All users are signed out once because JWT cookies were replaced with database sessions. Log in again to continue."

- [ ] **Step 6: Update codemap and commit**

Rewrite the `Folder structure` section of `docs/codemap.md` to the final tree and set `Last updated: 2026-11-22`.
Run: `git add -A && git commit -m "chore: verify reframe and prepare launch handoff"`

---

### Task 14: Lawyer review (external blocker)

**Files:**
- Modify: `docs/handoff-launch.md`

**Interfaces:**
- Consumes: Task 13 output.
- Produces: written sign-off or a list of required copy changes.

- [ ] **Step 1: Hand off**

Send the owner the final URLs, `SPEC.md`, `docs/adr/0005-legal-safe-free-entry-and-revenue.md`, `docs/adr/0006-reframe-in-place.md` and `docs/handoff-launch.md`. State: "This is not legal advice. A qualified lawyer must review before public launch."

- [ ] **Step 2: Record the result**

Write the lawyer's written sign-off, or each requested change, into `docs/handoff-launch.md`. Do not launch until sign-off is recorded.
