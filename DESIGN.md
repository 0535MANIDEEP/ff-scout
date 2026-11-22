# DESIGN — Final Circle

## Design read

Redesign of a free-entry match board for Indian Free Fire players, in a calm editorial-sport language, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

The product is a trust-first notice board. The design must feel composed and credible, not like a game launcher. The user's brief was "good feel, not noisy, professional" and "fix it one by one from AI slop to human made."

## Dials and what they mean here

- **ENERGY 2**: one focal point per screen, quiet chrome, accent used only at the decision point. No glow, no neon, no full-bleed gradient.
- **RHYTHM 2**: a consistent base grid with deliberate breaks. The board list, the detail view and the reading pages each use a different composition. Repeating the same three-card grid on every page is a fail.
- **MOTION 1**: hover and press feedback, one short entry fade, and a toast slide. No marquees, parallax, pinning or looping decoration.

## Decisions and their reasons

| Decision | Reason |
|---|---|
| Keep vermilion `#C81E1E` as the only accent | It is the existing FC mark and gives one unmistakable decision colour; used on the primary action and active state only. |
| Warm-neutral surfaces (`--bg`, `--panel`) instead of stark paper/ink contrast | Removes the newsprint "template" feel and gives cards a quiet base so the accent can do the work. |
| 12px card radius, 8px control radius, one scale | A single radius scale reads as a system; mixed radii read as assembled from parts. |
| `border: 1px var(--border-subtle)` plus a faint tinted shadow on raised surfaces only | Elevation communicates "this is a distinct object"; a shadow on every element makes the page float. |
| Anton reserved for the logo mark and the single hero headline | Its condensed display voice carries the brand; using it on every H2/H3 was the main source of noise. |
| Inter for all UI and body copy | Neutral and legible at small sizes; chosen for readability, not as a default. |
| JetBrains Mono only for data labels, counts and codes | Monospace signals "this is a value", not "this is a section heading". |
| Sentence case for labels and buttons | All-caps with wide tracking on every section made the page shout; case now carries hierarchy. |
| Header 68px desktop, single row, logo / nav / actions | A single stable row is easier to scan than a double rule and dense link cluster. |
| Mobile header: logo + Menu button opening a sheet | Removes the cramped row of hidden links; keeps one primary action visible. |
| One primary action per screen; secondary actions outlined or text | A single decision point reduces hesitation on a trust-first product. |
| Toasts for transient feedback only, with an ARIA live region | Confirms an action without navigating away; errors that block a task stay inline. |
| Real DB data only; no counts, badges, scarcity or timestamps invented | C-5 and the product's honest-board promise. |
| One Tailwind v4 token system | A single token set replaces appearance presets; there is no per-user theme state. |

## What was removed from the landing screen and why

- The Wire marquee: moving text repeated the same message with no new information.
- The KPI/ticker strip: numbers compete with the board and were decorative.
- The "FIG. 2" pipeline and the comparison block: process explanation belongs on `/learn` and `/about`.
- A second call to action in the hero: two competing actions on the first screen.
- Eyebrow labels above most sections: the section position already categorises it.

## Component rules

- **Card**: used only when the content is a distinct object (a match, a roster, a settings group). Flat lists use dividers.
- **Button**: `.btn-primary` solid accent, `.btn-secondary` outlined, `.btn-quiet` text only. 44px minimum height, 8px radius, real hover/active/disabled/loading states. Labels describe the exact action, max three words, one line.
- **Toast**: success / error / info. Bottom-right on desktop, bottom-centre on mobile. Auto-dismiss 4s, manually dismissible, `role="status"` with `aria-live="polite"`.
- **State**: every data view has empty, loading and error presentations. The empty board says so honestly.
- **Focus**: 2px accent outline with 2px offset on every interactive element, never removed.
- **Reduced motion**: all non-essential motion disabled by both media query and the `data-motion="reduced"` preset.
