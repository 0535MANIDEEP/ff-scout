# DESIGN: Final Circle

## What this document governs

This is the source of truth for visual and copy decisions in Final Circle. It applies to every route in `src/app`. Product facts come from `SPEC.md`, `AGENTS.md`, and the live database. When this document and a stale page disagree, change the page.

Final Circle is a free notice board for Free Fire matches in India. Hosts post, players join. Every listing is free entry with no advertised prize. Final Circle does not collect, hold or pay money, run escrow, verify players, issue verified badges, or adjudicate money disputes. 18+ only. No counters, badges, or timestamps may be fabricated.

## Design principles

1. **The board is the product.** The live match list gets the most space and the clearest type. Marketing copy supports it.
2. **One primary action per screen.** Everything else is a ghost action or a text link.
3. **Real state, plain words.** Show counts and statuses from the database. Say "Nothing posted yet" when the board is empty.
4. **One editorial identity, many palettes.** The default is a warm street-paper broadsheet. Users can change colors without changing the information structure.
5. **Density is a feature.** Match lists are scanned, not admired. Compact mode is first class.
6. **Accessible by construction.** Body text 4.5:1 minimum, large text 3:1, visible focus, reduced motion honored.
7. **Mobile first, always responsive.** The narrow layout is designed, not shrunk. Every screen reflows across phone, tablet, and desktop with no horizontal scroll.

## Presets

Four built-in presets. Every value below was checked against the background. Custom accents are checked at runtime with the same WCAG formula.

| Preset | `data-preset` | `--bg` | `--panel` | `--text` | `--muted` | `--line` | `--accent` |
|---|---|---|---|---|---|---|---|
| Paper | `paper` | `#ECE7DD` | `#F5F1E8` | `#1A1A18` | `#5B564B` | `#1A1A18` | `#C81E1E` |
| Night | `night` | `#141311` | `#1E1C19` | `#F5F1E8` | `#BDB5A5` | `#E8E1D3` | `#FF5A45` |
| Slate | `slate` | `#0F172A` | `#1E293B` | `#F8FAFC` | `#94A3B8` | `#94A3B8` | `#EF4444` |
| Sand | `sand` | `#F6EFE2` | `#FFFBF3` | `#241D16` | `#6A5C4B` | `#3C3226` | `#B4471F` |

Derived accent values:

| Token | Paper | Night | Slate | Sand |
|---|---|---|---|---|
| `--accent-strong` | `#A01515` | `#E0402B` | `#B91C1C` | `#8F3417` |
| `--on-accent` | `#F5F1E8` | `#141311` | `#FFFFFF` | `#FFFFFF` |
| `--input-bg` | `#FDFCF8` | `#23211D` | `#0B1221` | `#FFFCF6` |

Never hardcode a hex value in a component. Use the tokens. A preset change must require zero component edits.

## Theme contract

The root element carries:

- `data-preset`: `paper | night | slate | sand`
- `data-density`: `regular | compact`
- `data-motion`: `system | reduced | full`
- `style="--accent: <user hex>"` only when a custom accent is active

Appearance state lives in one localStorage key:

```json
{
  "preset": "paper",
  "accent": null,
  "density": "regular",
  "motion": "system"
}
```

Key name: `fc-appearance`. The old `ff-theme` value is read once and mapped to `paper` or `night`, then ignored. No server state, no user table field, no new environment variable.

Custom accent rules:

1. Accept a hex color from the native color input.
2. Compute contrast against the active preset background.
3. Below 4.5:1, show an inline message and keep the previous valid accent.
4. Derive `--accent-strong` by darkening in light presets and lightening in dark presets until it remains distinct from `--accent` and passes contrast.
5. Show a live sample button with the chosen values before the user commits.

## Tokens

### Spacing

`--s1: 8px`, `--s2: 13px`, `--s3: 21px`, `--s4: 34px`, `--s5: 55px`, `--s6: 89px`, `--s7: 144px`.

Compact density maps `--s4` to `21px`, `--s5` to `34px`, and `--s6` to `55px`. It never changes font sizes.

### Type

| Token | Value | Use |
|---|---|---|
| `--t-label` | `0.75rem / 700 / mono` | Table headers, status tags |
| `--t-body` | `1rem / 400` | Body, forms, list rows |
| `--t-lead` | `1.25rem / 400` | Hero and section leads |
| `--t-title` | `clamp(2rem, 4vw, 3.25rem) / 700 / display` | Section titles |
| `--t-hero` | `clamp(3.25rem, 8vw, 6rem) / 400 / display` | Home H1 only |

First viewport uses at most four of these sizes. A page uses at most six across its full height.

