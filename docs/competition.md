# Final Circle: Competitive scan (2026-11-19)

Positioning question: what existing thing is Final Circle, and what is it not?

This scan is background from before the 2026-11-22 free-entry reset. Competitor descriptions are as recorded then and were not rechecked. Product direction now comes from `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`. Legal background is research, not legal advice. External legal review was not performed for this release; see `docs/handoff-launch.md` → Legal review decision.

## Who already does FF recruitment in India

| Player | What it is | Weakness for a grassroots organizer |
|---|---|---|
| **Krew (trykrew.com)** | Live LFG lobby finder + college/clan tournaments, approved by Krew team, no payments handled. Mobile/web. Genuinely close competitor on positioning. | Discord/WhatsApp chaos recreated in nicer form. Monetization unclear. |
| **GamerFlick (gamerflick.in)** | Full tournament app: brackets, prize, coin economy. Live in India for FF/BGMI/Valorant. | A bracket app with a gambling-adjacent coin culture. |
| **Squadlink (squadlink.in)** | "Gaming identity platform": profile, coaching, matchmaking. Announced, pre-launch | AI everything, multi-game, no verification stance |
| **Free Fire India Arena (FFIA)** | Garena-managed official ecosystem | Official tournament authority, not a community notice board |
| **Free Fire India Esports Discord** | Recruitment threads | Manual, unverified, completion-posted noise |

## Global esports recruiting: the feature bar

| Player | Notable mechanic | Relevance to Final Circle now |
|---|---|---|
| **Seek Team** | Gaming CVs, basic free, contact flow | Not our model. We do not maintain player CVs or screen players. |
| **Callup.gg** | Search open-to-teams players; intro only opens on player consent; Pro $9.99/mo | Not our model. We run no player directory and no subscription. |
| **Tournament Suite** | Talent directory + org dashboard | Not for us, too broad |
| **Campeon/Tryouts.gg** | Paid tryout facilitation | Not relevant to a free notice board |
| **Rostered.gg** | Verified badges are reviewed, org joins are invite-based | Not our model. No badges, no review queue. |

## What this scan still tells us

1. **Platforms add weight.** Most competitors want brackets, social graphs, coaching or a coin. Final Circle is a board for posting and joining matches.
2. **Screening is a trap.** Verification promises and shortlist gating are the norm elsewhere. Final Circle does not verify players, issue badges or maintain a shortlist.
3. **Consent is a pattern, not a surface.** We keep only the 18+ notice at sign-up and the shipped disclosures; there is no sponsor directory or export.
4. **Money is the wrong lever.** Free entry with no advertised prize is the line this product stays on. That is a product rule, not a claim of legal compliance.

## What we deliberately do not do

- Matchmaking, suggestions, AI roster building or AI scouting
- Brackets, a prize economy, checkout or any payment rail
- Verification queues, badges, screenshot review or a shortlist gated by payment
- A human approval queue for posting, weekly series or report consequences
- Subscriptions, unlock fees or a paid organizer tier
- Sponsors with a real-money gaming link

## Our one-line differentiation

**A free notice board for Indian Free Fire matches. Hosts post, players join, and Final Circle handles no money.**

## Decision: none required

The scan changes no code. It confirms the board stays free, simple and opt-in. Current direction is in `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`.
