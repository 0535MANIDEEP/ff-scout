# Final Circle: Data Architecture

Status: current as of 2026-11-22. Source of truth: `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`. This version replaces the verification and paid-unlock descriptions that were here before the free-entry reset.

**This is an engineering document, not legal advice.** The legal background is research only. A qualified lawyer must review the final product and copy before launch.

## 1. Product constraints

- Free notice board for Free Fire matches in India. Hosts post, players join, players never pay.
- 18+ only. Sign-up records the confirmation in `User.ageConfirmed` and the notice acceptance in `User.consentedAt`.
- No money is collected, held, moved or paid out by Final Circle. No escrow, payment gateway, checkout, payouts or money dispute handling.
- No human verification, badges, shortlist or approval queue. Sponsor discovery is opt-in only.
- Weekly series use a self-serve trust ladder. Reports carry an automatic consequence.

## 2. What we store and why

| Data | Stored in | Why | Visibility |
|---|---|---|---|
| Email, password hash | `User.email`, `User.passwordHash` | Login and account uniqueness. Hash is bcrypt and never selected into a view or export. | Owner only |
| Display name, UID, BR/CS ranks, role, city, team name | `User` columns | The roster fields players type themselves. Team name is an optional default for joins. | Host of a joined match; opted-in fields for sponsors |
| Sponsor opt-in and business fields | `User.visibleToSponsors`, `orgName`, `orgType`, `brandName`, `contact` | Sponsor directory and enquiry flow | only when the player opts in |
| Account type and operational flags | `User.userType` (`player`, `sponsor`, `admin`), `postingPausedUntil` | Access control and the automatic posting pause | Server side |
| Match posting | `Match` | Title, mode, game type, date and end time, city, online flag, slots, contact, notes, status | Public board |
| Free-entry terms | `Match.entry`, `Match.entryFee`, `Match.prize`, `Match.prizePool` and the matching `MatchSeries` columns | Legacy taxonomy columns. New writes use the constants in `src/lib/free-entry.ts`. Historical values are never rendered. | Public views show the fixed free-entry wording |
| Weekly series template | `MatchSeries` | Recurrence, duration, lifecycle and materialized occurrences | Host manages their own series |
| Join record | `MatchEntry`, including optional `teamName` | Roster and one join per player per match | Host of that match |
| Report | `Report.category`, `Report.reason` | Automated consequence and audit trail | Server side |
| Waitlist email | `WaitlistEntry` | City demand and launch notice. Stored, not sent. | Server side |
| Rate-limit key | `RateLimitEntry` | Brute-force and abuse protection. Pruned on insert. | Nobody |
| Audit event | `AuditLog` | Record of writes and safety consequences | Server side |

`User.paidUntil` is a legacy column from the old unlock model. It is not used by the current product.

Not collected: payment or bank details, UPI IDs, escrow records, prize payouts, rank screenshots for review, or a verified player list.

## 3. Storage and migrations

- Production uses Neon Postgres. The Prisma datasource is `postgresql` and reads `DATABASE_URL` from the environment.
- Migrations are additive only on the shared database. `20261122000000_free_entry_report_safety` added `Report.category` and `User.postingPausedUntil`. Legacy `entry`, `entryFee`, `prize` and `prizePool` columns were left in place for history and are not rewritten.
- The test suite checks config, schema and copy rules without a database. Run it with `DATABASE_URL` removed so it cannot target the shared database.
- No local SQLite app database is part of the current design. Do not run the old seed file against a real database.

## 4. Write paths

1. **Sign-up.** Form validation, bcrypt hash, `User` row with 18+ confirmation and consent timestamp, session cookie, audit entry.
2. **Post a match.** Server action stamps `entry: 'free'`, `entryFee: null`, `prize: 'none'`, `prizePool: null` from `src/lib/free-entry.ts`. `src/config/match.json` accepts only those values. No approval step.
3. **Join.** `@@unique([matchId, playerId])` is the gate against duplicate joins. Competitive and esports joins may store an optional team or guild name on `MatchEntry`.
4. **Weekly series.** A `MatchSeries` template materializes future `Match` occurrences with the same free-entry constants. The ladder values live in `src/config/match.json`: three hosted matches with at least two distinct non-host joiners, at most two active series, and auto-pause after two zero-join occurrences.
5. **Report.** A player picks a category on a match. When two `payment_request` reports come from players who joined, the server closes the match, sets the host's `postingPausedUntil` to exactly seven days from server time, and writes an audit entry. There is no review before the consequence and no appeal queue.
6. **Sponsor export.** Only `visibleToSponsors: true` players are returned. The CSV selects display name, UID, ranks, role and city. No email address is exported. Cells are escaped against formula injection and the export is audit logged.

## 5. Read and display rules

- Public views render the free-entry wording from `src/lib/free-entry.ts`. They never read legacy money columns for display.
- Counts shown on public pages come from the database at request time. No invented numbers.
- A host sees rosters for their own matches. Sponsors see only opted-in profile fields. There is no verifier or moderator tier and no organizer role.
- The audit log is the record for safety consequences. Reports are not held for a human reviewer.

## 6. Legal and privacy notes

- Grievance contact: manideepdaram@gmail.com. Report in the app first, then email, then the Online Gaming Authority of India within 30 days if unresolved.
- `/safety` and `/advertise` carry the full notice. Revenue is sponsor placements, disclosed affiliate links and sponsor-funded free events. No player pays the platform.
- India's Promotion and Regulation of Online Gaming Act 2025 and the 2026 Rules are background, not a compliance certificate. Final Circle does not claim e-sports recognition.
- A qualified lawyer must review the final product and copy before launch.

## 7. Open checks

- Keep schema changes additive and never rewrite historical rows.
- Run `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test` before any deploy.
- Audit public copy for money language, verification promises and fabricated numbers.
- Keep the lawyer review on the launch checklist.
