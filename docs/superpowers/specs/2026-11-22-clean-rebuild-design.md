# Design: Final Circle clean rebuild

Date: 2026-11-22  
Status: proposed, awaiting owner review

## 1. Intent

Build a new Final Circle as a free community board for Indian Free Fire players. A person posts an invite, other people show interest or join, and anyone can discover and join other posts. The site exists to grow a real community and earn legally without charging users.

This is a new product scope with a clean database. The existing `ff-scout` repository is a conventions and legal-history reference only. No old users, matches, columns, or appearance state are imported.

Success looks like:

1. A host can post a free match in under a minute.
2. A player can find that match, join it, and see the roster.
3. The exact disclosure is visible on every public route.
4. Two valid payment-request reports close the match and pause the host automatically.
5. A user can withdraw consent and erase their account.
6. Revenue comes only from sponsor placements, disclosed affiliate links, and sponsor-funded free events arranged outside the app.
7. Lint, typecheck, tests, build, copy audit, SEO audit, and real Chrome checks pass before launch.

## 2. Non-negotiable rules

- Players never pay. There is no checkout, entry fee, paid tier, prize pool, escrow, KYC, payout, or money custody.
- 18+ only.
- Exact disclosure: `Free entry only. No money handled by Final Circle. 18+.`
- No verified badges, screenshot review, human approval queue, appeal queue, or admin bypass of automatic consequences.
- No fabricated statistics, scarcity, timestamps, counters, testimonials, or compliance claims.
- No tracking cookies, analytics cookies, ad pixels, or cross-site identity.
- One primary button per screen. Secondary actions are outlined or quiet.
- Qualified lawyer review is required before launch.

## 3. Stack decision

Use Next.js 16 App Router, React 19, TypeScript strict, Prisma 6 with Postgres, Zod, opaque database-backed sessions, and Tailwind v4 configured as the single styling system.

This keeps the working Vercel deploy, file routing, version-matched docs, and SEO metadata. The previous “intern project” feeling came from accumulated cruft, not from the framework. New code is rebuilt from a clean `src/app`; it is not a patch of the old screens.

Authentication uses an opaque session token stored as a hash in the database. The browser receives an HttpOnly, Secure, SameSite=Lax cookie. Authorization and domain rules live in server-only service modules.

Tailwind v4 owns all styling through one token set. There is no second CSS system. Motion is CSS transition only; no Motion dependency in v1.

## 4. Structure and boundaries

```txt
src/
  app/                    thin routes + metadata only
    (public)/             /, /matches/[id], /safety, /advertise, /privacy, /terms
    (account)/            /sign-up, /login, /settings, /player, /post
    api/                  route handlers only when a Server Action cannot serve
  features/
    identity/             signup, login, sessions, consent, erasure
    matches/              create, board query, join, roster, close
    reports/              categories, joined-report counting, auto-pause
    trust/                pure ladder/pause rules shared by matches
    sponsors/             placement copy and email contact, no directory or export
    disclosure/           exact legal copy used everywhere
    <slice>/ actions.ts · service.ts · repository.ts · schema.ts · components/ · *.test.ts
  shared/
    db/                   Prisma client + migrations
    config/               brand, grievance contact, match config
    ui/                   Button, Field, DisclosureBanner, Toast
    test/                 factories + scratch DB harness
```

Boundaries:

- `app/` imports `features/`; features never import `app/`.
- Features import `shared/`; shared never imports features.
- No global `src/lib/` dumping ground.
- Each `service.ts` is `server-only`, owns authorization, and returns minimal DTOs.
- `actions.ts` validates with Zod and calls exactly one service function.
- Repository modules own Prisma queries and contain no UI copy.

## 5. Data model

```txt
User          id, email, passwordHash, displayName, role, ageConfirmedAt,
              postingPausedUntil, createdAt, deletedAt
Session       tokenHash, userId, expiresAt, revokedAt
ConsentRecord userId, kind (privacy), version, grantedAt, withdrawnAt   append-only
Match         id, hostId, title, mode, city/online, startsAt, endsAt,
              capacity, status, createdAt
MatchEntry    matchId, playerId, note?, joinedAt              unique(matchId, playerId)
Report        matchId, reporterId, category, reason, createdAt unique(matchId, reporterId)
AuditLog      action, actorId?, subjectType, subjectId, metadata, createdAt
RateLimitEntry key, windowStart, count
```

There is no money, prize, escrow, payment, verification, or badge column. There is no `MatchSeries` in v1. Recurring series are a later atomic task with their own ADR.

## 6. Invariants

1. The exact disclosure is imported from `features/disclosure`, never retyped.
2. Posting and joining require `ageConfirmedAt` and active `privacy` consent at mutation time.
3. Joining is atomic: match must be `open`, capacity checked in the same transaction, `(matchId, playerId)` unique, host cannot join own match.
4. Two `payment_request` reports from reporters who actually joined close the match and set `postingPausedUntil = now + 7 days` from server time. The third report does not extend the pause.
5. Non-joined reporters do not count toward the threshold.
6. Role, consent, pause, and consequence flags are never accepted from client input.
7. Erasure deletes PII, revokes sessions, and replaces host attribution on authored matches with a neutral tombstone.
8. Public counts come from the database at request time. No invented values are rendered.