Families: display `Anton`, body `Inter`, mono `JetBrains Mono`. Fonts are self-hosted through `next/font`. No emoji as icons. No icon library unless a control needs a semantic glyph that text cannot carry.

### Shape and depth

`--radius: 0`. Separation comes from background tone, rules, and spacing. One accent color family per screen. No gradients, no glow, no card shadows, no decorative grid backgrounds.

### Motion

Only opacity and transform. Default 150ms for hover, 300ms for entrance, `ease-out`. `data-motion="reduced"` and the OS setting both remove nonessential animation. No spinner under one second. No pulsing calls to action.

## Components

### Button

One filled button per screen. Label names the action: "Post a match", "Join this match", "Save profile". Never "Submit", "Continue" without context, or "Learn more".

### Ghost action

Secondary navigation and alternate actions. Same height as the primary button, transparent background, visible border on hover.

### Match row

Real fields only: title, date, city, game type, mode, entry note, slot state. Status chips come from DB state. Team names are shown as typed by the joiner. Ranks are shown only when the source field exists.

### Form

Single column. Label above input. One error line per field. On submit failure, keep values and focus the first invalid field. One primary action. No multi-column stepper unless the route is a genuine wizard.

### Table

Used for comparison and rosters. Left-aligned headers, mono labels, body type in cells. Horizontal scroll wrapper on small screens.

### Empty and error states

Empty board: "Nothing posted yet. You're looking at an honest board." Empty directory: "No opted-in players match these filters yet." Errors state what failed and the next action. Never show a blank panel.

## Copy rules

Hard rules for every public surface, including metadata, form errors, empty states and buttons.

- No false claims. If it is not true in the code and database today, do not say it.
- No fabricated counters, timestamps, "live" numbers, testimonials, names, or verification badges. Show database state or an honest empty state.
- No em dashes in user-facing copy. Use a comma, colon, period, or parentheses. This applies to headings, buttons, metadata and errors.
- No admin or internal wording in public copy: no "approval queue", "verified shortlist", "unlock", "organizer pays", "rate card", or ₹ amounts. Say "host" and "free entry".
- One primary button per screen. Everything else is a ghost action or a text link.
- The global disclosure line is "Free entry only. No money handled by Final Circle. 18+." Keep it exact and visible on public pages.
- Every public page links to `/safety` for the free-entry rule, the no-money rule, 18+, reporting, grievance, how we earn, the legal background and the independent-site notice.
- No "trusted by", "industry leading", "game changer", "unlock the power of", "seamless", "elevate", or "in today's fast-paced world".
- Sentence case in headings and list items. Proper nouns and Free Fire terms keep their spelling.
- Trademark notice stays on the landing page. Independent-site notice stays visible.

## SEO rules

- Every public route defines its own title, description, and canonical path.
- Private routes (admin, player, settings, login, sign-up) use `noindex, nofollow`.
- The OG title must match the current product line. A stale title is a defect.
- Regex audit runs before sign-off: internal links including `route.ts`, canonical uniqueness, title and description lengths, title and H1 agreement, broken links.
- No keyword stuffing. Metadata reads like a person wrote it.

## Responsive layout

Mobile is the base layout, not a trailing override. Build the single-column phone view first, then add width where the content earns it.

- Start from the narrow state. Type, spacing, and stacking are tuned for a phone before any wide-screen rules exist.
- Set breakpoints where content stops working, not at a device list. Keep real states for phone, tablet, and desktop so the middle band is never a stretched stack or a crammed grid.
- Use fluid type with `clamp()` and relative widths. Multi-column grids collapse to one column on narrow screens. Tables become cards or a bounded scroll region.
- Never ship horizontal page scroll. No fixed-width children, no clipped content, no `overflow: hidden` hiding a layout failure.
- Interactive targets are at least 44 x 44 px with a visible gap. Hover-only actions need a tap equivalent.
- Fixed navigation stays compact and never covers the last item on the page. A menu must be labeled or its primary destinations stay visible.
- Verify by dragging the viewport through the whole width range, not by checking two sizes and stopping.

## Anti-patterns

- Purple or cyan gaming gradients.
- 3D or parallax hero effects. The product works on mid-range Indian Android phones.
- Card grids used to separate ordinary paragraphs.
- Repeated eyebrow labels and mono captions.
- Fake scarcity, fake "live" counts, fake verification badges.
- More than one filled button competing for the first click.
- A dark theme that reuses the light palette.
- Desktop styles with a small mobile patch bolted on at the end.
- Horizontal scroll, clipped controls, or tap targets under 44px.

## Definition of done

A screen ships when it works at 375px, 768px, and 1440px, in all four presets, with reduced motion, with visible focus, with no horizontal scroll, with real data or an honest empty state, and with metadata that matches its content.
