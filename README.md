# FF Scout — AGENTS.md (Quick Reference)

Product line: **The verified grassroots Free Fire talent pool for Indian organizers.**
We match verified rosters to organizers across:
- College fest organizers (e.g., Ganjikhana Game Nite, VJIT eSports Club)
- Tier-2/3 tournament organizer collectives
- Gamer-café LAN event hosts
- Pro-clan scouting (paid slot)
- Sponsor activations on a ₹15,000/campaign basis

Who it is NOT:
- Recruitment app for pro players (they already have an agent)
- A streaming platform
- A bracket/leaderboard tool

Money flow:
- Free to join the pool
- ₹499 / unlock per organizer's single event
- ₹999 / annual pro-scout export (5 exports)
- ₹15,000 / sponsor activation for verified cohorts

Engineering contract:
- `main` → CI green before push
- Every screen needs real data or honest fraction
- No feature without a pilot organizer confirming payment readiness
- No new dependencies without an npm audit + update-by-necessity reason
