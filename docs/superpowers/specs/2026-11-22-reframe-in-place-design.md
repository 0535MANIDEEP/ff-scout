# Design: Final Circle reframe in place

Date: 2026-11-22  
Status: approved by owner, awaiting written implementation plan

## 1. Intent

Keep the Final Circle that is already built, deployed, audited and live. Do not create a new project, a new repository, or a clean database. Use the chosen stack **properly** inside the existing project.

The product line is unchanged: a free community board for Indian Free Fire players where a host posts a match, players join or show interest, and anyone can find other posts. The site grows a real community and earns legally without charging users.

Success looks like:

1. The live app keeps working at every atomic step; no big-bang cutover.
2. `app/` routes are thin; domain logic lives in server-only feature services.
3. Sessions are opaque database-backed tokens, not JWTs signed with an in-source key.
4. Tailwind v4 is the single styling system; the custom CSS system and appearance presets are gone.
5. Sponsor directory/export, appearance presets, admin role console, and waitlist capture are removed.
6. The exact disclosure stays on every public route and revenue stays limited to the three legal methods.
7. Lint, strict typecheck, tests, build, copy audit, SEO audit and real Chrome checks pass.
8. A qualified lawyer reviews the final product and copy before launch.

## 2. Decision that changed

An earlier spec proposed a clean rebuild with a new database. That was the wrong trade: the existing app already has the same stack, the same core product, the same legal rules, and a passing deploy. Throwing it away would lose working behaviour, SEO and traffic to gain internal tidiness.

This spec replaces that one. The database, deploy and product behaviour stay; only the internal structure, sessions, styling and out-of-scope surfaces change.

## 3. Non-negotiable rules

- Players never pay. No checkout, entry fee, paid tier, prize pool, escrow, KYC, payout, or money custody.
- 18+ only.
- Exact disclosure: `Free entry only. No money handled by Final Circle. 18+.`
- No verified badges, screenshot review, human approval queue, appeal queue, or admin bypass of automatic consequences.
- No fabricated statistics, scarcity, timestamps, counters, testimonials, or compliance claims.
- No tracking cookies, analytics cookies, ad pixels, or cross-site identity.
- One primary button per screen. Secondary actions are outlined or quiet.
- Qualified lawyer review is required before launch.
- No destructive database migration. Legacy columns stay in place and are never rendered.

## 4. What stays untouched

- Repository, Vercel project, domain, deploy pipeline, SEO metadata, robots and sitemap.
- Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 with Postgres, Zod 4.
- Existing database, all migrations, seeded rows, and dormant legacy columns (`entryFee`, `prizePool`, `paidUntil`, `visibleToSponsors`). New writes remain forced to `free`/`none`/`null` through `src/lib/free-entry.ts` until that helper moves into the disclosure feature.
- Free match posting and joining, roster, weekly series, report categories, two joined `payment_request` reports closing a match and pausing the host for exactly 7 days from server time, and the audit log.
- Consent, age confirmation, withdrawal and erasure behaviour as shipped. No new consent schema in this reframe.
- Grievance contact: `manideepdaram@gmail.com`.

## 5. What is removed

| Item | Reason |
|---|---|
| `/sponsors` directory, `/sponsors/export` CSV, `/sponsor/sign-up`, `visibleToSponsors` | Data monetisation, out of scope by owner decision |
| Four appearance presets, custom accent, `fc-appearance` browser state | Scope cut; one styling system only |
| `/admin/roles` role console and role inflation | Does not help someone join a match |
| Waitlist capture and `WaitlistEntry` usage | Out of scope capture |
| `jose` and `SESSION_SECRET` | Replaced by opaque database sessions |
| `motion` dependency | CSS transition only in v1 |
| Custom global component CSS and inline style objects | Replaced by Tailwind v4 utilities |

Public copy that promises verification, paid tiers, sponsor discovery of players, or money handling is rewritten in the same atomic task that removes the surface.

## 6. Architecture and boundaries

