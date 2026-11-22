# Security review — 2026-11-19 (vibe-check + ADR 0002 follow-ups)

Updated 2026-11-22 for the in-place reframe. Product truth is in `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`. Legal background is research, not legal advice. External legal review was not performed for this release; see `docs/handoff-launch.md` → Legal review decision.

Repo-side review of auth and data paths, plus local header and metadata checks on a build of this tree. No external scanner artifact or sign-off is shipped with the repository.

## Scan results and fixes

| Finding | Severity | Resolution |
|---|---|---|
| CSP missing | FAIL | **Fixed** — enforced baseline in `next.config.mjs`: `default-src 'self'; script-src 'self' 'unsafe-inline' (required by RSC inline payload; nonce migration is the proper follow-up); object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` |
| Clickjacking (no XFO/frame-ancestors) | FAIL | **Fixed** — `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| `X-Content-Type-Options` missing | FAIL | **Fixed** — `nosniff` |
| HSTS missing | FAIL | **Fixed** — `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` missing | WARN | **Fixed** — `strict-origin-when-cross-origin` |
| `Permissions-Policy` allowed `browsing-topics` (console warning) | WARN | **Fixed** — explicit `camera=(), microphone=(), geolocation=()` |
| Secrets | PASS for tracked files | Only `.env.example` is tracked. Local `.env.local` is untracked and must be checked before any share; remove obsolete keys from it. |
| Source maps | not checked by scanner; manual check — `/.map` URL returns 403/404 | Next default `productionBrowserSourceMaps: false` confirmed adequate |
| CORS (page + API) | PASS | No fix needed |
| Error pages / debug endpoints / version headers | PASS | No fix needed |

## Repo-side review (already in place)

- AuthN/AuthZ server-side only (`getCurrentUser()` as the per-action/route guard); admin role set from DB only.
- bcrypt cost 12; sessions httpOnly/lax/Secure-in-prod; opaque database-backed session cookie with a 7-day expiry, SHA-256 token hash stored in `Session`, revoked by setting `revokedAt` (the row is kept).
- Session cookies are database-backed; the old `SESSION_SECRET` signing-key advice in ADR 0002 is superseded by ADR 0006.
- Input validation zod everywhere. The old screenshot upload flow is gone, so there is no image upload surface to review.
- Rate limits fail-closed; audit logs on account and safety events. Audit details carry no email, and account erasure scrubs any older details that contain one.
- Signup race closed (P2002). Transactions for multi-write flows.
- Free-entry constants are applied on write and display (`src/features/disclosure/copy.ts`). Legacy money columns are not used by the app.
- Reports carry a category. Two `payment_request` reports from players who joined close the match, pause the host's posting for seven days from server time, and write an audit entry. No human reviews before the consequence and there is no appeal queue.
- No checkout, payment gateway, escrow or payout path exists. No money or payment data is collected.

## Honest limitations / deferred

1. **No nonce-based CSP.** `'unsafe-inline'` in `script-src` is a stopgap; XSS still relies on React's escaping. Next nonce plumbing is the real fix.
2. **No live two-account IDOR test executed.** Static regression tests cover the admin-only `match:moderate` gate and the roster email removal, but a two-account check on `/player`, `/player/posted`, `/matches/[id]` and `/admin/matches` is still outstanding.
3. **Rate limiter is email-keyed**, not IP-keyed — distributed brute force from rotating IPs evades it. Upsert-atomic, IP-keyed version is deferred (ADR 0002).
4. **403 WAF incident, self-inflicted.** During this review, ~80 requests/2 min from one IP (scanner + 9 curls) tripped Vercel's edge protection → all paths 403 for ~minutes. Not a vulnerability, but a reminder: batch scans belong in staging or with throttling, and Vercel WAF must be tuned before launch.
5. **SQLi** — none found: every query goes through Prisma (parameterized). No raw `$queryRaw` in repo (verify with grep in CI as a guard).
6. **Slopsquatting** — dependency risk review: direct deps were audited for the CVE pass (zod). Add `npm audit --omit=dev` to CI cadence (free).
7. **Upgrade the manual checklist.** Add account-based IDOR tests and a recheck of free-entry display and the report consequence after the free-entry reset.

## Re-verification

Before release, re-run lint, the no-database test command, build, and the header/metadata checks on a fresh build. Header fixes are in `next.config.mjs`; no external scan claim is made here.
