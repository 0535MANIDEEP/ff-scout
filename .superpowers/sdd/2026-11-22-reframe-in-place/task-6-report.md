# Task 6 report: Tailwind v4 conversion of public routes

Branch: `ui-ux-audit-fixes`. Starting HEAD: `ff32c5c`. Three sequential slices, one commit each.

## Commits

| Slice | SHA | Subject |
| --- | --- | --- |
| 6a shared shell and animated components | `e21ffda` | `style: convert shared shell components to Tailwind v4` |
| 6b landing and legal routes | `5f49c7f` | `style: convert landing and legal routes to Tailwind v4` |
| 6c match board routes | `7038b9b` | `style: convert match board routes to Tailwind v4` |

Each commit used an explicit `git add` path list. `next-env.d.ts` and `src/components/ToastProvider.tsx` were never staged. Final `git status --short` shows only the untracked owner file `src/components/ToastProvider.tsx`.

## Verification greps

Patterns were run with `Select-String` against each slice's file list, plus a token-level scan of quoted class strings against every selector in `legacy-globals.css`.

- Global class tokens: no matches in 6a, 6b, or 6c. The token scan reported only the `fig2` element id on `/` and the ordinary English words `card` and `small` inside FAQ copy.
- `var\(--(accent|panel|muted|danger|risk|text|line)\)`: no matches in any slice.
- Static inline styles: no `style={{` tokens were introduced in the 6a/6b/6c converted files. Four genuinely dynamic styles remain untouched by the conversion: `Reveal` transition delay (`Reveal.tsx:40`), `RoleAvatar` size (`RoleAvatar.tsx:29`), `ZoneShrink` Web Animations keyframes (`ZoneShrink.tsx:36-48`), and the marquee duration. Static inline styles remain only in legacy routes outside Task 6 scope.
- `@apply`, `@layer`, `fig2-steps`, `ticker-item`, `data-theme`, `data-preset`, `data-density`, `data-motion`: no matches.
- `@/lib/free-entry`: no matches in the 14 converted files. Import paths now point to `@/features/disclosure/copy`; `src/lib/free-entry.ts` was left in place.
- Em dash (`—`): no NEW dash was introduced by 6a/6b/6c. Pre-existing em dashes remain untouched in `src/components/BackToTop.tsx:6`, `src/components/RoleAvatar.tsx:5`, `src/app/player/page.tsx:38`, and `src/app/player/posted/page.tsx:132` (the last two are outside Task 6 scope).

Copy was checked with `git diff --word-diff=plain` on every converted file. Text, metadata, filter labels, report categories, error strings, and empty-state wording are unchanged. `GLOBAL_DISCLOSURE` and `FREE_ENTRY_NOTICE` are imported, never retyped. No new statistics, testimonials, claims, or dependencies were added.

## Gates

Run separately per slice, in order, stopping on failure. The no-DB test command removed `DATABASE_URL` before running. The scratch Postgres URL was used only for schema sync and the dev server, never for `npm test`.

| Slice | `npm test` | `npm run lint` | `npm run typecheck` | `npm run build` |
| --- | --- | --- | --- | --- |
| 6a `e21ffda` | 41 tests, 37 pass, 0 fail, 4 DB-gated skips | clean (`tsc --noEmit`) | clean (`tsc --noEmit`) | success, Next.js 16.4.6 Turbopack, 23 routes |
| 6b `5f49c7f` | 41 tests, 37 pass, 0 fail, 4 DB-gated skips | clean (`tsc --noEmit`) | clean (`tsc --noEmit`) | success, Next.js 16.4.6 Turbopack, 23 routes |
| 6c `7038b9b` | 41 tests, 37 pass, 0 fail, 4 DB-gated skips | clean (`tsc --noEmit`) | clean (`tsc --noEmit`) | success, Next.js 16.4.6 Turbopack, 23 routes |

Schema check for the dev server: `npx prisma db push --skip-generate` reported "The database is already in sync with the Prisma schema."

## Real Chrome pass

Dev server started with `DATABASE_URL=postgresql://postgres@127.0.0.1:5432/finalcircle_scratch`. A real Chrome tab was opened through the browse relay, emulated at 375x812, 768x1024, and 1440x900, and navigated to all five routes at each width. Measurements came from `document.documentElement.scrollWidth`, `document.body.scrollWidth`, `window.innerWidth`, a footer text check for the exact disclosure, `document.querySelectorAll('h1')`, `getComputedStyle(document.activeElement).outline`, and console capture.

Legend: PASS means no horizontal overflow, exact disclosure present in the footer, one `h1`, and a visible vermilion focus outline on every Tab stop. Per-row landmark evidence was not recorded, so no landmark claim is made. The console column records a pre-existing dev-only exception, not a clean PASS: every route logs the CSP `eval()` message described below.

