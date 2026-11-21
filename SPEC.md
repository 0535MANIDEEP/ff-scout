# SPEC — Final Circle

## One line

Final Circle is a free notice board for Free Fire matches in India. Hosts post, players join, and players never pay.

The app is reframed in place; the database and deploy are unchanged.

## The problem in one line

Hosts need a plain place to post a match and see who joined. Players need to find a real free match without being asked for money. Both need a board that says plainly what it does and does not do.

## Who it serves

| Who | Job on Final Circle | Pays Final Circle? |
|---|---|---|
| Community hosts, café and LAN operators, college fest leads | Post free matches and weekly series, see the roster | No |
| Players in India, 18+ | Find and join free matches, add an optional team name | No |
| Sponsors and brands with no real-money gaming link | Sponsor placements and sponsor-funded free events | Placements and events are negotiated by email, outside the app; Final Circle never holds money |

No organizer tier, no unlock fee, no per-event charge, and no player payment. Roles in code are `player`, `sponsor`, `admin`. There is no verifier role.

## What it does

1. A host posts a free match at `/post`. Entry is written as `free`, prize as `none`, and both money fields as `null` through `src/lib/free-entry.ts`.
2. A player joins from `/matches/[id]`. For `esports` and `competitive` modes an optional team or guild name is stored on the match entry. A `User.teamName` default is used as the form prefill. There are no persistent team profiles.
3. The roster shows real join counts and team names as typed. Hosts manage their own matches and series at `/player/posted`.
4. Weekly series are a `MatchSeries` template that materializes future `Match` occurrences. The join, roster and report flows are unchanged for series occurrences.
5. A report with a category can close a match and pause a host automatically. No human reviews it first.
6. Sponsors arrange placements and funded free events by email through `/advertise`. No sponsor directory or export exists.

## Free entry and trust

- 18+ only.
- Every listing is free entry with no advertised prize. Free-entry terms are coerced at write time in the post and series actions and at display time on every public view. Historical database rows keep their old values but are never rendered.
- Final Circle does not collect, hold or pay money, run escrow, verify players, issue verified badges, or adjudicate money disputes.
- Weekly series use one self-serve trust ladder: 3 hosted matches, each with at least 2 distinct non-host joiners, and at most 2 active series. Two zero-join occurrences pause a series automatically. No approval queue.
- Reporting is available on every match. Two `payment_request` reports from players who joined close the match automatically, pause the host's posting for exactly 7 days from server time, and write an audit log entry. There is no review before the consequence and no appeal queue.
- Grievance path: in-app report first, then email the founder using the address in `BRAND`, then the Online Gaming Authority within 30 days if unresolved. No invented service promise.
- `/safety` states the free-entry rule, the no-money rule, the 18+ rule, reporting, grievance, how we earn, the legal background and the independent-site notice. The global disclosure line is "Free entry only. No money handled by Final Circle. 18+."

## Monetization

1. Sponsor placements: a quiet footer slot and `/advertise` contact path. Grievance and sponsor contact: `manideepdaram@gmail.com`. No rate card, checkout, or billing in the app.
2. Disclosed affiliate links: a dedicated disclosure on `/loadout`.
3. Sponsor-funded free events: email-only coordination outside the app; Final Circle never holds money.

No checkout, no paid digital guide, no player ever pays the platform, and no sponsor with a real-money gaming link.

## Legal background

The Promotion and Regulation of Online Gaming Act 2025 and the Promotion and Regulation of Online Gaming Rules 2026 came into force on 1 May 2026. They define an online money game as money in plus an expectation of money out, whether the game is based on skill, chance or both. Sections 5, 6 and 7 prohibit offering, advertising and facilitating such games, with penalties up to 2 years imprisonment or 50 lakh rupees. The e-sports carve-out requires recognition under the National Sports Governance Act and registration with the Online Gaming Authority of India, which is not viable for this product now.

The research behind this decision is background, not legal advice. A qualified lawyer must review the final product and copy before launch. See `docs/adr/0005-legal-safe-free-entry-and-revenue.md`.

## Current scope

- Free match posting and joining, playable on mobile web.
- Weekly series with the self-serve ladder and automatic pause.
- Report categories with automated consequence and audit log.
- `/safety`, `/advertise`, per-route metadata, generated robots and sitemap.

## Explicitly out of scope

- Paid entry, entry fees, cash prizes or prize pools advertised on the site.
- Escrow, custody of money, payouts, KYC, payment rails or a checkout.
- Human verification, verified badges, screenshot review or an admin approval queue.
- Charging players, paid organizer tiers, unlock fees or a rate card.
- A paid digital guide or any other product with a checkout.
- Persistent team or guild profiles.
- Registration as an e-sport, or any sponsor tie to real-money gaming.
- Account-level appearance sync or Prisma storage for appearance state.

## The one-line result

A host posts a free match, players join from the board, and the roster is visible to the people who need it.

## Verification plan

- A qualified lawyer reviews the final copy before launch.
- Additive-only migration on the shared Neon database. No destructive schema change.
- Tests run with `DATABASE_URL` removed: `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`.
- SEO regex audit from https://surajkumarseo.medium.com/what-is-regex-for-seo-and-how-to-use-it-for-seo-90a61dce029d: internal links, canonical uniqueness, title and description lengths, title and H1 agreement, broken links.
- Copy audit on public routes: no ₹ amounts, unlock, shortlist, verification promise, screenshot, fabricated statistic or em dash.
- Browser check of the disclosure, free-entry form, report warning, and no horizontal scroll at 375px, 768px and 1440px.
