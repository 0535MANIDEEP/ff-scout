# Match Platform Design — Final Circle

Date: 2026-11-19 · Status: draft for founder review · Supersedes: the verified-roster model in SPEC.md

## Context

Final Circle began as a verified-roster product: players uploaded rank screenshots, human verifiers reviewed them in a queue, organizers paid ₹499 to unlock a shortlist. Two problems killed that model:

1. **The verification loop is a burden and untrustworthy.** Someone must eyeball every screenshot; forged screenshots and inconsistent judgment make the "verified" promise weak. The founder's rule: no process that lands on an admin, and no paid dependency to lean on.
2. **It gates the marketplace instead of enabling it.** Organizers and players want to find each other for matches — casual, serious, tournament, esports, BR or CS. A verification bottleneck sits in the way of that.

The pivot: **Final Circle is a match platform.** Organizers post matches; players join; sponsors can discover players who opt in. We do not verify, approve, or mediate — we provide the board. Middle ground: the platform is the infrastructure, not a gatekeeper.

### Standing constraints (unchanged)

- Free tiers only; no paid services until revenue exists.
- No fabricated claims: no invented stats, testimonials, prices, sponsors, or urgency.
- Players never pay to join a match.
- **No money handling.** Entry fees and prize pools are notes on a match, settled organizer ↔ player directly.
- No "admin" wording on user-facing surfaces; internal console keeps its name.
- Intent readable in the repo (SPEC.md, ADRs, codemap).

## Goals

- Organizer posts a match in under 60 seconds.
- Player finds and joins a match in under 30 seconds.
- Sponsor discovers opted-in players (profiles + CSV export).
- Zero manual steps for the platform owner after launch.

## Non-goals (this version)

- No screenshot verification, review queue, or "verified" badge.
- No payment processing (a later layer over the same entities).
- No messaging/chat between users.
- No entry-fee or prize-pool collection.
- No automated rank polling from game APIs as a trust mechanism.

## Entities (differentiated)

### Match

| Field | Values |
|---|---|
| `mode` | `casual` · `competitive` · `ranked` · `esports` — extensible string |
| `gameType` | `BR` · `CS` · `BR/CS` |
| `entry` | `free` · `paid` (with `entryFee` note, optional) |
| `prize` | `none` · `pool` (with `prizePool` note, optional) |
| `status` | `open` · `closed` |
| other | `title`, `date`, `city`, `online` (bool), `slots` (int?), `contact` (string), `notes`, `organizerId` |

`entry` and `prize` are **notes**, never amounts we collect. They exist now so payments can be built later around the same entities.

### MatchEntry (the join)

`matchId` + `playerId` + `createdAt`, unique on (`matchId`,`playerId`). One join per player per match; leaving deletes the row. No accept/decline state — joining is an RSVP.

### Player (User with role player)

`displayName`, `gameUid`, `brRank`, `csRank`, `role`, `city`, `visibleToSponsors` (bool, opt-in), `createdAt`.
Separate `brRank` and `csRank` because players main one mode.

### Organizer (User with role organizer)

`orgName`, `orgType`, `city`, `contact`, `paidUntil` (env-gated paywall, later).

### Sponsor (User with role sponsor)

`brandName`, `city`, `contact`. Sees only players with `visibleToSponsors = true`.

### Roles and permissions (catalogue-first, in `src/lib/permissions.ts`)

| Role | Permissions |
|---|---|
| `player` | `match:join`, `match:leave`, `self:delete` |
| `organizer` | `match:create`, `match:manage` (own), `match:roster` (own), `self:delete` |
| `sponsor` | `talent:browse`, `talent:export`, `self:delete` |
| `admin` | `user:manage`, `audit:read`, `account:erase`, `match:manage:any` |

`verifier` is retired; `proof:*` and `roster:*` permissions are removed.

## Screen map

### Public

| Route | Purpose | Key elements |
|---|---|---|
| `/` | What it is: post a match / find a match | Two CTAs, honest how-it-works, no invented stats |
| `/matches` | The board | Filters: mode · BR/CS · city · entry · prize · date. Cards: title, mode, type, date, city, entry/prize, slots, organizer |
| `/matches/[id]` | Match detail | Full info, organizer card, joined count, **Join** / **Leave** |
| `/uid-check` | Free UID utility | Pool half becomes "on Final Circle · joined N matches"; live half unchanged (env-gated) |
| `/login`, `/sign-up`, `/organizer/sign-up`, `/sponsor/sign-up` | Auth | Role-specific signup |
| `/learn`, `/about`, `/faq`, `/privacy`, `/terms` | Static | Copy updated to the platform model |

