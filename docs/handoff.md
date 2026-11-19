# FF Scout — Client Handoff

This is what you (the owner) or your buyer does once the pilot is proven. Everything below is either already set up or 30 minutes of work using the components shipped here.

## Ownership summary

| Thing | Account / location | Who holds keys |
|---|---|---|
| Production site | https://ff-scout.vercel.app | you (Vercel account, already authed via `vercel` CLI as 0535manideep) |
| Source code | https://github.com/0535MANIDEEP/ff-scout | you (GitHub) |
| Database | Neon project `ff-scout-db`, Singapore region, free tier | you (Vercel Marketplace link) |
| Proof images | Cloudinary account (cloud name `ddvbrmlzm`), root key | you (Cloudinary console, API Keys) |
| Admin login | `manideepdaram@gmail.com` / `FFadmin-WGt44Qkt` | you |
| Secrets on disk | `C:\Users\manid\Downloads\opencode-files\ff-scout-secrets.txt` | you, chmod/ACL-locked to your account only |
| DNS / domain | not yet bought — using free `vercel.app` subdomain | n/a |

**Do not ship this file with any real secret. Everything above points at the vault in your Downloads folder, and at the Vercel dashboard.**

## Day-one controls (PowerShell, same dir as the repo)

All of these are already wired into the repo and deploy automatically on `git push origin main`.

| Control | Command |
|---|---|
| Deploy | merge PR to `main` on GitHub (auto Vercel deploy) OR `vercel --prod` |
| Env vars | Vercel dashboard → Project `ff-scout` → Environment Variables. `DATABASE_URL` and `SESSION_SECRET` are Vercel-managed. `CLOUDINARY_*` was added by you via `vercel env add`. |
| Logs | `vercel logs --environment production --no-branch --since 1h` |
| Rollback | `vercel deploy --prod` after reverting the commit on `main` |
| Database | `npx prisma migrate deploy` (runs migrations on prod against Neon) |
| Tests | `npm test` |
| Build | `npm run build` |

## Content management — what to change, where

The site is deliberately small. Almost every string lives in one of seven files. **Do not edit anything else without checking**.

| What the client sees | Where it lives |
|---|---|
| Brand name, tagline, accent color, contact email, pricing, trademark string | `src/lib/brand.ts` (single source of truth — change once, every surface follows) |
| Hero headline, subhead, CTA copy, live-roster empty state | `src/app/components/Hero.tsx` |
| "How it works", "What replaces", comparison table, final CTA, city-unlock CTA | `src/app/page.tsx` |
| FAQs | `src/app/faq/page.tsx` — edit the array of `{ q, a }` objects; no other wiring |
| About page | `src/app/about/page.tsx` — plain text |
| Terms | `src/app/terms/page.tsx` |
| Privacy | `src/app/privacy/page.tsx` |
| Learn / field manual chapters | `src/lib/learn.ts` — edit the `LEARN_CHAPTERS` array; every chapter is one object with `blocks` and `links` |
| Organizer CSV shortlist | `src/app/organizer/shortlist/download/route.ts` — do not edit; download format is a contract, only change with care |

## Handoff steps to an actual client (buyer side)

1. Create a Vercel account for the buyer (free Hobby tier is enough — it has commercial-use limits though; Vercel Hobby = non-commercial, Pro = $20/mo if they sell service).
2. Transfer the GitHub repo: GitHub → `Settings → Danger Zone → Transfer ownership`. Move it to buyer's GitHub org.
3. In Vercel: `Dashboard → Team settings → Installed marketplace integrations` → remove Neon from your account, add fresh Neon for buyer, OR keep shared by buyer inviting you as collaborator with limited perms (recommended for the first year — an ongoing handoff).
4. Rotate all secrets for the buyer:
   - `SESSION_SECRET`: generate new with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - Cloudinary root key: buyer creates a new Cloudinary account, gets new `CLOUDINARY_*`, update in Vercel production env
   - Admin password: buyer sets a new password by signing up as a NEW user and promoting themselves to `userType='admin'` via a one-time Prisma Studio or `psql` query — **delete the seeded `admin@ffscout.dev`** as the first action
5. Domain: buyer buys a domain (Namecheap/Cloudflare registrar), points it at Vercel (`A 76.76.21.21`), Vercel imports it automatically once DNS verifies.
6. Give buyer the **Secrets Vault file** (the one in your Downloads). It contains everything else.

## What the client cannot do yet (known gaps)

- **No payment flow.** Everything is free in pilot. Razorpay/PhonePe integration is not wired. If payments go live, stub in `VerificationProof`-adjacent `Unlock` model, charge before `shortlist_download` route, refund on admin reject.
- **No email sending.** `WaitlistEntry` rows are stored; nothing emails them. Add Resend (`resend` npm package — free tier 3k emails/mo) or AWS SES. Until then the "we'll notify you" copy is honest aspiration, not a real mechanism.
- **No automated image cleanup job.** Proofs deleted only when admin manually rejects AND future erasure cascade fires. Screenshots in Cloudinary persist after player erasure only because destroy is called in the cascade path — verify after buyer wires CRON.
- **No analytics.** Vercel Web Analytics can be turned on with one toggle (free) — `vercel link`, then Dashboard → `Analytics` → `Enable`. Or Plausible (paid, €9/mo).
- **No monitoring.** Vercel has built-in uptime checks on Pro only. Free alternative: choose `UptimeRobot` free 50 monitors, 5-minute checks.

## Immediate next actions (literal checklist for the buyer)

- [ ] Rotate `SESSION_SECRET` via Vercel env UI + redeploy
- [ ] Replace admin password (see step 4 above)
- [ ] Delete seeded demo account if `userType='player', email='deadpool@gmail.com'` was ever seeded in prod
- [ ] Enable Vercel Web Analytics
- [ ] (Optional) Add custom domain
- [ ] (Optional) Set up email notifications for waitlist (Resend free tier)
- [ ] (Optional) Keep watching `/admin/verify` daily until pilot cohort verified
- [ ] (Optional) Promote homegrown IGN competition: share `/sign-up` in Hyderabad FF Discord/WhatsApp

## Honest status of this release

- Prod is live at https://ff-scout.vercel.app
- 1 admin account, 0 players
- No payments, no analytics, no email notifications
- All claims on the landing page are either real (DB counts, admin verified) or explicitly labelled "Pilot phase: free right now."
- If the buyer finds anything on the site that's not true, **revert that commit immediately** and tell the committer. Don't keep copy that is not true.
