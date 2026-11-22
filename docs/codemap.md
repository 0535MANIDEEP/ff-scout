# Code map

**Last updated:** 2026-11-22
**Branch:** ui-ux-audit-fixes

Read order for a new engineer: this file, `DESIGN.md`, `SPEC.md`, then `docs/adr/0006-reframe-in-place.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`.

## The mental model

Final Circle is a free notice board for Free Fire matches in India. Hosts post, players join. Players never pay to join and every listing is free entry. Final Circle does not advertise cash prizes, collect, hold or pay money, run escrow, verify players, issue verified badges, or adjudicate money disputes. 18+ only.

Trust is earned by hosting, not by applying. The weekly-series ladder is self-serve: 3 hosted matches, each with at least 2 distinct non-host joiners, unlock up to 2 active series. Two zero-join occurrences pause a series automatically. There is no human approval queue and no verifier role.

The three revenue surfaces are sponsor placements (footer `SPONSOR_LINE` and `/advertise`), disclosed affiliate links on `/loadout`, and sponsor-funded free events. No player pays the platform. There is no checkout and no paid digital guide.

Optional `MatchEntry.teamName` and a `User.teamName` default carry a squad or guild name. There are no persistent team profiles yet.

## Folder structure

```txt
src/
  app/                    thin routes + metadata only
    about/ advertise/ faq/ learn/ loadout/ matches/ privacy/ safety/ terms/
    admin/ login/ player/ post/ settings/ sign-out/ sign-up/
    components/Hero.tsx   server-rendered hero; CSS keyframe entry, no client JS
    layout.tsx · page.tsx · error.tsx · not-found.tsx · robots.ts · sitemap.ts · icon.svg
  components/             BackToTop, Reveal, RoleAvatar, SignOut, SiteHeader, Wire, ZoneShrink
  config/                 roles.json, ranks.json, match.json, copy.json, loadout.json
  features/
    identity/             actions, service, repository, schema, account (erasure)
    matches/              service, repository, schema, team helpers, hero data
    series/               service, repository
    reports/              service, schema
    trust/                pure pause/ladder rules shared by matches and series
    sponsors/             placement copy and email contact, no directory or export
    disclosure/           exact legal copy and /learn chapters
    <slice>/ actions.ts · service.ts · repository.ts · schema.ts · components/
  shared/
    db/client.ts          Prisma client
    config/               brand.ts, match.ts
    auth/                 session.ts (opaque DB sessions), permissions.ts
    rate-limit.ts · seo.ts
    ui/                   Button, Field, DisclosureBanner
  styles/globals.css      Tailwind v4 theme, hero-in keyframe, focus and reduced-motion rules
```

## Routes

### Public

| Path | Purpose | Source |
|---|---|---|
| `/` | Landing, product line, board CTA | `src/app/page.tsx`, `src/app/components/Hero.tsx` |
| `/matches` | Live board, mode/type/city filters, free-entry notice, `/safety` link | `src/app/matches/page.tsx` |
| `/matches/[id]` | Match detail, roster, join/leave, report | `src/app/matches/[id]/page.tsx`, `actions.ts` |
| `/learn` | How ranks, roles and the board work | `src/app/learn/page.tsx`, `src/lib/learn.ts` |
| `/loadout` | Gear picks with disclosed affiliate links | `src/app/loadout/page.tsx`, `src/lib/aff.ts` |
| `/about`, `/faq`, `/privacy`, `/terms` | About, answers, legal and grievance copy | matching folders in `src/app` |
| `/robots.txt`, `/sitemap.xml` | Generated crawler files | `src/app/robots.ts`, `src/app/sitemap.ts` |
| `/safety` | Free-entry rule, no-money rule, 18+, reporting, grievance, how we earn, legal background, independent-site notice | `src/app/safety/page.tsx` |
| `/advertise` | Sponsor placements, sponsor-funded free events, no rate card, no real-money gaming link | `src/app/advertise/page.tsx` |

`/safety` and `/advertise` each render `GLOBAL_DISCLOSURE` and export their own metadata and canonical. The legal narrative behind them is in `docs/superpowers/specs/2026-11-22-legal-safe-free-entry-and-revenue-design.md`.

### Accounts and hosts

| Path | Purpose | Source |
|---|---|---|
| `/sign-up` | Player account, 18+ and free-entry consent | `src/app/sign-up/page.tsx`, `actions.ts` |
| `/login`, `/sign-out` | Session in and out | `src/app/login/*`, `src/app/sign-out/route.ts` |
| `/post` | Post one free match | `src/app/post/page.tsx`, `actions.ts` |
| `/post/series` | Weekly series template, gated by the trust ladder | `src/app/post/series/page.tsx`, `actions.ts` |
| `/player` | My profile, joined matches, team-name default | `src/app/player/page.tsx`, `actions.ts` |
| `/player/posted` | Hosted matches and series, edit/pause/resume | `src/app/player/posted/page.tsx`, `actions.ts` |
| `/settings` | Account settings and erasure | `src/app/settings/page.tsx`, `actions.ts` |
| `/admin`, `/admin/matches` | Dashboard, close any match | `src/app/admin/*` |

