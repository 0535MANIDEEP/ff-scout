# ADR 0005: Legal-safe free entry and revenue (2026-11-22)

Status: Accepted by owner on 2026-11-22

Supersedes the money, verification and organizer-payment claims in `docs/adr/0001-recruiter-first.md` and the historical decision records it contains.

## Context

The owner asked for three things: keep the founder out of legal trouble, find revenue surfaces, and remove scammers without a human approval bottleneck. The earlier product model charged organizers per event, advertised paid entry and prizes, and used a human screenshot-verification queue. That model is not compatible with the current legal position or with a solo founder.

Research into India's Promotion and Regulation of Online Gaming Act 2025 and the Promotion and Regulation of Online Gaming Rules 2026, in force from 1 May 2026, changed the design. An online money game is an online game where a player pays a fee, deposit or stake and expects money or something monetisable back, whether the game is based on skill, chance or both. Section 5 prohibits offering, aiding or abetting such a game. Section 6 prohibits advertising that directly or indirectly induces playing one, with penalties up to 2 years imprisonment or 50 lakh rupees. Section 7 prohibits facilitating payments for one. The e-sports carve-out needs recognition under the National Sports Governance Act 2025 and registration with the Online Gaming Authority of India, which is not available to this product now.

The remaining clean cell is free entry with sponsor-funded rewards: no money in from the player, so the money-game definition does not engage. The scam mechanic is separate. A host who asks players to pay is the abuse case, and waiting for a human reviewer leaves other players exposed.

Background reading, used as research and not legal advice:

- https://gaganlegal.com/articles/online-gaming-proga-rules-2026
- https://solvlegal.com/blogs/online-gaming-rules-2026-india-money-games-ban-esports

A qualified lawyer must review the final product and copy before launch. This decision does not remove that requirement.

## Decision

1. **Coerce free entry at write and display.** Every match write, including the weekly-series template and its materialized occurrences, stamps `entry: 'free'`, `prize: 'none'`, `entryFee: null` and `prizePool: null` from `src/lib/free-entry.ts`. `src/config/match.json` accepts only `free` and `none`. Public views render "Free entry" and "No advertised prize" and never read the legacy money columns for display. Historical rows are not rewritten. Final Circle does not collect, hold or pay money, run escrow, verify players, issue verified badges, or adjudicate money disputes. 18+ only. The global disclosure and the `/safety` page state this plainly.

2. **Enforce the report consequence automatically.** Reports carry a category. When at least 2 `payment_request` reports come from players who actually joined the match, the server closes the match, pauses the host's posting for exactly 7 days from server time, and writes an audit log entry. No human reviews before the consequence. The pause is checked on every post and series creation, expires on its own, and has no appeal queue. The weekly-series trust ladder stays as it is, already derived from real rows with 3 qualifying matches, 2 distinct non-host joiners, a 2-series cap and a 2 zero-join auto-pause.

3. **Use three disclosed revenue surfaces.** Sponsor placements through the existing `SPONSOR_LINE` footer slot and an `/advertise` page, negotiated by email with no rate card until a buyer agrees. Disclosed affiliate links on `/loadout`. Sponsor-funded free events where the sponsor pays outside the app and funds any reward directly. No player pays the platform. No checkout and no paid digital guide yet. No sponsor tie to real-money gaming.

## Consequences

- Legal exposure is reduced because no public surface asks for money or advertises a prize, and the site does not custody funds. It is not eliminated. A qualified lawyer still has to review the final copy and product before launch, and this decision does not claim e-sports recognition.
- There is no prize-based growth lever. Acquisition has to come from the free board, sponsor-funded events and honest word of mouth. Any proposal that relies on advertised winnings is out of scope.
- The abuse path is automated. Two joined-player reports are enough to close a match and pause a host. That is deliberate: fast protection for players matters more than a review queue. The tradeoff is that reports carry real consequences without human review, so the audit log is the only record and the counts shown on the match detail page must come from the database, never from invented numbers.
- Schema changes are additive only on the shared Neon database. `Report.category` and `User.postingPausedUntil` were added by `20261122000000_free_entry_report_safety`. Legacy `entry`, `entryFee`, `prize` and `prizePool` columns remain untouched for history.
- Public copy carries one exact disclosure line and a link to `/safety`. Metadata, footer, forms and empty states all have to agree with it. Tests must run with `DATABASE_URL` removed so they never target the shared database.

## Alternatives rejected

- **Paid entry with disclaimers.** A disclaimer does not change the money-in, money-out definition under the 2026 rules. It would also put the platform one step from payment facilitation and from advertising a money game.
- **Human review queue for reports.** A queue leaves players exposed between the report and the consequence, adds a verifier role the product does not have, and reintroduces the slow manual bottleneck the earlier model was built around.
- **Escrow or platform-held prize money.** Custody of money creates payment-facilitation exposure and dispute-adjudication work. Sponsor-funded rewards stay outside the app and no money passes through Final Circle.
