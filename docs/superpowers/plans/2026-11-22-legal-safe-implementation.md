# Legal-safe free-entry reset — implementation checklist

Date: 2026-11-22
Spec: `docs/superpowers/specs/2026-11-22-legal-safe-free-entry-and-revenue-design.md`

## Steps

- [ ] P0 Commit approved spec and land pending verified work in clean increments.
- [ ] P1 Additive Prisma migration: `Report.category`, `User.postingPausedUntil`; regenerate client.
- [ ] P2 Server-side free-entry coercion in post + series actions; `src/config/match.json` reduced to free/none.
- [ ] P3 Post form, series form, match detail and public tables show free entry only; stale money copy gone.
- [ ] P4 `/safety` page with full disclaimer, grievance, income and age rules; `/advertise` page; global footer disclosure.
- [ ] P5 Legal copy updates: terms, privacy, FAQ, about, landing, sign-up, sponsor sign-up, loadout; no stale verification/pricing/em-dash claims.
- [ ] P6 Report category + automatic 7-day posting pause after two joined-user `payment_request` reports, with audit log and threshold warning.
- [ ] P7 SEO: per-route metadata, canonicals, noindex private routes, robots.ts, sitemap.ts, regex audit from owner's SEO source.
- [ ] P8 Verify contextual appearance reset in real Chrome across four presets at 375px and 1440px.
- [ ] P9 Docs: ADR 0005, DESIGN.md copy rules, codemap.
- [ ] P10 Gates: lint, tests without DATABASE_URL, build; restart next start; real Chrome at 375/768/1440 with no horizontal scroll or console errors.
- [ ] P11 Scrub QA rows, commit verified increments, report blockers (lawyer review, external accounts, keys).

## Evidence log

Fill with exit codes, commit SHAs, tab/screenshot notes.
