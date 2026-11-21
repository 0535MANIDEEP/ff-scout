# Discord research: what actually helps people find teams

Date: 2026-11-22  
Method: web search plus real Chrome reads of the official Free Fire India Esports Discord preview and DISBOARD Free Fire listings. Channel previews are Discord's own AI summary and are marked "might be inaccurate", so treat details as directional, not exact quotes.

## Finding

Discord confirms the Reddit finding. The coordination layer that works is a **dedicated find-team channel** where a host states a role, a time window, a mic requirement, and an experience level as plain text. No server in the sample makes players pay to join. The patterns worth copying are the plain-text signals; the prize/ID-market patterns are not.

## Evidence from the official Free Fire India Esports Discord

Server header: "Official Discord Server for Garena Free Fire India Esports!" — **71,400 members, 1,591 online** at time of reading. These numbers are evidence the channel is used; they are not values Final Circle should render.

| Channel preview | What hosts actually write | Product signal |
|---|---|---|
| `# 𝙁𝙞𝙣𝙙-𝙩𝙚𝙖𝙢𝙨` — 26 people, 43 messages | "Competitive squad and player recruitment"; requires "at least six months to a year of competitive experience, gameplay clips, and active mic communication"; recruiting "snipers, sniper and IGL hybrids, and primary or secondary rusher duos". | A distinct LFG surface, with role and mic and experience stated in words. |
| `# 𝙀𝙨𝙥𝙤𝙧𝙩𝙨-𝙘𝙝𝙖𝙩` — 23 people, 67 messages | Recruiting "skilled snipers, secondary rushers, and grenade specialists"; requires "clip submissions, working microphones, strong game sense, and tournament or scrim experience". | Requirements are plain text, not a badge. |
| `# 𝙀𝙨𝙥𝙤𝙧𝙩𝙨-𝙘𝙝𝙖𝙩` — 14 people, 27 messages | "primary rusher, secondary rusher, sniper, and a bomber or in-game leader"; "tier two tournament or scrim experience, non-toxic attitude, and regular daily availability for practice". | Role labels plus an availability habit. |
| `# 𝙁𝙞𝙣𝙙-𝙩𝙚𝙢𝙨` — 4 people, 12 messages | Warrior Esports recruiting IGL, Support, Sniper for "night practice sessions based out of Nagpur"; "a rusher expressed interest, and the recruiter requested their game ID to connect". | Join is an interest signal first, contact second. Matches our join-then-roster flow. |
| `# 𝙀𝙨𝙥𝙤𝙧𝙩𝙨-𝙘𝙝𝙖𝙩` — 10 people, 22 messages | "daily practice from 9:00 PM to 11:00 PM with required working mics"; another squad available "between 6:30 PM–8:00 PM and 9:00 PM–10:00 PM". | Specific time windows, not location. Reinforces `startsAt`/`endsAt`. |

The server also runs tournaments, scrims, monthly quizzes, and giveaways, but the find-team problem is solved by the two LFG channels, not by the events.

## Evidence from DISBOARD Free Fire listings

Listings that describe the useful coordination layer:

- Dark Infinite: "Regular Custom Rooms • Community Tournaments • Squad & Team Finding • Active Voice Chats".
- Arise Gaming / Lords Indeed: "custom room matches, competitive scrims & squad lobbies" with "self-assignable roles for games, platforms (PC / Mobile / Console), and pings".
- Imperialz and ZERO-MERCY: dedicated LFG, team recruitment, and voice rooms with "no toxicity" rules.

Listings that show patterns to reject:

- OM eSports: "Cash/Prize Cups" and "cash prize pools".
- FF ID MARKET and Apex Trading Hub: "Safe & Verified Game Trading", "Verified Middleman Service", reputation/vouch systems for account trading.
- Several servers: giveaways and diamonds as the main draw, server booster and leveling systems.

## Useful patterns to keep

1. **One dedicated LFG surface.** Find-team is a separate place from general chat. Our board is that surface.
2. **Plain-text requirements.** Role (IGL, sniper, rusher, support), mic requirement, experience level, and time window are written by the host in words.
3. **Interest before contact.** A player shows interest, then the host asks for a game ID. That is our `MatchEntry` join then roster view; no in-app chat needed in v1.
4. **Time windows, not location.** Confirms `startsAt`/`endsAt` is the right field and location matching is not a priority.
5. **Light self-description, no verification.** Self-assigned roles work in Discord; a "verified" badge or ID marketplace does not belong here.

## Patterns to reject

- Paid tournaments, entry fees, prize pools, cash cups, giveaways as the core value.
- ID selling, "verified" trading, middleman/reputation marketplaces. Garena bans ID selling; we ban the whole category.
- Verification badges or approval queues. Hosts state requirements; we do not certify players.
- Role inflation (booster tiers, level systems, mod hierarchies) that does not help someone join a match.
- Voice channels and realtime chat. Useful in Discord, but chat, DMs, and realtime are explicitly out of v1 scope.

## Decision impact

The design spec's data model already has `startsAt`/`endsAt` for the time window and `MatchEntry.note` for the joiner. The one gap is a host-side place to write the plain-text requirements that Discord and Reddit both show. Smallest change: **one optional `requirements` text field on `Match`**, shown on the post form and match detail, with no enum, no badge, and no validation beyond length. No separate skill-band, mic-flag, role, or availability field; plain text covers all four and `startsAt`/`endsAt` already covers the window.

## Limits

Channel previews are Discord's AI summary, not raw messages, and may be inaccurate. DISBOARD descriptions are self-written by server owners. The sample is directional evidence of coordination habits, not a claim that any specific server is active or safe.
