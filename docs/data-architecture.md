# Final Circle — Data Architecture

Status: live design, 2026-11-19. Applies to the deployed app (`ff-scout.vercel.app`) and dev (`file:./dev.db`). Supersedes nothing; extends ADR 0001 (recruiter-first) and ADR 0002 (backend hardening).

**This is an engineering document, not legal advice.** DPDP sections below are working notes for implementation and for a review by an Indian-qualified advocate. Do not treat this file as a compliance certificate.

---

## 1. Requirements digest (from `SPEC.md`)

- Two-sided marketplace: **verified** Free Fire player pool (verified by admin eye on rank screenshot), searchable by Indian organizers.
- Organizers pay ₹499/event to unlock shortlist export (+, per SPEC, contact). Guilds ₹1999/yr. Sponsor activations ₹15,000.
- v1 screens: player sign-up, organizer sign-up, verification queue, organizer shortlist. No payments until a pilot commits (ADR 0001).
- SPEC's "The one-line result" paragraph (55 minutes, ₹15,000 TechStyle) reads as already-achieved. Either mark it as the target narrative or remove it — it must not leak into marketing copy as a real result. Same rule as anywhere else in the repo.

---

## 2. Data inventory — what we collect, from whom, why

| # | Data | Source screen | Stored in | Purpose (SPEC) | Retention | Who can see it |
|---|------|---------------|-----------|----------------|-----------|----------------|
| 1 | email | /sign-up, /organizer/sign-up | `User.email` (unique) | login, uniqueness gate | account life + 30d erasure grace | user, admin |
| 2 | passwordHash | /sign-up | `User.passwordHash` (bcrypt, cost 10) | authentication | same | **nobody** (never selected into a view/CSV) |
| 3 | displayName (IGN) | /sign-up | `User.displayName` | identify player on roster | same | organizers (unlocked export), admin |
| 4 | role, rank | /sign-up | `User.role`, `User.rank` | role/rank matching | same | organizers, admin |
| 5 | college / orgName, orgType, city | /sign-up, /organizer/sign-up | `User.college`, `User.orgName`, `User.orgType`, `User.city` | affiliation signal + location filter | same | organizers (export), admin |
| 6 | rank screenshot (base64 today; Blob key in v2) | /verify | `VerificationProof.fileData` | **verification only** | 30 days after admin decision, then delete row | **admin only** |
| 7 | waitlist email, segment, city | / (waitlist) | `WaitlistEntry` | launch notification, city demand | until launch + 90 days | admin |
| 8 | audit events | internal writes | `AuditLog` | abuse prevention, dispute resolution | 90 days, then purge | admin |
| 9 | rate-limit keys | internal writes | `RateLimitEntry` | brute-force protection | window expiry (15m–1h), pruned on insert | nobody (ephemeral) |
| 10 | session JWT | login/sign-up | httpOnly cookie `ffscout_session` (7d) | auth | 7 days | user's own browser |
| 11 | Match rows | unused in v1 | `Match` | reserved for hire flow | — | — |

**Not collected:** phone number, UPI/payment data, location at rest, device/IP identifiers, analytics beyond hosting defaults, chat content. (Rate limiter is keyed on email — adding IP is planned and must be documented here when it lands.)

**Consent is not recorded.** Sign-up has a checkbox but the backend never stores it. That is a DPDP gap, not a detail — see §8.

---

## 3. Where data lives, today → target

| Layer | Today (dev/prod) | Target (v2) |
|-------|------------------|-------------|
| Primary store | SQLite `dev.db` (dev, gitignored) / **nothing in prod — signups fail** | **Neon Postgres**, AWS `ap-south-1` (Mumbai) if offered on your plan, else nearest India region |
| Proof images | base64 `data:` URIs in row (`VerificationProof.fileData`) | **Vercel Blob** object key; row keeps `fileKey`, `mimeType`, `sizeBytes` |
| Session | stateless JWT (jose, HS256) | unchanged — but rotated on breach |
| Audit | `AuditLog` table | same + weekly CSV export to offline store (manual) |
| Backups | none (dev file only) | Neon managed backups + monthly `pg_dump` into encrypted archive |
| Env secrets | `.env.local` gitignored; Vercel env: `SESSION_SECRET` ✅ set | + `DATABASE_URL` ✅ set via §10 item 1 |

