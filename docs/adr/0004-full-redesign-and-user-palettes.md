# ADR 0004: Full redesign and user palettes (2026-11-22)

Context: the site had a coherent street-paper idea in CSS comments, but the implementation had drifted. The dark theme reused the light palette, public routes shared one canonical URL and one description, the first viewport carried seven font sizes, and the hero H1 extracted as "Post a match.Find your lobby." The user asked for a full redesign and for users to choose their own color palette options rather than only light and dark.

The installed design tools informed the audit. `omd:slop-audit` supplied the finding format and the rule that a single pattern is not a defect without product context. `ui-ux-pro-max` supplied contrast and density checks. Its first recommendation, purple 3D gaming, and its second, a generic red sports block layout, were rejected. They would make a trust-based match board look templated and would add rendering cost for Indian Android devices. No catalog reference was adopted. `DESIGN.md` is authored from this repo's own identity.

## Decisions

1. **Evolve the broadsheet, do not replace it.** Warm paper, ink, vermilion rules, condensed display type, and zero radius stay. The redesign fixes hierarchy, density, and theming around that identity.
2. **Four presets plus a custom accent.** Paper, Night, Slate, and Sand are the built in palettes. A user may override only the accent. A custom accent below 4.5:1 against the active background is rejected inline and never applied. This prevents a palette picker from producing unreadable screens.
3. **Density and motion are appearance controls.** Compact density changes spacing only, never font size. Motion follows the OS by default, with explicit reduced and full options.
4. **Appearance is per browser first.** One localStorage object named `fc-appearance` stores preset, accent, density, and motion. The old `ff-theme` value is migrated once. No Prisma field, no migration, and no environment variable are added in this phase. Account sync is deferred until the redesign is verified and users ask for it. The Slate border token was raised from `#475569` to `#94A3B8` after a contrast check showed the original at 2.36:1 against the Slate background, below the 3:1 non-text minimum.
5. **`DESIGN.md` is the source of truth.** It holds token tables, component contracts, copy rules, and anti-patterns. Component code reads tokens, never preset-specific hex values.
6. **SEO and copy are part of the redesign, not a later cleanup.** Each public route gets a unique title, description, and canonical path. Private routes get `noindex, nofollow`. The stale OG title is aligned with the current product line. Regex checks for links, metadata, and copy are part of sign-off.
7. **Implementation is atomic.** Phase 1 is this document and `DESIGN.md`. Later phases cover appearance layer, global shell, home, match routes, forms, content pages, and final verification. Each phase is reviewed before the next starts.

## Consequences

A preset change must require zero component edits. Any new component that hardcodes a color, invents a statistic, or adds a second filled button violates this decision and should be rejected in review. Custom accent validation adds a small runtime contrast calculation in the appearance layer. Local storage means a palette follows the browser, not the account.

## Deferred

- Account-level palette sync behind login.
- Persistent team or guild profiles. Team names remain per match entry and optional profile default.
- A full component library package. The redesign improves the existing local components in place.
- Refreshing stale route descriptions in `docs/codemap.md`. That belongs to the documentation pass after the UI work lands.
