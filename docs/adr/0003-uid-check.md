# ADR 0003 — UID check: verified pool + optional live profile (2026-11-19)

> Status: Superseded in part by [ADR 0005](0005-legal-safe-free-entry-and-revenue.md) for all money, pricing, verification and moderation claims below.

Context: organizers screening entries and players checking each other ask two questions — "has this UID been checked?" and "what does this account look like?". A competitor teardown (Free Fire Keeda) validated the tool-as-magnet pattern, but its upstream is an unofficial Garena endpoint hidden server-side, and the one open-source alternative is CAPTCHA-gated. Neither is a dependency we can build a "verified" promise on. The provider chosen is GamesKinbo's Free Fire Info API, whose free tier is ₹0/month (50 calls, 5 req/min, no card).

## Decisions

1. **Two halves, one route.** `GET /api/uid-check` answers from our own database first (the verified pool — unlimited, free, the part no competitor offers) and from the provider second (live public profile). The pool half works with no key configured; the live half reports `disabled` honestly instead of failing silently.
2. **The provider key is env-gated and optional** (`GAMESKINBO_API_KEY`, Vercel dashboard only, never git). No key → `disabled` state; 429 (per-minute or monthly allowance) → `quota` state; anything else → `error`. 402 on this provider means "invalid UID or server error", never a payment prompt.
3. **Rank codes pass through raw** (e.g. `325`). The provider does not document its rank-code→tier mapping, so mapping would fabricate. The page says so.
4. **Regions are limited to the provider's documented set** (BD, IND, BR, US, SAC, NA, TH, ID, SG, PK) and sent uppercase exactly as documented. Undocumented regions would be guesses that fail at runtime.
5. **Whitelist shaping.** `shapeProfile` in `src/lib/ff-upstream.ts` picks fields explicitly; everything else the provider returns (tokens, internal IDs) never leaves the server. An unreadable body is reported as `error`, not as "player not found" — we cannot tell the difference, so we don't claim to.
6. **Rate limiting stays ours**: 10 checks per 15 min per IP via the existing `checkRateLimit`, stricter than the provider's 5/min, so a burst can never burn the monthly allowance.
7. **Why this is v1, not scope creep** (AGENTS.md rule 3): it is the organizer's pre-roster cross-check — the exact moment before locking a roster — and the player's "verified once, paste anywhere" hook. It feeds the onboarding → verified shortlist → unlock path rather than sitting beside it.

## Explicitly deferred

- **Usage display.** The provider exposes `GET /api/usage` (used/limit/remaining). Surfacing "X of 50 free lookups left" is honest and useful; add it when a key is configured.
- **BR/CS mode on verification.** The teardown showed profiles carry Battle Royale and Clash Squad ranks separately; a `mode` field on verification belongs in the schema discussion, not this tool.
- **Public player card `/p/[id]`.** Awaiting the founder's call; the pool row is designed to link to it once it exists.