**Why Postgres, not Mongo/Firebase/MySQL:** the data is relational with hard uniqueness (email), transactional invariants (approve = 3 writes in one tx), and reporting needs (`GROUP BY` rank/city for & cohort unlocks). Prisma abstracts SQLite↔Postgres; the schema stays identical except `provider = "postgresql"`.

**Why proofs move out of the row:** base64 inflates ~33%, bloats backups and WAL, and forces every admin query to carry megabytes. Blob keys keep rows ~1 KB; access control = unguessable pathnames + admin-only server action that mints the URL. There is no public listing; screens are not in any export.

---

## 4. Entity design — tables, keys, indexes, relations

```
User (1) ──< VerificationProof (N)      cascade: erasure deletes proofs
User (1) ──< Match (N)                  player match history
User (1) ──< Shortlist (N)              organizer owns shortlist attempts (NEW v2)
AuditLog (N) >── (0..1) User            userId optional
RateLimitEntry   standalone (pruned)
WaitlistEntry    standalone
```

`User` — current columns, with proposed deltas marked `(+)`:

| Column | Type | Notes |
|---|---|---|
| id | cuid PK | |
| email | unique | login identifier |
| passwordHash | bcrypt | never selected into views |
| displayName | string | IGN shown on roster |
| userType | enum player/organizer/admin | |
| role | enum rusher/sniper/support/anchor/lurker | nullable (organizers); IGL is a `iglCapable` flag, not a role |
| rank | string → **enum (+)** | Bronze, Silver, Gold, Platinum, Diamond, Heroic, Elite Master, Grandmaster |
| college | nullable | affiliation; organizers see this |
| city | default India | |
| status | string → enum(+) looking/playing/inactive | |
| orgName, orgType | nullable (organizers) | |
| verified | Boolean | set true only via admin transaction |
| shareContact `(+)` | Boolean default false | **gate for contact unlock in CSV** |
| consentedAt `(+)` | DateTime | proof of notice+consent (DPDP) |
| ageConfirmed `(+)` | Boolean | 18+ gate evidence |
| createdAt, updatedAt | | |

Indexes to add `(+)`:
- `@@index([userType, verified, createdAt])` — shortlist page, CSV export, hero counts
- `VerificationProof @@index([status, createdAt])` — admin queue ordering
- `Shortlist organizerId` — organizer history

`VerificationProof`:

| Column | Type | Notes |
|---|---|---|
| id | cuid PK | |
| userId | FK → User | cascade delete |
| fileData → `fileKey (+)` | String | base64 today; Blob pathname v2 |
| fileName, mimeType | | mime allowlist enforced server-side |
| sizeBytes `(+)` | Int | cap 5 MB |
| status | pending/approved/rejected | enum(+) |
| createdAt / reviewedAt / reviewerId | | audit trail |

`Match` (unused v1, kept for the hire flow): playerId FK, orgId, accepted, paidAt.

**CSV export mapping** (organizer → file):

| CSV column | Source column | Rule |
|---|---|---|
| handle | displayName | csvCell escape, never raw |
| rank | rank | |
| role | role | |
| affiliation | college | |
| city | city | |
| status | status | |
| **contact `(+)`** | **contactEmail only if shareContact = true** | otherwise omitted entirely — DPDP purpose limitation |

No `passwordHash`, no `email` (unless opted in), no proof data, ever.

---

## 5. Where data goes — flows

1. **Signup** form → zod → bcrypt(10) → `User` (verified=false) → `SESSION_COOKIE` JWT → `AuditLog(signup)`. Nothing leaves the server except the Set-Cookie.
2. **Proof upload** file (≤5 MB, png/jpeg/webp) → row (pending) → admin `/admin/verify` → transaction `{proof approved, User.verified=true, AuditLog}` → player dashboard flips.
3. **Organizer export** session → `SELECT (specific cols) WHERE userType=player AND verified=true` → CSV (escaped; formula-injection neutralized; `cache-control: no-store`) → `AuditLog(shortlist_download, count)`.
4. **Waitlist** POST → schema → rate-limit (3/h) → `upsert` (idempotent by email) → 200/429. Emails never mailed until launch — capture only.
5. **Erasure request** (email to grievance contact) → delete `User` row; cascade removes proofs; `WaitlistEntry` deleted separately; `AuditLog.userId` set null. Target SLA 72h. Manual today; `/settings/delete` is v2.
6. **No third parties receive data in v1** (no analytics SDK, no ads, no CRM). Vercel (hosting, US) and Neon (DB, AWS) are processors, disclosed in the privacy notice.

