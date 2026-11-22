# Final Circle: Client Handoff

This is what the owner does to run the current product. Final Circle is a free notice board for Free Fire matches in India. Hosts post, players join, and no money moves through the platform.

## Ownership summary

| Thing | Account or location | Who holds keys |
|---|---|---|
| Production site | https://ff-scout.vercel.app | Owner, Vercel account |
| Source code | https://github.com/0535MANIDEEP/ff-scout | Owner, GitHub |
| Database | Neon project `ff-scout-db`, Singapore region, free tier | Owner, Vercel Marketplace link |
| Environment secrets | Vercel dashboard, never in this file | Owner |
| Grievance and sponsor email | manideepdaram@gmail.com | Owner |
| DNS / domain | no custom domain recorded | Not applicable |

Do not put credentials in this file. Rotate any credential that was previously recorded here. Payment accounts, escrow accounts and verifier or organizer accounts are not part of this product.

## Day-one controls, PowerShell, same dir as the repo

All of these are wired into the repo and deploy on a merge to `main`.

| Control | Command |
|---|---|
| Deploy | merge PR to `main` on GitHub, or `vercel --prod` |
| Env vars | Vercel dashboard → Project `ff-scout` → Environment Variables. `DATABASE_URL` lives there; `NEXT_PUBLIC_SITE_URL` is optional. |
| Logs | `vercel logs --environment production --no-branch --since 1h` |
| Rollback | `vercel deploy --prod` after reverting the commit on `main` |
| Database | `npx prisma migrate deploy`, additive migrations only |
| Tests | `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test` |
| Build | `npm run build` |

## Content management, what to change where

The site is deliberately small. Check `docs/content-map.md` for the full list.

| What the client sees | Where it lives |
|---|---|
| Brand name, tagline, description, email, founder, URL, trademark string | `src/shared/config/brand.ts` |
| Free-entry constants and global disclosure | `src/features/disclosure/copy.ts` |
| Hero headline, subhead, open-match preview and disclosure | `src/app/components/Hero.tsx` |
| Loop steps, cards, replacement table, disclosure section | `src/app/page.tsx` |
| FAQs | `src/app/faq/page.tsx`, the array of `{ q, a }` objects |
| About | `src/app/about/page.tsx` |
| Terms | `src/app/terms/page.tsx` |
| Privacy | `src/app/privacy/page.tsx` |
| Safety and legal notice | `src/app/safety/page.tsx` |
| Advertise notice | `src/app/advertise/page.tsx` |
| Learn / field manual chapters | `src/features/disclosure/learn.ts` |
| Affiliate link disclosure | `src/app/loadout/page.tsx` and `src/features/sponsors/affiliate.ts` |

## Handoff steps for an actual owner

1. Create or confirm a Vercel account for the owner. Hobby tier has commercial-use limits, so confirm the plan before any paid sponsorship.
2. Transfer the GitHub repo through `Settings → Danger Zone → Transfer ownership`.
3. In Vercel, move the Neon integration to the owner or add the owner as a collaborator with limited permissions for the first year.
4. Remove stale demo accounts from the database. Do not reuse credentials from the old verification and unlock setup.
5. Confirm that `/safety` and `/advertise` still carry the full notice and that the grievance email is monitored.
6. Domain is optional. Buy one, point it at Vercel with `A 76.76.21.21`, and set `NEXT_PUBLIC_SITE_URL` when it verifies.
7. External legal review was not performed for this release; see `docs/handoff-launch.md` → Legal review decision.

## Known gaps and deliberate omissions

- **No analytics.** Vercel Web Analytics can be enabled in the dashboard.
- **No monitoring.** UptimeRobot free tier or Vercel uptime checks on a paid plan.
- **No money flow, by design.** No checkout, no payment gateway, no escrow, no payouts. There is nothing to stub in for unlocks.
- **No verification, by design.** No screenshot queue, badges, shortlist or human approval step.
- **No human review of reports, by design.** The automated consequence and audit log are the record.

## Immediate checklist

- [ ] Remove stale demo and verifier-era accounts
- [ ] Run the test command with `DATABASE_URL` removed
- [ ] Confirm the disclosure line matches `src/features/disclosure/copy.ts` on every public route
- [ ] Confirm `/safety` and `/advertise` carry the free-entry, no-money, 18+, reporting, grievance and revenue notices
- [ ] Record the launch decision in `docs/handoff-launch.md` → Legal review decision.
- [ ] (Optional) Add a custom domain
- [ ] (Optional) Enable Vercel Web Analytics

## Honest status of this release

Counts on the site come from the database at request time. Do not replace them with fixed marketing numbers. If the owner finds a claim on the site that is not true, revert that commit and tell the committer.