| Route | Viewport | Overflow | Focus outline | Disclosure in footer | Console | Empty board |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 375 | PASS (`innerWidth 375`, scrollWidth 360) | PASS (skip link, logo, Menu button, hero links; 2px vermilion) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/matches` | 375 | PASS (375 / 360) | PASS (skip link, logo, Menu button, post link) | PASS | 1 dev-only React `eval()` CSP message | PASS, honest empty state shown |
| `/safety` | 375 | PASS (375 / 360) | PASS (skip link, logo, Menu button, research links) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/advertise` | 375 | PASS (375 / 360) | PASS (skip link, logo, Menu button, safety link) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/login` | 375 | PASS (375 / 375) | PASS (skip link, logo, Menu button, first input) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/` | 768 | PASS (768 / 753) | PASS (skip link, logo, Menu button, header links) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/matches` | 768 | PASS (768 / 768) | PASS (skip link, logo, Menu button, post link) | PASS | 1 dev-only React `eval()` CSP message | PASS, honest empty state shown |
| `/safety` | 768 | PASS (768 / 753) | PASS (skip link, logo, Menu button, research links) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/advertise` | 768 | PASS (768 / 753) | PASS (skip link, logo, Menu button, mailto link) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/login` | 768 | PASS (768 / 768) | PASS (skip link, logo, Menu button, first two inputs) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/` | 1440 | PASS (1440 / 1425) | PASS (skip link, logo, Matches, Learn, About) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/matches` | 1440 | PASS (1440 / 1440) | PASS (skip link, logo, Matches, Learn, About) | PASS | 1 dev-only React `eval()` CSP message | PASS, honest empty state shown |
| `/safety` | 1440 | PASS (1440 / 1425) | PASS (skip link, logo, Matches, Learn, About) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/advertise` | 1440 | PASS (1440 / 1425) | PASS (skip link, logo, Matches, Learn, About) | PASS | 1 dev-only React `eval()` CSP message | n/a |
| `/login` | 1440 | PASS (1440 / 1440) | PASS (skip link, logo, Matches, Learn, About) | PASS | 1 dev-only React `eval()` CSP message | n/a |

Additional interaction checks:

- Mobile menu: at 375 and 768 the Menu button is 44px tall and opens a `dialog` named "Site menu" with Matches, Learn, About, FAQ, Post a match, and Log in. Tabbing through those sheet links showed a visible outline on every stop.
- Tap targets: at 375 on `/matches`, both filter selects, the city input, and the Filter button each measured 44px high. The Menu button measured 44px high. Hidden desktop nav links measured 0px because `display: none` is correct at that width.
- Reduced motion: with `prefers-reduced-motion: reduce` emulated, `html` computed `scroll-behavior: auto` and a sampled transition duration collapsed to `1e-05s`.
- Console detail: each route logged one React development message, "eval() is not supported in this environment. If this page was served with a `Content-Security-Policy` header, make sure that `unsafe-eval` is included. React will never use eval() in production mode", pointing at a Next dev chunk. This is a PRE-EXISTING, dev-only exception, NOT a Task 6 regression and NOT a clean PASS: `next.config.mjs:7` sets the CSP without `unsafe-eval`, and `next.config.mjs` was not touched by Task 6. No CSS, route, or runtime error was logged. No production credentials were used and no account form was submitted.
- The board rendered its honest empty state at all three widths. No match detail route was opened because the scratch board has no rows.

The browser tab opened for this pass was closed afterward. The dev server was stopped after verification.

## Review fixes

Independent review against `legacy-globals.css` and `next.config.mjs` found five faithful-port defects. The controller confirmed all findings; no other styling, copy, metadata, links, or structure was changed.

1. `src/app/layout.tsx:69` — added `mt-16` to the footer to restore `.footnote { margin-top: var(--space-8) }` (64px).
2. `src/app/loadout/page.tsx:18,28,35` — removed `p-6` from the shared `CARD` constant and applied padding at each call site: `p-6` on the disclosure card, `p-4` on the gear card. Fixes Tailwind emitting `.p-6` after `.p-4`, which rendered gear cards at 24px instead of 16px. No `!p-4` used.
3. `src/app/components/Hero.tsx:46` — changed `last:border-b-0` to `last-of-type:border-b-0` so the rule matches the last HUD row rather than the always-last `<figcaption>`.
4. `src/app/page.tsx:84-90` — removed `last:border-b-0` from all nine `<td>` classes and moved the rule to `[&>tbody>tr:last-child>td]:border-b-0` on the `<table>`, matching `.roles-table tr:last-child td`.
5. `src/app/page.tsx:113` — removed `mt-3` from the final legal `<p>`, restoring `.subtext` spacing.

Focused `Select-String` verification: no `last:border-b-0` remains in `Hero.tsx` or `page.tsx`; `last-of-type:border-b-0` present in `Hero.tsx`; table last-row rule present on `<table>`; footer `mt-16` present; `CARD` padding-free with `p-6` at the disclosure card and `p-4` at the gear card; no `mt-3` on the legal paragraph. Cleared as correct and left unchanged: 404 subtext `text-lg` (legacy inline `fontSize: 18` outranked the 600px override) and KV `last:border-b-0` (matches legacy `.kv:last-child`).

Gates re-run after the fixes, separately:
- `Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test`: 41 tests, 37 pass, 0 fail, 4 DB-gated skips.
- `npm run lint`: clean (`tsc --noEmit`).
- `npm run typecheck`: clean (`tsc --noEmit`).
- `npm run build`: success, Next.js 16.4.6 Turbopack, 23 routes.

Fix commit: `1a945ac` — `fix: restore shipped spacing and border rules in Tailwind port`.