Private routes (`admin`, `player`, `settings`, `login`, `sign-up`) export `noindex, nofollow`. API route handlers are used only when a Server Action cannot serve. `GAMESKINBO_API_KEY`, Cloudinary and the UID-check route were removed on 2026-11-22: they needed external accounts and were not part of the post/join/report happy path.

## Data flow: post to join to roster to report to automatic pause

1. **Post.** `createMatch` in `src/app/post/actions.ts` checks the session and `match:create`, refuses a host whose `postingPausedUntil` is in the future, rate-limits to 5 posts per 15 minutes, validates with zod, then writes `...FREE_ENTRY_TERMS` and `endsAt = date + duration`. It logs `match_create` to `AuditLog` and redirects to `/player/posted`.
2. **Board.** `/matches` runs `runSeriesSweep()` (`src/lib/series-sweep.ts`) as a fault-isolated tick, then renders open matches with a "Free entry / No advertised prize" line and the `/safety` link. No entry fee or prize amount is selected from the database for display.
3. **Join.** `joinMatch` in `src/app/matches/[id]/actions.ts` checks `match:join`, normalizes the optional team name through `src/lib/team.ts` for `esports`/`competitive`, and runs a serializable transaction: match must be open, slots must remain, an atomic conditional decrement prevents oversell, and the unique `[matchId, playerId]` constraint prevents a double join.
4. **Roster.** Match detail renders the real entry count and team names as typed by joiners. `/player/posted` is the host's view of their own matches and series. Capabilities live in `src/lib/permissions.ts`; roles are `player`, `sponsor`, `admin`. There is no verifier role.
5. **Report.** `reportMatch` in `src/app/matches/[id]/actions.ts` stores a report with category `payment_request`, `fake_match` or `other` plus a reason. It counts only `payment_request` reports whose reporter actually joined that match. At 2 or more, in the same transaction it closes the match, sets the host's `postingPausedUntil` to 7 days from server time, and writes audit action `report:auto_pause`. No human reviews before the consequence. Both `createMatch` and `createSeries` refuse posts while the pause is active. The pause expires by time; there is no appeal queue and no admin action.

Thresholds are constants in `src/lib/free-entry.ts`; the additive migration that added `Report.category` and `User.postingPausedUntil` is `prisma/migrations/20261122000000_free_entry_report_safety/`.

## Weekly series

`/post/series` creates a `MatchSeries` template only after `seriesEligibility()` (`src/lib/series.ts`) confirms 3 qualifying hosted matches and fewer than 2 active series. Qualification is `endsAt < now` and at least 2 distinct joiners excluding the host, status independent. `materializeSeries()` stamps free-entry terms, generates the lookahead window with fixed +05:30 IST date math (`src/lib/schedule.ts`), and uses `skipDuplicates` on `[seriesId, date]`. `autoPauseCheck()` pauses a series after 2 finished zero-join occurrences and logs `series:auto_pause`. Edits, pause and resume live in `src/lib/series-ops.ts`; joined future occurrences keep their terms, and only zero-join futures are propagated or purged.

## Where copy and rules live

| Change | File |
|---|---|
| Free-entry strings, disclosure line, report thresholds | `src/lib/free-entry.ts` |
| Product line, site description, trademark, canonical base | `src/lib/brand.ts` |
| Header, footer, `SPONSOR_LINE` slot, root metadata, JSON-LD | `src/app/layout.tsx` |
| Per-route title, description, canonical, `noindex` | `src/lib/seo.ts` helpers, used by each route's `page.tsx` or `generateMetadata` |
| Modes, game types, ladder thresholds, duration options | `src/config/match.json` via `src/lib/config.ts` |
| Visual and copy rules | `DESIGN.md` |
| Product intent, roles, revenue, dismissals | `SPEC.md` |
| Legal and sponsor copy | `src/app/safety/page.tsx`, `src/app/advertise/page.tsx`; background in `docs/superpowers/specs/2026-11-22-legal-safe-free-entry-and-revenue-design.md` (read-only) |

## Database and local workflow

Models: `User`, `Match`, `MatchSeries`, `MatchEntry`, `Report`, `WaitlistEntry` (dormant), `RateLimitEntry`, `AuditLog` in `prisma/schema.prisma`. Legacy `entry`, `entryFee`, `prize` and `prizePool` columns remain for the additive-only migration rule. Historical rows keep their values; writes use `FREE_ENTRY_TERMS` and public views never render them.

Migrations on the shared Neon database are additive only. Never run tests with `DATABASE_URL` aimed at that database:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test
```

## SEO

Per-route metadata, unique canonicals, `noindex` on private routes, generated `robots.ts` and `sitemap.ts`. Run the regex audit from https://surajkumarseo.medium.com/what-is-regex-for-seo-and-how-to-use-it-for-seo-90a61dce029d before sign-off: internal links including `route.ts`, canonical uniqueness, title and description lengths, title and H1 agreement, broken links.

## Decisions to read first

- `docs/adr/0006-reframe-in-place.md` records the in-place reframe and governs this codemap.
- `docs/adr/0005-legal-safe-free-entry-and-revenue.md` supersedes the money and verification claims in the earlier paid-shortlist records.
- `docs/adr/0004-full-redesign-and-user-palettes.md` is a historical design record; the in-place reframe replaces its appearance contract with one styling system.
- `docs/adr/0001-recruiter-first.md` is a historical decision record from the paid model. Read it to understand where old copy came from, never as current product truth.