```txt
src/
  app/                    thin routes + metadata only
    (public)/             /, /matches/[id], /safety, /advertise, /privacy, /terms
    (account)/            /sign-up, /login, /settings, /player, /post
    api/                  route handlers only when a Server Action cannot serve
  features/
    identity/             signup, login, logout, sessions, consent, erasure
    matches/              create, board query, join, roster, close
    series/               weekly series template and occurrence materialisation
    reports/              categories, joined-report counting, auto-pause
    trust/                pure pause/ladder rules shared by matches and series
    sponsors/             placement copy and email contact, no directory or export
    disclosure/           exact legal copy imported everywhere
    <slice>/ actions.ts · service.ts · repository.ts · schema.ts · components/ · *.test.ts
  shared/
    db/                   Prisma client + migrations
    config/               brand, grievance contact, match config
    auth/                 session cookie helper used by routes and services
    ui/                   Button, Field, DisclosureBanner, Toast
    test/                 factories + scratch DB harness
```

Boundaries:

- `app/` imports `features/`; features never import `app/`.
- Features import `shared/`; shared never imports features.
- No global `src/lib/` dumping ground. Existing helpers move into the feature or shared module that owns them; a thin re-export is allowed only inside the migration commit.
- Each `service.ts` is `server-only`, owns authorization, and returns minimal DTOs. It never returns Prisma rows directly.
- Each `actions.ts` validates input with Zod and calls exactly one service function. Authorization, rate limiting and persistence are not action concerns.
- Repository modules own Prisma queries and contain no UI copy.
- Public counts come from the database at request time. No invented values are rendered.

## 7. Sessions

Replace `jose` HS256 JWT cookies with opaque database-backed sessions:

```txt
Session  tokenHash, userId, expiresAt, revokedAt, createdAt
```

- Generate 32 random bytes, base64url encode for the cookie, store SHA-256 hash only.
- Cookie: `fc_session`, HttpOnly, Secure in production, SameSite=Lax, path `/`, 7-day max age.
- Verification looks up the hash, checks `expiresAt` and `revokedAt`, then loads the user. Every failure is "not logged in".
- Logout revokes the row and clears the cookie.
- Every route that currently calls `verifySession` switches to the shared auth helper in the identity feature.
- `SESSION_SECRET` and the in-source development key are deleted; no secret is required for sessions.
- Consequence: all existing users are signed out once at the swap. The release note must say so.

## 8. Styling

- Add Tailwind v4 with `@tailwindcss/postcss` and `@import "tailwindcss"`; `@theme` holds the existing tokens from `src/styles/globals.css`.
- Convert global classes and inline style objects to Tailwind utilities page by page, starting with shared UI primitives, then public routes, then account routes.
- Delete the appearance control, presets, custom accent logic and their CSS once no consumer remains.
- Motion is CSS transition only. No Motion dependency.
- Keep the calm editorial direction: warm neutral ground, one vermilion decision colour, Inter for prose, Anton for the mark, mono for values. One focal point per screen.
- No second styling system may remain after the final slice.

## 9. Data model

The existing Prisma schema stays as the source of truth. The only schema change is an additive `Session` model; no column is dropped and no row is backfilled. Legacy money and visibility columns remain dormant, never rendered, and are documented as such in the schema comments.

## 10. Revenue surfaces

Only these three legal, user-burden-free methods are in scope:

1. Sponsor placements: a quiet footer slot and `/advertise` contact path. Grievance and sponsor contact: `manideepdaram@gmail.com`. No rate card, checkout, or billing in the app.
2. Disclosed affiliate links: a dedicated disclosure on `/loadout`.
3. Sponsor-funded free events: email-only coordination outside the app; Final Circle never holds money.

No other monetisation method is in scope. Contextual ads, sponsor directories or exports, data monetisation, paid guides, paid tiers, checkout, entry fees, prize pools, escrow, payouts, KYC, and any player charge are excluded. Adding another revenue surface requires a new ADR, a copy audit, and lawyer review before implementation.

## 11. UX and accessibility

