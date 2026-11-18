# Security review — 2026-11-19 (vibe-check + ADR 0002 follow-ups)

External black-box scan (benavlabs/vibe-check, MIT, read-only, 64 requests) against production `https://ff-scout.vercel.app`, plus repo-side review of auth/data paths. Scanner output archived at `C:\Users\manid\AppData\Local\Temp\opencode\vibe-check-report.txt` (rerun: `python3 skills/vibe-check/scripts/check.py <url>`).

## Scan results and fixes

| Finding | Severity | Resolution |
|---|---|---|
| CSP missing | FAIL | **Fixed** — enforced baseline in `next.config.mjs`: `default-src 'self'; script-src 'self' 'unsafe-inline' (required by RSC inline payload; nonce migration is the proper follow-up); object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` |
| Clickjacking (no XFO/frame-ancestors) | FAIL | **Fixed** — `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| `X-Content-Type-Options` missing | FAIL | **Fixed** — `nosniff` |
| HSTS missing | FAIL | **Fixed** — `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` missing | WARN | **Fixed** — `strict-origin-when-cross-origin` |
| `Permissions-Policy` allowed `browsing-topics` (console warning) | WARN | **Fixed** — explicit `camera=(), microphone=(), geolocation=()` |
| Secrets (.env/.git/dumps/keys) | PASS | No fix needed |
| Source maps | not checked by scanner; manual check — `/.map` URL returns 403/404 | Next default `productionBrowserSourceMaps: false` confirmed adequate |
| CORS (page + API) | PASS | No fix needed |
| Error pages / debug endpoints / version headers | PASS | No fix needed |

## Repo-side review (already in place)

- AuthN/AuthZ server-side only (`verifySession` per action/route); admin role set from DB only.
- bcrypt cost 10; sessions httpOnly/lax/Secure-in-prod; JWT 7d; rotation = mass logout (documented).
- `SESSION_SECRET` fail-fast in prod (ADR 0002).
- Input validation zod everywhere; uploads capped (5 MB, raster allowlist).
- Rate limits fail-closed; audit logs on admin + auth events; CSV formula-injection neutralized.
- Signup race closed (P2002). Transactions for multi-write flows.

## Honest limitations / deferred

1. **No nonce-based CSP.** `'unsafe-inline'` in `script-src` is a stopgap; XSS still relies on React's escaping. Next nonce plumbing is the real fix.
2. **No IDOR test executed** — needs two prod accounts (player A, player B) to attempt cross-access on `/player`, `/organizer/*`. Blocked until prod DB (Neon) exists; schedule with the pilot.
3. **Rate limiter is email-keyed**, not IP-keyed — distributed brute force from rotating IPs evades it. Upsert-atomic, IP-keyed version is deferred (ADR 0002).
4. **403 WAF incident, self-inflicted.** During this review, ~80 requests/2 min from one IP (scanner + 9 curls) tripped Vercel's edge protection → all paths 403 for ~minutes. Not a vulnerability, but a reminder: batch scans belong in staging or with throttling, and Vercel WAF must be tuned before launch.
5. **SQLi** — none found: every query goes through Prisma (parameterized). No raw `$queryRaw` in repo (verify with grep in CI as a guard).
6. **Slopsquatting** — dependency risk review: direct deps were audited for the CVE pass (zod). Add `npm audit --omit=dev` to CI cadence (free).
7. **Upgrade the manual checklist** (accounts-based tests, webhook signature verification when Razorpay lands) once prod DB exists.

## Re-verification

Re-run vibe-check after the header deploy; expect the 4 FAILs and 1 WARN to go green. HSTS/warnings on static assets should also pass via the same `headers()` block.
