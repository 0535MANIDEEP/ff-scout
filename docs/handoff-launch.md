# Launch handoff — 2026-11-22

Branch: `ui-ux-audit-fixes` (Task 13). This document records what was actually run and observed. See `## Legal review decision` below.

## Legal review decision

External legal review was not performed for this launch. No legal sign-off was obtained or is claimed. This record is not legal advice and makes no representation about legal compliance. The app's operating constraints are unchanged: free entry only, no money handled by Final Circle, 18+, disclosed sponsor placements, affiliate links and sponsor-funded free events, and the shipped disclosures on `/safety` and `/terms`.

## Release note (exact wording)

> All users are signed out once because JWT cookies were replaced with database sessions. Log in again to continue.

## Environment used for verification

- Local production server: `npm run start` on `http://127.0.0.1:3000`, built from this tree.
- Database: a dedicated local scratch Postgres database `ffscout_task13_scratch` on `127.0.0.1:5432`, created for this task and reset with `prisma db push --force-reset --skip-generate`.
- **The Neon URL in `.env.local` / `.env` was never used.** `DATABASE_URL` was explicitly overridden with the scratch URL for the server and every DB-backed run, and explicitly removed for the four prescribed gates.
- No production credentials or real account data were submitted. The login round trip used a synthetic scratch user (`task13-check@example.test`) created only in the scratch database.

## Gate results

Four commands were run separately, in order, twice (Step 1 after the moves, Step 5 after all audits and Chrome checks). Both runs passed identically.

| Gate | Command | Result |
|---|---|---|
| 1 | `npm run lint` | PASS (no output; `tsc --noEmit`) |
| 2 | `npm run typecheck` | PASS (no output; `tsc --noEmit`) |
| 3 | `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test` | PASS — 57 tests, 53 pass, 0 fail, 4 DB-gated skips |
| 4 | `npm run build` | PASS — Next.js 16.4.6, 23 static/dynamic pages generated, no errors |

Final gate 3 tail:

```txt
ℹ tests 57
ℹ suites 0
ℹ pass 53
ℹ fail 0
ℹ cancelled 0
ℹ skipped 4
ℹ todo 0
ℹ duration_ms 5549.6252
```

Final gate 4 tail:

```txt
✓ Generating static pages using 15 workers (23/23) in 2.4s
✓ Compiled successfully in 1061ms
Route (app)         Revalidate  Expire
┌ ○ /                       5m      1y
...
ƒ /sign-out
○ /sitemap.xml
○ /terms
```

Additional DB-backed run (not one of the four prescribed gates): with `DATABASE_URL` pointed only at the scratch database, `npm test` ran **61 tests, 61 pass, 0 fail, 0 skip**, including the repointed erasure, series and team harnesses. This proves the moved-file test paths work when the DB-gated suites actually execute.

## Copy audit — full output

Audit method: a temporary local script (not shipped in this repo) run against `http://127.0.0.1:3000`.

```txt
Copy audit: http://127.0.0.1:3000
Disclosure: Free entry only. No money handled by Final Circle. 18+.
PASS /
PASS /about
PASS /advertise
PASS /faq
PASS /learn
FAIL /loadout
  - banned literal: ₹
PASS /privacy
FAIL /safety
  - new positive claim "entry fee": what we do not do we do not ask players to pay an entry fee, deposit or stake to join a listing.
FAIL /terms
  - new positive claim "entry fee": never pay an entry fee, deposit or stake to join a listing.
  - new positive claim "verified": final circle does not verify players or issue verified badges.
PASS /matches
PASS /login
PASS /sign-up
Allowlisted shipped denial sentences: 12
RESULT: FAIL
```

Interpretation (no shipped copy was changed):

- `/loadout` — the `₹` is the long-standing disclosed gear price bands in `src/config/loadout.json` (e.g. `₹15,000 – ₹30,000`), last changed in commit `a521262`, untouched by this task. This is disclosed affiliate gear pricing, not a money-handling claim by Final Circle.
- `/safety` — the flagged sentence is the shipped denial `We do not ask players to pay an entry fee, deposit or stake to join a listing.` (`src/app/safety/page.tsx:48`). The script's sentence splitter pulled the preceding heading `What we do not do` into the same "sentence", so it no longer matches the byte-identical allowlisted sentence.
- `/terms` — both flags are shipped denials: `Joining is free. Never pay an entry fee, deposit or stake to join a listing.` and `Your rank is self-declared. Final Circle does not verify players or issue verified badges.` (`src/app/terms/page.tsx:36-37`). The splitter dropped the first clause of each, so neither matches the allowlist entry.

All four flags are therefore false positives from the provided script's literal `₹` rule and sentence-boundary handling against pre-existing shipped copy. No genuinely new positive claim was found. The exact disclosure is present on all 12 routes, no `Sponsors scout the opted-in` text and no sponsor directory link was found on any route. This is recorded as a concern rather than a PASS that was not observed.

## SEO audit — full output

Audit method: a temporary local script (not shipped in this repo).

