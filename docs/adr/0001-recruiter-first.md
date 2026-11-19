# Design decisions

ADRs are numbered chronological. When you change an earlier decision, write a new ADR that supersedes it — never edit history.

## ADR-001 — Recruiters first, not players

**Context:** v0 explorations targeted both players and organizers.

**Decision:** Players land free on `/sign-up`. Organizers land on `/organizer/sign-up`. The CTA to *pay* always points at the organizer flow. Players never pay anywhere in v1.

**Why:** Organisers have real money (₹499/event) and real pain today. Players are long-tail acquisition — they come in via player C2C sharing, and we win them by having verified data. Monetising players first poisons the channel.

**Consequences:** Player signup cannot have a promo CTA or trial unlock; keep the reward-free "You're in the pool" moment.

## ADR-002 — No chat. No mention of it anywhere.

**Context:** Every recruiter in this space has a Discord/WhatsApp group. Neither is scheduled here.

**Decision:** Final Circle does not build messaging in v1. Coordinate via CSV export once and via coordinator WhatsApp groups, which is where this audience already lives.

**Why:** we do not want moderation liability, and we will not win vs Discord in the first 18 months. Export + email is good enough for a ₹499 paid event.

**Consequences:** organizer export is CSV with handle + contact column (contact is optional, organizer fills it) — no direct outbound from inside the app.

## ADR-003 — No Garena API, ever (in v1)

**Context:** Free Fire is a Garena product; they license data. Unofficial scrapers exist; we will not use them.

**Decision:** every screen uses manually-verified screenshots uploaded by players. There is no automated rank polling, no scraped leaderboard, no player stats mirror.

**Why:** we lose nothing — the verification queue IS the product gate. Our moat is "someone trusted this player's screenshot", not pretending we can ping Garena's server on demand.

**Consequences:** verification takes 24–48h for each screenshot; organizer dashboard shows pending by default as "pending — under admin review".

## ADR-004 — Next.js 16 + Turbopack + Prisma captures a schema that already exists in production

**Context:** Final Circle runs with `prisma db push`, not migrations, while the schema is in flux.

**Decision:** `db push --accept-data-loss` is a dev-only tool. Schema is managed by capturing the resulting `prisma/schema.prisma` in git. When the shape stabilises, we will pick migrations and retire `db push`.

**Why:** while the data model changes weekly, migrations become more friction than they are worth. After pilot week, we'll generate a baseline from the schema and switch to migrations.

**Consequences:** no `migrations/` directory until the schema stabilises; this is a known and deliberate deviation; reviewers should accept it in PRs.
