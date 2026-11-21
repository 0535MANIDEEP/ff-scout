# Code map

For any new engineer landing here — this is what to read, in order, to be productive.

## The mental model

Final Circle connects **organizers** (who pay ₹499 per event) with **players** who uploaded a rank screenshot. A **human verifier** checks each screenshot manually. Once verified, an organiser can download a CSV of the shortlisted roster.

## Folder structure

```
docs/adr/              design decisions, chronological
DESIGN.md              visual and copy source of truth (see ADR 0004)
prisma/                schema.prisma, seed.js (dev-only seed/reset rules)
public/                static assets — hero image, favicon
src/app/               all routes (Next.js App Router)
src/components/        reusable React components (Waitlist, Hero, InkButton)
src/lib/               auth (JWT), prisma client, rate limiter, utilities
src/styles/globals.css design tokens + utilities
test/                  node:test smoke suite
```

## The paths and what they do

| Path | Audience | What it does |
|---|---|---|
| `/` | visitor | Landing page with hand-rolled CTA + live seeded roster panel |
| `/sign-up` | player | Player registration; asks for rank screenshot verification |
| `/organizer/sign-up` | organizer | Organizer onboarding, gates creation of a roster |
| `/verify` | player | Upload your rank screenshot for verification |
| `/player` | player | After login: dashboard with your IGN/rank/status |
| `/organizer/shortlist` | organizer | After login: roster + filters + CSV download |
| `/organizer/shortlist/download` | admin + organizer | Generates the CSV |
| `/admin/verify` | admin | Review queue: approve/reject screenshots |
| `/uid-check` | visitor | Free UID check: verified-pool status + live game profile (see ADR 0003) |
| `/learn` | visitor | Field manual — how ranks, roles and verification work |
| `/api/waitlist` | visitor | Email capture for landing-page waitlist |
| `/api/uid-check` | visitor | JSON: pool half (own DB) + live half (env-gated provider) |
| `/sign-out` | anyone logged in | POST endpoint; clears cookie |
| `/about` | visitor | About page |
| `/faq` | visitor | 12 honest answers — expandable via accordion is overkill |
| `/privacy` `/terms` | visitor | Legal |
| `/robots.txt` `/sitemap.xml` | search engines | Generated; see `src/app/robots.ts` and `src/app/sitemap.ts` |

## Data flow — a player joins

1. Player clicks CTA on `/`, lands on `/sign-up`.
2. Fills in email/password/IGN/rank/affiliator. User record created in `User` table with `verified=false`.
3. Player clicks "Upload rank screenshot" from their dashboard, lands on `/verify`.
4. Form action hits `src/app/verify/actions.ts` → row in `VerificationProof` with `status=pending`.
5. Admin hits `/admin/verify`, sees pending proofs, opens each, clicks approve/reject → `VerificationProof.status` toggles, `User.verified=true` for approve.
6. Player's dashboard now shows "Verified ✓".

## Data flow — an organizer hires

1. Organiser signs up via `/organizer/sign-up` (same as player flow, `userType=organizer`).
2. Visits `/organizer/shortlist`, filters by role/rank/region.
3. Clicks "Download CSV", hits `src/app/organizer/shortlist/download/route.ts` → CSV leaves their browser.

## Where NOT to look first (save time)

- `src/styles/globals.css` — design tokens. Change with intent only.
- `prisma/schema.prisma` — change deliberately. See `docs/adr/0001-recruiter-first.md`.
- Motion is hand-rolled in `src/components/Reveal.tsx` + CSS keyframes — no animation library. Keep it opacity/transform only.

## Common tasks

### Add a field to the player dashboard
1. Update Prisma schema → `prisma db push --accept-data-loss` → `prisma generate`.
2. Update the JSX in `src/app/player/page.tsx`.

### Change copy on the landing page
- Everything is in `src/app/page.tsx` and `src/app/components/Hero.tsx`.

### Add a screenshot verification rule (e.g. "screenshot must include UID")
`src/app/admin/verify/page.tsx`, `src/app/admin/verify/actions.ts` — these run the admin queue. Do not put rules in the client component.

## Decisions to read first

`docs/adr/0001-recruiter-first.md` — if you're tempted to add a feature, read this first. It says what we won't build in v1 and why.
`DESIGN.md:1` — visual and copy rules for every route, including the palette and theme contract.
