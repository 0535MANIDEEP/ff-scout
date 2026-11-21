# Legal-safe free-entry reset, site disclosure and first revenue surfaces

Date: 2026-11-22
Status: draft for owner review
Owner decision requested: approve or request changes before implementation begins

## Intent

The owner asked for three things in one breath: keep the founder out of legal trouble, find ways to earn from the site and its visitors, and remove scammers without a human approval bottleneck.

Research changed the design. The main exposure is not a scammer. It is the listing itself. India's Promotion and Regulation of Online Gaming Act 2025 and the Promotion and Regulation of Online Gaming Rules 2026 came into force on 1 May 2026. An online money game is an online game where a player pays a fee, deposit or stake and expects money or something monetisable back, whether the game is based on skill, chance or both. Section 5 prohibits offering, aiding or abetting such a game. Section 6 prohibits advertising that directly or indirectly induces playing one, with penalties up to two years imprisonment or fifty lakh rupees. Section 7 prohibits facilitating payments for one. The e-sports carve-out requires recognition under the National Sports Governance Act 2025 and registration with the Online Gaming Authority of India, which is not available to a solo founder today.

The Act leaves one clean cell: free entry with sponsor-funded rewards. There is no money in from the player, so the money-game definition does not engage.

Sources consulted, as background research and not legal advice:
- https://gaganlegal.com/articles/online-gaming-proga-rules-2026
- https://solvlegal.com/blogs/online-gaming-rules-2026-india-money-games-ban-esports

A qualified lawyer must confirm the final product and copy before launch. This spec does not remove that need.

## Success criteria

1. No public surface asks a player to pay an entry fee or advertises a cash prize.
2. A dedicated safety page states the free-entry rule, the no-money rule, the age rule, the reporting path, the grievance path, the point of contact and how the site earns money.
3. Every public page shows a short global disclosure and links to the safety page.
4. All stale pricing, verification, shortlist and fabricated-stat copy is gone from public routes.
5. Reporting produces an automatic consequence. No human reviews a report before the consequence applies.
6. Revenue surfaces are live and disclosed: sponsor placements, affiliate links and sponsor-funded free events. No player pays the platform and no prize money is held.
7. SEO metadata is per route, canonicals are unique, private routes are noindex, and the OG copy matches the current product line.
8. The contextual appearance reset works in all four presets at phone and desktop widths.
9. Gates are green: lint, tests without `DATABASE_URL`, build, real Chrome click-through at 375px, 768px and 1440px with no horizontal page scroll and no console errors.
10. Schema changes are additive only. Any QA rows created during verification are scrubbed.

## Non-goals

- Escrow, custody of money, payouts, KYC or payment rails.
- Registration as an e-sport. That needs external recognition first.
- Charging players to join anything.
- Human verification, verified badges or an admin approval queue.
- Paid digital products with a checkout. That is a later phase.
- Storing appearance settings in Prisma. localStorage stays the source of truth.

## Design

### 1. Free-entry product rule

The database keeps its existing columns to respect the additive-only migration rule. The application stops using them for money.

- `src/app/post/actions.ts` and `src/app/post/series/actions.ts` force `entry: 'free'`, `prize: 'none'`, `entryFee: null` and `prizePool: null` on every write, including the series template and materialised occurrences.
- `src/config/match.json` entry list becomes `["free"]` and prize list becomes `["none"]` so the zod schema cannot accept other values.
- Post form and weekly-series form drop the entry fee and prize pool inputs. They show one static line: "Free entry. Final Circle does not advertise cash prizes or handle money."
- Match detail shows "Entry: Free" and no prize amount. The current sentence about settling fees directly is replaced by the free-entry disclosure.
- Match list and any other public table stop rendering entry fee or prize pool.
- Historical rows keep their old values in the database. Public UI never renders them. This is a display and write rule, not a data rewrite, so history stays honest.

### 2. Disclosure and legal copy

New public route `/safety`, titled "Safety and legal", with plain sections:

- What Final Circle is: a free notice board for Free Fire matches.
- What we do not do: collect, hold or pay money; advertise entry fees or cash prizes; verify players; award a verified badge; run escrow; adjudicate a money dispute.
- Why: a short plain-language paragraph about the 2026 rules, with a note that this is not legal advice and a link to credible background reading.
- Free events only, and sponsor-funded rewards where players pay nothing.
- 18+ only.
- How to report a match and what happens automatically.
- Grievance path: in-app report first, email fallback, then the Online Gaming Authority within 30 days if unresolved. No invented service promise.
- Point of contact: founder name and email from `BRAND`.
- How we earn: sponsor placements, disclosed affiliate links, sponsor-funded free events.
- Trademark and independent-site notice.

Global footer gains a short line: "Free entry only. No money handled by Final Circle. 18+." plus a link to `/safety`.