### Organizer (authed)

| Route | Purpose | Key elements |
|---|---|---|
| `/organizer/post` | Create a match | Full taxonomy form; paywall gate later |
| `/organizer/matches` | Your postings | List with status; per-match **roster** (joined players: name, UID, BR/CS rank, role, contact) |
| `/settings` | Account | |

### Player (authed)

| Route | Purpose | Key elements |
|---|---|---|
| `/player` | Profile + your joins | BR/CS ranks, role, city, UID, `visibleToSponsors` toggle; matches joined; leave |
| `/settings` | Account | |

### Sponsor (authed)

| Route | Purpose | Key elements |
|---|---|---|
| `/sponsors` | Candidate directory | Filters (city, BR/CS rank, role); opted-in players only: displayName, UID, BR/CS ranks, role, city, matches joined |
| `/sponsors/export` | CSV export | Filtered candidates, audited like the old roster export |

### Admin

| Route | Purpose |
|---|---|
| `/admin` → redirects to `/admin/matches` | Fixes the current 404 |
| `/admin/matches` | All matches; close/cancel anything |
| `/admin/roles` | User role management (unchanged) |
| `/admin/audit` | Audit log |

### Deleted

`/organizer/shortlist`, `/organizer/shortlist/download`, `/verify`, `/admin/verify`, the `verified` flag, `VerificationProof`, the screenshot flow, the verifier role.

## Flows

1. **Post**: organizer signs up → `/organizer/post` → fills taxonomy → match is `open` on `/matches`.
2. **Join**: player browses/filters → opens `/matches/[id]` → **Join** → `MatchEntry` created → visible in `/organizer/matches` roster and `/player` joins.
3. **Paid entry**: the match card and detail say "Paid entry — ₹X to the organizer". Joining still creates the entry (RSVP); the organizer collects the fee directly. The roster shows the player's contact so the organizer can reach them.
4. **Sponsor discovery**: sponsor signs up → `/sponsors` → filters → profiles of opted-in players → `/sponsors/export` for CSV.
5. **Leave**: player leaves from `/player` or the match page; the roster updates.

## Data model changes

- New: `Match`, `MatchEntry`.
- `User`: add `brRank`, `csRank`, `visibleToSponsors`, `brandName`; drop `verified`, `status`, `rank` (split into br/cs), `iglCapable` (or keep — decide in plan).
- Drop: `VerificationProof`.
- Migration: prod Neon has ~0 real players, so this is cheap now. Use a versioned migration (ADR 0002's deferred item) rather than `db push`.

## Payments — built later, around these entities

- **Posting paywall**: `paidUntil` on the organizer, env-gated, gates `/organizer/post`. ₹499 per post, unwired until a pilot organizer commits (ADR 0002).
- **Paid entry / prize pools**: fields already exist; the money layer (Razorpay links, collection, sponsor cohort billing) is added over them later without changing the taxonomy.

## Honesty and copy rules

- No fabricated counts or stats anywhere; empty states say "Nothing here yet".
- Player data shown to sponsors only for `visibleToSponsors = true`, stated in privacy policy and at the toggle.
- Paid/prize labels always clarify money is settled directly, never through Final Circle.
- Independence disclaimer stays.

## Testing plan

- Unit: permission catalogue, join uniqueness, sponsor visibility filter.
- Integration: post → join → roster; leave; sponsor export only opted-in.
- E2E: the three flows above at desktop + mobile widths; rate limits.
- Existing suite (`npm test`) must stay green; new tests for `Match`/`MatchEntry` shaping and permissions.

## Documentation to update

- SPEC.md rewritten around the platform model.
- ADR 0004 records the pivot and why verification was removed.
- docs/codemap.md, README.md, docs/competition.md as needed.

## Deferred (not this version)

- Messaging between organizer and player.
- Match editing / drafts / recurrence.
- Sponsor cohort billing; organizer subscription.
- Auto-filling BR/CS ranks from the live game API.
- Public player profiles `/p/[id]` (returns if sponsors want shareable profiles).

## Open questions for the founder

1. Match `mode` values: is `casual / serious / tournament / esports` the right set, or should it be free-form?
2. `slots` — enforce a cap (waitlist when full) or just display a number?
3. Keep `iglCapable` and `role` on players, or simplify to ranks + city only?
4. Should organizers see a player's contact on the roster, or only UID?
