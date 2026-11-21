# Final Circle — Role taxonomy (2026-11-19)

## The five combat roles

Every Indian FF competitive squad fights with a five-role structure. Sources consulted before committing this taxonomy:

- Gurugamer, "Free Fire eSports Team Calls and Coordination Guide" (Nov 2025) — squad tables: IGL, Primary Rusher, Secondary Rusher, Sniper, Support
- Eneba, "Free Fire Esports: Complete Guide" (Nov 2025) — roles map to character kits: rushers (entry), anchors (positional), support (healing/utility)
- Clash Squad role breakdowns (Free Fire Hub, ManaBuy) — CS teams run Entry / Trade / Anchor / Support as the stable quartet; pure "sniper-only" is rare in square BR but standard in Indian open-lobbies

We use **five combat roles** because they are what players actually declare and what hosts scan for:

| Role | What it means | Typical loadout |
|---|---|---|
| `rusher` | Entry fragger — first contact, first knock | M1887 / M1014 + nade |
| `sniper` | AWM sniper / long-range opener | AWM + 6x |
| `support` | Heals, utility, revives | M1014 + gloo + medkit |
| `anchor` | Holds lanes/angles, survives late game | XM8 / AK-47 |
| `lurker` | Off-angle specialist | Mini14 / Dragunov |

## Why IGL is NOT a role

IGL (in-game leader) is a **designation**, not a combat style: one player per squad, usually the most experienced, calls rotations and the final call — while playing one of the five above (Gurugamer explicitly notes IGLs commonly play Support or Sniper). Treating IGL as a selectable peer role produced two failure modes: (1) every sign-up ticks it for ego; (2) hosts can't tell a genuine caller from a name.

Final Circle therefore does **not** offer IGL as a role. Players pick one of the five combat roles above and enter their own rank. There is no `iglCapable` field, no captain review and no verification of calling skill anywhere on the board. Anything a host learns about a caller comes from the match itself, not from a badge issued by Final Circle.

## Dropdown policy

Native `<select>` elements are used everywhere (no custom dropdown libraries): they are accessible, keyboard-friendly, and work identically on mobile — with zero dependencies and no JS required for submission. The friction the user called out was semantic (IGL-as-role), not the widget choice.
