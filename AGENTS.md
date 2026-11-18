AGENTS.md — Instructions for AI assistants in this repo

This file is the contract between you and Manideep and any AI agent working in this repo.

**Project mission (one line):**
FF Scout — verified Free Fire grassroots-competitive matching between Indian college organizers and players.

**The eight asides that matter most:**

1. You do not delete work, rewrite history, or force pushes without explicit yes.
2. You do not add features beyond the SPEC's v1 scope until v1 is released.
3. You state what you changed and why before you push.
4. You run `npm run build && npm test` before claiming any screen is done.
5. You do not edit TipType/verified/balance for anything else.
6. You do not touch `.env*` except to reference placeholders.
7. You use commits to describe intent, not actions.
8. You ask before you scaffold new directories if their shape is not obvious.

**Scope lock:** v1 = Free Fire only. v1 = college organizers only. v1 = one happy path. No feature creep.

**Style:** Tailwind, light theme first, no nursery-bright greens or magentas.
Use #FF6B00 as the single accent. Inter + Space Grotesk.

**Verification rule:** if the feature can't be reached from the UI, it doesn't exist.
