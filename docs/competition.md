# FF Scout — Competitive scan (2026-11-19)

Positioning question: what existing thing is FF Scout, and what is it not?

## Who already does FF recruitment in India

| Player | What it is | Weakness for a grassroots organizer |
|---|---|---|
| **Krew (trykrew.com)** | Live LFG lobby finder + college/clan tournaments, approved by Krew team, no payments handled. Mobile/web. Genuinely close competitor on positioning. | No verification of who's real. Discord/WhatsApp chaos recreated in nicer form. Monetization unclear — risk of it being "app you try, not pay for" |
| **GamerFlick (gamerflick.in)** | Full tournament app: brackets, prize, coin economy. Live in India for FF/BGMI/Valorant. | A bracket app + gambling-adjacent coin culture. Filter function absent — problems like fake ranks and ghosting players remain |
| **Squadlink (squadlink.in)** | "Gaming identity platform" — profile, coaching, matchmaking. Announced, pre-launch | AI everything, multi-game, no verification stance |
| **Free Fire India Arena (FFIA)** | Garena-managed official ecosystem | Official tournament authority — not a recruiting tool for grassroots |
| **Free Fire India Esports Discord** | Recruitment threads | Manual, unverified, completion-posted noise |

## Global esports recruiting — the feature bar

| Player | Notable mechanic | What we take |
|---|---|---|
| **Seek Team** | Gaming CVs, basic free, contact flow | Verified CV concept — ours is weaker (screenshots only). Later: optional clip URL |
| **Callup.gg** | Search open-to-teams players; intro only opens on player consent; Pro $9.99/mo | The *consent* gate when contacting a player. Our CSV is no consent here — players sign up knowing organizers see their basic profile |
| **Tournament Suite** | Talent directory + org dashboard | Not for us — too broad |
| **Campeon/Tryouts.gg** | Paid tryout facilitation | Not relevant in India grassroots |
| **Rostered.gg** | Verified badges are *reviewed*, org joins are invite-based | Our admin eye-verify workflow is this, minus hype; plus the "orgs cannot add you, you must accept" model is close to Callup's consent gate |

## What they all get wrong for Indian grassroots organizers

1. **Platform, not filter** — every competitor wants players, tournaments, brackets, social graph, coaching AI, a coin. An organizer with a ₹499 problem wants one shortlist in <20 minutes, not a platform to maintain.
2. **Subscriptions** — Callup charges monthly; this market tips at ₹3000-5000 lifetime look. ₹499/event is the right handle.
3. **Verification is automated or fake** — kda-stats self-claim or nothing. Admin eye-on screenshot is the honest bar.
4. **No double-entry for proof** — every form asks for the same screenshot. We ask once, verify once.

## What they do better — steal cheap

- Player consent/visibility toggle (open/closed to offers) — we already have `status: looking/playing/inactive`.
- Verified badge with a *review* meaning — we have this via admin eye-verify; make the meaning explicit everywhere.
- Roster edge view — Callup shows a player in one org's roster max; useful. Not building it until pilots say so.

## What we deliberately don't do (ever)

- Matchmaking/suggestions, AI roster builder, "AI scouting"
- Bracket/scheduling/payments
- Admin-impersonating moderation pipeline; all review is human, all appeals by email
- Subscriptions. One ₹499 per event unlock; players free forever; sponsors pay per cohort, not per seat

## Our one-line differentiation

**"The verified filter India's FF organizers use between recruitment posts and roster locks"** — verified by a human, priced per event, no platform bloat.

## Decision — none required

This scan changes no code in v1. It confirms: stay verification-first, one cohort at a time, zero feature additions until two paying organizers say the same thing.