```txt
Routes discovered: 21 (pages + route.ts handlers)
Internal links checked: 137
Canonicals checked: 5
Title/description records: 19
H1s checked: 21
Warnings: 15
  WARN no description alongside title src/app/admin/layout.tsx
  WARN no description alongside title src/app/admin/matches/page.tsx
  WARN no description alongside title src/app/layout.tsx
  WARN no description alongside title src/app/login/layout.tsx
  WARN no description alongside title src/app/player/page.tsx
  WARN no description alongside title src/app/player/posted/page.tsx
  WARN no description alongside title src/app/post/page.tsx
  WARN no description alongside title src/app/post/series/page.tsx
  WARN no description alongside title src/app/settings/page.tsx
  WARN no description alongside title src/app/sign-up/layout.tsx
  WARN title/H1 wording differs: "FAQ: free entry, no money handled, Final Circle" vs "Frequently asked" (src/app/faq/page.tsx)
  WARN title/H1 wording differs: "Your dashboard, Final Circle" vs "Welcome," (src/app/player/page.tsx)
  WARN no in-app link points to /admin
  WARN no in-app link points to /loadout
  WARN no in-app link points to /sign-out
Fatal findings: 0
RESULT: PASS
```

The 15 warnings are the calibrated baseline (private `privateMetadata` pages, shipped FAQ/player wording, and intentionally unlinked `/admin`, `/loadout`, `/sign-out`). None were changed.

## Real Chrome verification

Real Chrome via the connected browser relay. Viewports: 375×812, 768×1024, 1440×900, and 720 CSS px at deviceScaleFactor 2 (the layout equivalent of 1440 physical px at 200% browser zoom). Routes checked: `/`, `/matches`, `/matches/[id]`, `/safety`, `/advertise`, `/login`, `/sign-up`, `/post` — 32 route/viewport combinations.

For every combination:

- `document.documentElement.scrollWidth <= window.innerWidth` — **no horizontal scroll** (e.g. 360/375, 753/768, 1425/1440, 705/720).
- Exact disclosure `Free entry only. No money handled by Final Circle. 18+.` present in `document.body.innerText` — **PASS**.
- First `Tab` moved focus to the "Skip to content" link with a visible solid red outline (`1.6px`, `rgb(200, 30, 30)`) — **visible focus PASS**.
- Console errors captured with `errorsOnly: true` — **0 on all 32 combinations**.
- Keyboard operation: at 200% zoom, Tab repeated through `Skip to content → FC Final Circle → Menu → Post a match → Find a match`, then `Enter` navigated to `/matches` — **PASS**.

Hero animation after the `motion` removal:

- Normal motion: computed style on the `<figure>` showed `animationName: hero-in`, `animationDuration: 0.5s`, and in-flight `opacity: 0.721166` / `transform: matrix(1, 0, 0, 1, 0, 3.90368)` — the 500 ms opacity + `translateY(14px)` entry is live, now from CSS only.
- Reduced motion (`reducedMotion: 'reduce'`): `animationDuration: 1e-05s`, `opacity: 1`, `transform: matrix(1, 0, 0, 1, 0, 0)` — **static figure PASS**.

Session cutover, using only the scratch database:

- Signed out: `/settings` redirected to `/login`, no active session.
- Login with the synthetic scratch user: redirected to `/player`, body rendered `Welcome, Task13 Check` with a `Sign out` control — **logging in again works**.
- `/sign-out` then `/settings` redirected back to `/login` — **signed out again**.
- A scratch DB session row is created with a SHA-256 token hash and revoked on logout; no JWT signing secret is involved.

Console warnings observed were browser-level `Permissions-Policy` warnings for `browsing-topics`, `run-ad-auction` and `join-ad-interest-group` (source `security`), which are pre-existing and unrelated to this task. No new console errors or regressions were reproduced. The two warnings named in the brief (CSP `eval()` from `next.config.mjs:7`, `/post` `<option selected>`) did not reproduce on this production server run; they are not claimed as fixed.

## Cleanup verified

- `motion` and `jose` removed from `package.json` and `package-lock.json`; `npm uninstall` reported 0 vulnerabilities.
- `src/lib/` removed. Recursive scans over `src` and `test` for `src/lib/db.ts|from './db'|@/lib/db`, `from '@/lib/|require.*lib/` and `src/lib/` all returned no matches before deletion.
- `src/features/identity/service.test.ts` deleted; its schema assertions now run from `test/identity.test.js` as plain CommonJS source-level tests (visible as the first two passing tests in the gate output).
- `src/components/ToastProvider.tsx` deleted from disk (it was untracked; it is not in the commit).
- `next-env.d.ts` remains modified and uncommitted, as required.
- Docs updated: `docs/codemap.md` folder structure, `docs/permissions.md`, `docs/content-map.md`, `docs/security-review.md`, `docs/system-design/match-platform.md`, and a supersession pointer in `docs/adr/0002-backend-hardening.md`.
- Stale JWT/session and `src/lib/` pointers remain only in the historical ADRs 0002 (superseded by ADR 0006) and 0003; all current live docs use the feature/shared paths. The AI-agent plan/spec archives were later removed from the repository.

## Outstanding

- The copy audit script reports `RESULT: FAIL` for the four pre-existing-copy false positives documented above; the script itself was not modified and no shipped copy was altered by that release.

## Post-release sanitisation

A later commit removed the AI-agent working documents and plan/spec archives from the repository, made the public contact address and canonical URL deployment settings (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`), removed personal names and local machine paths from docs, and deleted the obsolete Cloudinary configuration. No data, schema or auth behaviour changed. The exact disclosure string was not touched.