---

## 6. Storage of images & links

- **Today:** `VerificationProof.fileData` holds a `data:image/png;base64,...` URI (cap 5 MB enforced server-side). Acceptable for dev and the <100-player phase.
- **V2 decision (with migration):** Blob object pathname `proofs/<random>/<uuid>.<ext>`; row stores `fileKey`, `sizeBytes`, `mimeType`. Admin page renders `<img>` from an unguessable signed-ish URL. Rejected files are deleted (not just flagged). Approved files: 30-day grace post-decision, then delete from Blob + row keep metadata flag `purged=true`.
- **OG/hero image** `/hero-gaming.jpg` is static public marketing asset, no PII — fine in `public/`.
- **In-flight rule:** no screenshot is ever written to the client, `localStorage`, or an export. Buffer → validate → store → discard.

---

## 7. DBMS operations & migration plan

```bash
# dev (current)
npx prisma db push            # throws away drift — NEVER on prod
# prod (v2)
npx prisma migrate dev --name init   # once, locally
# commit prisma/migrations/
npx prisma migrate deploy            # CI/Vercel build step, prod-safe
```

- `.env.local` `DATABASE_URL=file:./dev.db`; Vercel `DATABASE_URL=postgres://…neon.tech/…?sslmode=require`.
- Schema `provider = "postgresql"` in migration branch only; keep sqlite-compatible types (no `@db.` native types unless needed).
- Seed (`prisma/seed.js`) stays dev-only — prod seed is the pilot organizer's 15 players, loaded via a one-off script with admin creds, never committed with PII.
- Rollback plan: migration files are forward-only; restore = Neon PITR (short window, free tier) + redeploy previous tag (`v0.3.0` etc.). Document actual Neon retention on your plan — don't guess.

---

## 8. DPDP Act 2023 — engineering map (not legal advice)

DPDP treats Final Circle as a **Data Fiduciary**; users are **Data Principals**; Vercel/Neon are **Data Processors**. Obligations and where they land:

| Obligation | Status today | Action |
|---|---|---|
| **Itemized notice** (purpose, data, rights, grievance contact) before/at collection | ❌ missing — signup has only the checkbox, vague copy | Rewrite signup copy + link `/privacy`; record `consentedAt` + notice version |
| **Free, specific, informed, unambiguous consent** | ⚠️ checkbox exists, copy is not specific ("One rank screenshot — no fakes" is a rule, not consent) | Copy: "I agree to the Privacy Notice and to my IGN, affiliation and rank screenshot being shared with organizers who unlock an event; I can erase everything by emailing the grievance officer." |
| **Children (<18)**: verifiable parental consent; no tracking/profiling/targeted ads | ❌ absent — FF audience skews to 16–24 | **18+ gate**: checkbox "I am 18 or older" + `ageConfirmed`. Under-18 excluded until a parental-consent flow exists. No behavioral profiling (we have none — keep it that way) |
| **Purpose limitation** | ✅ shortlist/CSV usage matches stated purpose | Keep sponsor cohorts described as ranges ("100+ verified rosters in India"), never person-level — privacy page already promises this; hold the line in code review |
| **Data minimization** | ⚠️ collects what it needs; `Match` unused | Prune unused tables at migration time, or justify each |
| **Storage limitation / retention** | ❌ no deletion ever happens | Retention table in `privacy` page + 30d proof purge cron + `AuditLog` 90d purge + account erasure cascade (test: create→erase→assert gone) |
| **Data Principal rights** (access, correction, erasure, grievance) | ⚠️ privacy page lists `admin@ffscout.dev` — **not a real mailbox** | Grievance Officer contact = `manideepdaram@gmail.com` (publish name + email + SLA 72h); access request → CSV of own row; correction → reply-based; erasure → cascade delete |
| **Breach notification** (Board + affected, per DPDP Rules, without delay) | ❌ no runbook | `docs/runbook-breach.md` stub: detect (audit anomaly), contain (rotate `SESSION_SECRET`, disable route), notify (email users + Board if personal data affected), record |
| **Significant Data Fiduciary?** | No — volume/sensitivity far below SDS triggers today | Reassess at 100k users or if handling sensitive/children's data at scale; record assessment yearly |
| **Consent Manager** | Not needed (self-collected consent, small scale) | Use only a Board-registered CM if/when required |
| **Processors under contract** | Vercel + Neon ToS/DPA (public DPAs) | Accept/file both DPAs; list them in privacy notice as processors with locations (US; AWS ap-south-1 if Neon India region used) |
| **Lawful transfer outside India** | §16 negative-list model — US transfer permitted today | No India blacklist exists yet; still prefer `ap-south-1`; re-check Rules periodically |
| **Strata/§43A IT Act + SPDI (passwords, PII in transit)** | ✅ bcrypt, TLS, httpOnly, no password logging | Neon `sslmode=require`; dev `dev.db` never committed (gitignored ✅); never log emails/passwords (audit logs store action + email — minimize: drop email from audit detail) |
| **Refund promise in terms** ("₹499 full refund until roster locks") | ✅ in landing copy | Mirror verbatim in `/terms` so the promise is contractual, not marketing-only |

**Penalty exposure if ignored:** Section 27(3)-style failures of obligations — fines reported up to **₹250 crore** per instance for certain violations, ₹50 crore for others. The ₹20 lakh nag-level exists for procedural lapses. Don't gamble the product on "nobody enforces small fries."

---

## 9. Access control model

| Role | Sees | Can do |
|---|---|---|
| visitor | landing, about, faq, terms, privacy | waitlist |
| player | own dashboard + proofs | upload proof, delete account (via mail) |
| organizer | verified pool (export fields, contact iff `shareContact`) | export CSV |
| admin | pending queue + full rows for review | approve/reject (transactional + audited) |

Enforcement is **server-side only** (`verifySession` in every action/route) — never client-hidden nav. No role is settable from any form.

---

## 10. Action checklist (owner → effort)

1. ~~Neon project + connection string → Vercel `DATABASE_URL`~~ **done 2026-11-19** — provisioned via Vercel Marketplace (`ff-scout-db`, free_v3, ap-southeast-1), connected to prod+preview
2. ~~`prisma migrate dev` + commit migrations~~ **done** — `20261118205620_init`
3. Blob: create store, wire `BLOB_READ_WRITE_TOKEN`, proof upload dual-write + backfill → **me** (next)
4. ~~18+ gate + `ageConfirmed` + consent copy rewrite + `consentedAt` recording~~ **done** — PR #16, `3a6aead`
5. ~~Privacy page: real grievance contact, DPDP rights named, retention table, processors, 18+ note; Terms: mirror refund promise~~ **done** — PR #16
6. `/api/me/export` (own data CSV) + erasure cascade runbook → **me** (before ₹499 goes public)
7. `docs/runbook-breach.md` stub → **me**
8. ~~`.env.example` rewrite~~ **done** — PR #16 follow-up (postgres template)
9. Rate limiter: email+IP key, atomic upsert; prune job → **me** (with migration)
10. shareContact column + CSV contact gating + `/organizer` onboarding copy → **me** (required before first ₹499 sale)
11. **Indian-advocate review of privacy/terms** → **Manideep** — do not skip
12. SPEC.md: mark the "55 minutes / TechStyle" line as target narrative → **Manideep (his call)**
13. Vercel region Mumbai (`bom1`) not offered for functions here — Neon serves `ap-southeast-1` (Singapore), the India-closest option available on free tier
14. ~~Set `ffscout.vercel.app` metadata domain~~ **done** — `ff-scout.vercel.app` everywhere (metadataBase, og, robots, sitemap, JSON-LD)
