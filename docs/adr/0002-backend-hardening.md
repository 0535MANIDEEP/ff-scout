# ADR 0002 — Backend hardening pass (2026-11-19)

Context: FF Scout's backend is Next.js server actions + Prisma + JWT session cookies, SQLite in dev, Postgres targeted for prod (Neon). A pre-launch audit surfaced flaws that matter more than any new feature.

## Decisions

1. **`SESSION_SECRET` fails fast in production.** Signing/verifying with the in-source development key in prod would let anyone forge an admin session. `getSecret()` in `src/lib/auth.ts` throws on first use in production; `next build` is unaffected (lazy, not import-time).
2. **One definition of the session cookie.** `SESSION_COOKIE_NAME` / `SESSION_COOKIE_OPTIONS` in `src/lib/auth.ts` — httpOnly, `sameSite: 'lax'`, `secure` in production only (local dev is http), 7-day expiry. Three call sites were updated; GET sites use the same constant.
3. **Sign-up race closed.** `findUnique → create` is not a guarantee. Both register actions catch Prisma `P2002` and return the friendly duplicate-entry error instead of a 500.
4. **Upload pipeline capped.** Proof uploads: 5MB max, `image/png|jpeg|webp` allowlist (no SVG — admin renders these), raster-only, `accept` attribute mirrors the server allowlist, failures redirect with a query code the page renders.
5. **Admin review is one transaction.** Proof flip + player `verified` flip + audit entry commit or roll back together. Approve and reject both write `auditLog`.
6. **CSV export is safe to open in Excel.** Cells are quote-escaped, and values starting with `= + - @` are prefixed with `'` (formula injection). The row/header mismatch (missing `status`) is fixed. Downloads are audit-logged and the query selects only needed columns — `passwordHash` never leaves the DB on this path.
7. **Line endings normalized** via `.gitattributes` (LF for text, binary for images/db) to stop the recurring false "binary file" merge conflicts on `globals.css`.

## Explicitly deferred (needs real infrastructure, not code cleverness)

- **Versioned migrations.** `prisma db push` is dev-only. Prod needs `prisma migrate deploy` against Neon Postgres with committed migration files. Do this when DATABASE_URL is provisioned.
- **Blob storage for proof screenshots.** `VerificationProof.fileData` stores base64 data URIs in the row. Fine at dev scale; prod should store a Vercel Blob key and keep only metadata. Requires `BLOB_READ_WRITE_TOKEN` + schema migration — same migration event as above.
- **Atomic rate limiting.** Current limiter is correct under refusal-on-error but is three round-trips (count → maybe create) and keyed on email only. Prod should use an upsert-based fixed window, keyed `email + IP`.
- **Session revocation.** JWT sessions are stateless; a 7-day token is a 7-day token. If a breach occurs, rotate `SESSION_SECRET` (mass logout) until an opaque-token + session table exists.
- **Payments.** Still ₹499-on-honor. No Razorpay until a pilot organizer commits — see ADR 0001.
- **Rate-limit storage pruning.** `RateLimitEntry` rows are only deleted per-key on window expiry. A periodic prune job lands with the cron/maintenance phase.