Route copy updates:
- Terms: hosts post free, players never pay, no entry fees or cash prizes, sponsor-funded free events only, no money custody, no dispute adjudication, automated enforcement, 18+, report and grievance paths.
- Privacy: add report records and their retention, point of contact, replace remaining "organizer" wording with "host".
- FAQ: add questions on money, paid entry, asking players to pay, reporting, how the site earns, and whether Final Circle is a registered e-sport. Answer plainly and say no where no is true.
- About: explain why the board is free-entry only.
- Landing: remove "free or paid entry stated up front" from the comparison table, add the disclosure band, keep the independent-site notice.
- Sign-up: consent covers 18+ and the free-entry rule in addition to the Privacy Notice.
- Sponsor sign-up and new `/advertise`: sponsor placements for brands with no real-money gaming link, sponsor-funded free events, opt-in player data only, no email addresses.
- Loadout: keep the affiliate disclosure and add one line that we never earn from entry fees or prizes.
- Verify the copy agent's removals stayed removed: no ₹499, unlock, verification promise, shortlist, screenshot, fabricated stat or em dash in public copy.

### 3. Automatic enforcement, no human in the loop

- Additive Prisma migration only: `Report.category String?` and `User.postingPausedUntil DateTime?`.
- Report form gains a category select: `payment_request`, `fake_match`, `other`, plus the existing free-text reason.
- When a match has at least two `payment_request` reports from users who actually joined that match, the server action sets `match.status = 'closed'`, sets the organizer's `postingPausedUntil` to exactly 7 days from server time, writes an audit log row, and revalidates the pages. The same rule is enforced in `createMatch`, so a paused host gets a clear error and cannot post.
- Match detail shows the real report count as a warning when the threshold is reached. No badge, no claim of review.
- The pause expires on its own. There is no appeal queue and no admin action.

The existing weekly-series trust ladder stays as it is. It is already automated and derived from real rows.

### 4. Revenue surfaces

- Sponsor placement: use the existing `SPONSOR_LINE` footer slot and an `/advertise` page. Negotiate by email. Do not publish a rate card until a real buyer agrees.
- Affiliate: keep `/loadout` links and disclosure. This is the lowest-risk income.
- Sponsor-funded free events: describe the shape on `/advertise` and sponsor sign-up. Sponsor pays a flat fee outside the app and funds any reward directly. Players pay nothing and Final Circle never holds the money.
- Paid digital guide: deferred to a later spec because a checkout needs payment infrastructure. Do not hint that it exists now.

### 5. SEO and metadata

- Root metadata: remove stale keywords and the "verified FF players" OG alt. OG title matches the current product line. Canonical points to the site root with a trailing slash. JSON-LD description matches the free-entry rule.
- Every public route exports its own title, description and canonical path. Routes with a dynamic id use `generateMetadata` and a canonical of `/matches/<id>`.
- Private routes (`admin`, `player`, `settings`, `login`, `sign-up`, `sponsor/sign-up`) export `robots: { index: false, follow: false }`.
- Add `robots.ts` and `sitemap.ts` using the App Router file conventions in the installed Next.js 16.4.6 docs.
- Run the regex audit from the owner's SEO source before sign-off: internal links including `route.ts`, canonical uniqueness, title and description lengths, title and H1 agreement, broken links.

### 6. Appearance

- Keep the contextual "Reset {preset.label}" change in `AppearanceControl.tsx`.
- Verify it in real Chrome for Paper, Night, Slate and Sand at 375px and 1440px. Reset restores that preset's accent plus regular density and system motion, and does not switch palette.

### 7. Documentation

- Add ADR 0005 for the legal-safe free-entry reset and revenue decision.
- Update `DESIGN.md` copy rules with the free-entry and no-advertised-prize rule.
- Update `docs/codemap.md` with `/safety`, `/advertise`, the report category and the posting pause.

## Implementation order

1. Spec approval by owner.
2. Additive migration and server-side free-entry coercion.
3. Forms, match views and public tables.
4. `/safety`, `/advertise`, footer disclosure and all legal copy.
5. Report category and automatic pause.
6. SEO metadata, robots, sitemap and regex audit.
7. Finish contextual appearance reset verification.
8. Gates and real Chrome verification at 375px, 768px and 1440px.
9. Scrub QA rows, update docs, commit in verified increments.

## Definition of done

All nine implementation items are marked done with command output or browser evidence. `npm run lint`, `Remove-Item Env:DATABASE_URL; npm test` and `npm run build` pass. A restarted `next start` serves the final build. Real Chrome shows the disclosure on public pages, the free-entry match form, the report warning, all four appearance presets and no horizontal scroll at the three breakpoints. No stale money or verification claim remains in public copy. The owner has a lawyer review the final copy before production launch.