## 7. UX and accessibility

- Mobile-first at 375px, then 768px and 1440px. No horizontal scroll.
- Minimum 44px tap targets for standalone controls.
- Visible focus outline on every interactive element; never removed.
- Full keyboard operation for menu, forms, join, report, and settings.
- Reduced motion via both media query and CSS rule.
- ARIA live region for join and report confirmations; blocking errors stay inline.
- Sentence case, one focal point per screen, FC red only on the primary decision.
- Cards only for distinct objects; flat lists use dividers.
- Empty, loading, and error states for every data view. The empty board says so honestly.

## 8. Revenue surfaces

Only these three legal, user-burden-free methods are in scope:

1. Sponsor placements: a quiet footer slot and `/advertise` contact path. Grievance and sponsor contact: `manideepdaram@gmail.com`. No rate card, checkout, or billing in the app.
2. Disclosed affiliate links: a dedicated disclosure on `/loadout`.
3. Sponsor-funded free events: email-only coordination outside the app; Final Circle never holds money.

No other monetisation method is in scope. Contextual ads, sponsor directories or exports, data monetisation, paid guides, paid tiers, checkout, entry fees, prize pools, escrow, payouts, KYC, and any player charge are excluded. Adding another revenue surface requires a new ADR, a copy audit, and lawyer review before implementation.

## 9. Verification

- `npm run lint` and `npm run typecheck` clean.
- Tests never read production `DATABASE_URL`.
- Pure trust rules tested without a database.
- Services tested with PGlite in-process Postgres.
- One scratch-Postgres smoke test for the real driver at `127.0.0.1:55432`.
- Copy audit asserts exact disclosure and rejects `₹`, `entry fee`, `prize pool`, `verified`, and fabricated stats on public routes.
- `npm run build` clean.
- Real Chrome checks at 375/768/1440px, 200% zoom, keyboard/focus, no horizontal scroll, no console errors.
- SEO regex audit: internal links, canonical uniqueness, title and description lengths, title/H1 agreement, broken links.
- Lawyer review before launch.

## 10. Phases

| Phase | Atomic task | Gate |
|---|---|---|
| P0 | Scaffold Next + TS strict + Prisma + Zod + Tailwind tokens; scripts | typecheck, lint, build pass |
| P0 | Write ADR for stack, rewrite SPEC.md and codemap | product/roles/revenue readable in 60 seconds |
| P0 | Define Prisma schema and migrations | schema test asserts no money/verification column |
| P1 | Session signup, login, logout, rate limit | cookie flags and generic errors tested |
| P1 | Age + consent records, withdrawal, erasure | consent gate and session revocation tested |
| P1 | Disclosure banner, `/safety`, `/advertise`, grievance contact | copy audit green on public routes |
| P2 | Post match form and service | free post written with no money fields |
| P2 | Board and detail routes | real data only, honest empty state |
| P2 | Join and roster | duplicate join, oversell, host join blocked |
| P3 | Report action with category | one report per match per player |
| P3 | Payment-request consequence and audit log | threshold 2, joined-only, idempotent 7-day pause |
| P4 | Disclosed affiliate links and sponsor placement | copy audit still green |
| P4 | Privacy, settings, and data rights surfaces | erasure and withdrawal reachable by keyboard |
| P5 | Metadata, canonicals, robots, sitemap | SEO audit green |
| P5 | README sections, ADRs, codemap update | every feature has a reachable route and doc |
| P5 | Full local and real Chrome verification | all gates green, no console errors |
| P5 | Lawyer review | written sign-off before public launch |

## 11. Deliberately not in v1

- Any money surface, payment rail, checkout, prize, escrow, KYC, or payout.
- Any role inflation: verifier, moderator, organizer tier, verified badge, approval queue, appeal queue, admin bypass.
- Any legacy bridge: old columns, data import, additive-only constraints, display-time coercion over dirty rows.
- Weekly series, team/guild profiles, chat, DMs, brackets, realtime websockets, native app, PWA offline, email sending, waitlist capture.
- Four appearance presets, custom accent logic, account-level appearance sync.
- Tracking cookies, analytics, ad pixels, or third-party trackers.
- Sponsor-funded event workflow inside the app; that remains email-only.
- Contextual ads, sponsor directories or exports, and any other revenue surface not listed in section 8.

## 12. Known risks

- Lawyer review is an external blocker; this design is not legal advice.
- Tailwind v4 must be configured as one system from the start; adding it beside legacy CSS would recreate the mess.
- Opaque sessions require a clean session table and cookie flags from day one.
- The report consequence has no appeal path by product decision; copy must state the consequence before the user reports.
