# FF Scout — MVP Spec

## The one thing it does (v1, shipped in 5 weekends)

**Verified, paid, player->team match for Indian college grassroots FF teams — in under 20 minutes from signup to shortlist.**

A player's rank is verified once (upload rank screenshot). An organizer, a college fest director or a tournament promoter pays to see the verified pool filtered by college, role, rank and city, and taps one button to message them.

**Why it has to exist, concretely:**
- College fests and organizers currently DM-recruit from WhatsApp groups in 40 different chats, with hundreds of unqualified applicants — quality is zero and time is huge.
- Sponsors cannot buy reach against "grassroots FF players" because nobody has a verified list of who they are and where they live.
- Every current competitor (Gamzone, Seek Team, Squadlink) is either fake stats with no verification, global (not India), or a full-blown rebuild that never shipped.

## Explicitly NOT in v1

- Chat/DM in-app (go through WhatsApp — it is already where organizers live)
- Tournament bracket management
- Payments/escrow between org and player
- Leaderboards, reputation score, points
- Multi-game support (Free Fire only)
- Native apps (PWA-first)

## Roles and permissions

| Role | Capabilities |
|---|---|
| Player | Signup, take action-limit verify, toggle `status: looking-for-team`, view matches |
| Player.Verified | Badge earned; counts toward org searches |
| Organizer (college/fest lead) | Pay (₹499/event) for pre-filtered shortlist; export CSV; contact matched players |
| Sponsor | Pay (₹15,000/campaign) for analytics + access to shortlists by city/college |
| Admin | Verify/flag players, refund, data export (GDPR request) |

## Money flow (₹, zero outsourced fantasy)

- ₹499 per college shortlist export (Rahul's fest pays, college principal not involved)
- ₹1,999 per "verified brand-match" for a sponsor audience
- ₹0/mo hosting (Vercel + Neon + GitHub)
- Margin math: 10 shortlists = ₹4,990. Cost to run.

## Data (minimal, normalized)
```sql
players(id, uid, display_name, role CU, college, city, rank, verified, status, created_at)
verification_proofs(player_id, file_path, verification_kind, verified_at, verified_by_org_id)
organizations(id, name, contact_email, org_type, city)
shortlist_requests(id, org_id, budget, min_rank, colleges[], downloaded_at)
matches(id, player_id, org_id, accepted, paid_at)
matches_audit(id, entity_type, entity_id, actor_id, action, created_at)
```

## Antennas (no-suckers attention)

All screens living in Vercel-deploy, no infra outside.

## Stage-0 plan (today -> Friday)

- Day 1: spec + repo wired
- Day 2: Next.js app + design tokens + 4 screens (Landing, Player On-boarding, Verified profile, Org portal)
- Day 3: auth via Clerk-lite/NextAuth + file upload to Vercel Blob + Prisma client + Postgres
- Day 4: admin verify queue (3rd role) + e-sign workflow for comms
- Day 5: deploy to Vercel; invite 2 real organizers from VJIT Ganjikhana; photograph actual usage
- Day 6-7: postmortem recording with the organizer; fix the 3 worst screens

## Success gate for v2 (picks only if v1 succeeded)

3 real organizers pay, verified 150+ players, 1 sponsor activation delivered. If none: stop the project, write the postmortem, ship it as your portfolio piece instead.