- Mobile-first at 375px, then 768px and 1440px. No horizontal scroll.
- Minimum 44px tap targets for standalone controls.
- Visible focus outline on every interactive element; never removed.
- Full keyboard operation for menu, forms, join, report, and settings.
- Reduced motion via both media query and CSS rule.
- ARIA live region for join and report confirmations; blocking errors stay inline.
- Sentence case, one focal point per screen, FC red only on the primary decision.
- Cards only for distinct objects; flat lists use dividers.
- Empty, loading, and error states for every data view. The empty board says so honestly.
- The existing `notes` field is relabelled **Requirements** in the post form and match detail so a host can state role, mic, experience and skill in their own words. No new column, enum, badge, verification, or separate availability field; `date`/`endsAt` already covers the window.

## 12. Verification

- `npm run lint` and `npm run typecheck` clean after every atomic task.
- Tests never read production `DATABASE_URL`. No-DB command: `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`.
- Pure trust rules tested without a database.
- Session tests cover hash storage, expiry, revocation, and cookie flags.
- Copy audit asserts exact disclosure and rejects `₹`, `entry fee`, `prize pool`, `verified`, fabricated stats, and sponsor-discovery promises on public routes.
- `npm run build` clean.
- Real Chrome checks at 375/768/1440px, 200% zoom, keyboard/focus, no horizontal scroll, no console errors.
- SEO regex audit: internal links, canonical uniqueness, title and description lengths, title/H1 agreement, broken links.
- Lawyer review before launch.

## 13. Phases

Each row is one atomic task with one gate. Do not combine rows.

| Phase | Atomic task | Gate |
|---|---|---|
| P0 | Amend SPEC.md, ADR and codemap for reframe-in-place | product/roles/revenue readable in 60 seconds |
| P0 | Add `Session` model and migration; shared auth helper | session test green, no destructive migration |
| P1 | Move identity into `features/identity`; swap JWT for opaque sessions | login/logout tested, cookie flags tested, old JWT path gone |
| P1 | Remove sponsor directory, export, sign-up, waitlist, admin roles, appearance presets | copy audit green, no dangling imports |
| P2 | Add Tailwind v4 and `@theme` tokens; convert shared UI primitives | build clean, no second styling system in primitives |
| P2 | Convert public routes to Tailwind; remove appearance control | real Chrome 375/768/1440 clean |
| P2 | Convert account routes to Tailwind; remove custom component CSS | real Chrome clean, no console errors |
| P3 | Move matches into `features/matches` with repository/service/actions/DTOs | post, join, duplicate join, oversell and host join still tested green |
| P3 | Move series and trust rules into features; keep ladder behaviour | series tests green |
| P3 | Move reports into `features/reports`; keep joined-only 2-report pause | report tests green |
| P4 | Move disclosure and sponsors into features; exact copy imported | copy audit green on every public route |
| P4 | Relabel existing `notes` as Requirements in post form and match detail | post and detail tested, no new column, enum or badge |
| P4 | Remove `motion`, `jose`, `src/lib/` leftovers | dependency and import audit clean |
| P5 | Full local and real Chrome verification, SEO audit, copy audit | all gates green |
| P5 | Lawyer review | written sign-off before public launch |

## 14. Deliberately not in scope

- A new project, new repository, new domain, or clean database.
- Any money surface, payment rail, checkout, prize, escrow, KYC, or payout.
- Verification badges, approval queues, appeal queues, or admin bypass.
- Contextual ads, sponsor directories or exports, data monetisation, and any revenue surface outside section 10.
- Chat, DMs, brackets, realtime websockets, native app, PWA offline, email sending.
- New consent schema, appearance sync, or four appearance presets.
- Removing weekly series: it is already built, free, and has no legal conflict.

## 15. Known risks

- The session swap signs out every existing user once. Say so in the release note.
- Tailwind conversion across all routes is the largest visual risk. Convert one slice at a time and check in real Chrome after each.
- Legacy money and visibility columns remain in the database. They are never rendered and new writes are fixed, but the lawyer must confirm this is acceptable.
- Lawyer review is an external blocker; this design is not legal advice.
- Uncommitted redesign files on `ui-ux-audit-fixes` are left untouched until the owner decides; they will need conversion when their slice is reached.
