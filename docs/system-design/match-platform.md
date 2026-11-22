# Match Platform: System Design

This document argues the design from established principles and resolves the hard parts (concurrency, idempotency, scaling, privacy) rather than leaving them to luck. Product truth is in `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`. Legal background is research, not legal advice. External legal review was not performed for this release; see `docs/handoff-launch.md` → Legal review decision.

## 1. Problem

A free notice board for Free Fire matches in India. **Hosts** post matches, **players** join them, **sponsors** discover opted-in players. The platform must be correct under concurrency, cheap to run (free tiers), and honest with data. It must not need an operator, and no money passes through it.

## 2. Requirements

**Functional:** post a free match; list and filter matches; join and leave; host roster (display name, UID, self-declared BR and CS ranks, optional team name); weekly series with a self-serve ladder; sponsor enquiries by email; report with a category and an automatic consequence.

**Non-functional:** correct under concurrent joins; no duplicate joins; no oversold slots; responsive board; no PII leakage; no human approval queue; survives a single DB (no distributed consistency tricks).

## 3. Principles applied (and where)

| Principle | Source | Application |
|---|---|---|
| Make the database the source of truth; constraints beat app checks | Kleppmann, *Designing Data-Intensive Applications* | `@@unique` on joins; FK + cascade; status guards in the same transaction |
| Normalize for writes, denormalize only when reads demand it | DDIA / Codd's 3NF | `MatchEntry` is a proper junction table; no duplicated roster data |
| Idempotency at the storage layer | DDIA (unique constraints as consensus) | One join per (match, player); one report per (match, reporter) |
| Use the weakest isolation that is still correct | DDIA (transaction isolation) | Serializable for the join transaction; read-committed elsewhere |
| Back-of-envelope first, scale only when measured | Alex Xu, *System Design Interview* | Tiny scale → one Postgres, no cache layer yet |
| Least privilege | Saltzer & Schroeder | RBAC catalogue; sponsors see only opted-in fields; host sees own roster only |
| Privacy by design | DPDP principles | Opt-in sponsor visibility; collect only what a flow needs; no payment data at all |
| Fail closed | None | Missing session or permission redirects; validation server-side |

## 4. Capacity (honest)

Early product: hundreds of matches, thousands of users. One Postgres primary (Neon free) and one Node process (Vercel) are far more than enough. **No caching layer, no queue, no read replica yet**: adding them now is premature. The design keeps the seams (indexed queries, cursor pagination, idempotent writes) so those can be added without rework.

## 5. Data model

- **`Match`**: the posting. Taxonomy as `String` enums-in-code (`mode`, `gameType`, `entry`, `prize`, `status`), parsed from `src/config/match.json` by zod. `src/features/disclosure/copy.ts` stamps `entry: 'free'`, `entryFee: null`, `prize: 'none'`, `prizePool: null` on every new write. The legacy money columns stay for history and are never used for display. Strings over lookup tables: the sets are small, stable, and validated in code.
- **`MatchEntry`**: junction table for the M:N between `Match` and `User`. Optional `teamName` is stored per join for competitive and esports modes.
- **`Report`**: junction with a `category` and a `reason`; unique per (match, reporter) so one player cannot spam reports.
- **`MatchSeries`**: weekly template with recurrence and lifecycle fields. Occurrences are materialized as `Match` rows with the same free-entry terms.
- **`User`**: `player`, `sponsor` and `admin` types. `postingPausedUntil` carries the automatic consequence. `visibleToSponsors` gates sponsor discovery.
- **`AuditLog`**: record of write and safety events, including report consequences.
- **Indexes**: match board: `@@index([status, date])`; joins: `@@unique([matchId, playerId])`; reports: `@@unique([matchId, reporterId])`; `User.email` unique; `RateLimitEntry @@index([key, createdAt])`.
- **Why not a `slots` counter cache?** It must be decremented atomically with the join (see §6). A naive `slots - 1` read-modify-write is a lost-update bug.

## 6. Concurrency: the hard part

Three races, three principled fixes.

**(a) Double join.** App-level "check then insert" is a classic race (both requests pass the check). Fix: the database unique constraint is the gate; the insert catches `P2002` and returns a friendly "already on the roster". This is idempotency at the storage layer, no locks, no read-then-write.

**(b) Slot oversell.** If `slots` is set, the join must decrement and the entry must insert atomically. Use one transaction with an atomic conditional update:

```ts
await prisma.$transaction(async (tx) => {
  // Atomic: only succeeds while a slot remains. No read-modify-write.
  const freed = await tx.match.updateMany({
    where: { id: matchId, status: 'open', slots: { gt: 0 } },
    data: { slots: { decrement: 1 } },
  });
  if (freed.count === 0) throw new MatchFullOrClosed();
  await tx.matchEntry.create({ data: { matchId, playerId } });
}, { isolationLevel: 'Serializable' });
```

`updateMany` compiles to a single `UPDATE ... WHERE slots > 0`; the database serializes concurrent executions, so two players can never take the last slot. Leaving restores the slot in its own transaction.

**(c) Close vs join.** A match can be closed while a join is in flight, including when the report consequence fires. The join transaction re-checks `status: 'open'` in the same atomic `updateMany` (above), so a closed match can never accept the insert. Serializable isolation + retrying on `P2034` (serialization failure) closes the remaining window; the retry is cheap and rare at this scale.

**(d) No slot cap (`slots = null`).** The same transaction minus the decrement. `updateMany` matches only `status: 'open'`.

## 7. API and idempotency

- Actions are the write API (server actions); routes are the read API. Both validate with zod and authorize with `hasPermission`.
- Every write is idempotent or explicitly non-idempotent-with-guard: joins and reports are unique-constrained; posting is rate-limited per user; closing is a state set (naturally idempotent).
- Match and series actions cannot accept a fee, a prize or a payment field. Free-entry terms come from `src/features/disclosure/copy.ts`.
- **Pagination:** the board is cursor-paginated on `(date, id)`, stable under inserts, unlike `OFFSET` (which skips or duplicates when a new match is posted mid-scroll).
- **Filtering** is by indexed columns only (status, date, city, mode, gameType).

## 8. Abuse and rate limiting

- Per-user token bucket via the existing `RateLimitEntry` limiter: post, join, export and report are all limited.
- Reports are first-class rows, not fire-and-forget. They carry a category and feed an automatic consequence, not a review queue.
- Two `payment_request` reports from players who joined close the match, pause the host's posting for exactly seven days from server time, and write an audit entry. No human reviews first.
- Weekly-series trust is derived from real rows: three hosted matches, two distinct non-host joiners each, a cap of two active series, and an automatic pause after two zero-join occurrences.
- Closed matches are excluded from all public reads by default.

## 9. Scaling path (when measured, not before)

1. Read replica for `/matches` (read-heavy, slightly stale is fine).
2. CDN/cache for static assets and the board's first page (cache key = filter set).
3. Connection pooling via Neon's pooler (already the default).
4. Then: full-text search and match recommendations. Not now.

## 10. Security and privacy

- **Authentication:** opaque database-backed session cookie (random token, SHA-256 hash in `Session`, row deletion revokes), httpOnly, sameSite lax, secure in prod.
- **Authorization:** catalogue-first RBAC; every action re-checks, never trusts the client. There is no verifier, moderator or organizer role.
- **IDOR:** roster and posting management are scoped by the session user; sponsors can only read opted-in players.
- **PII:** no email address appears on a listing or in the sponsor export. Sponsor data is display name, UID, self-declared BR and CS ranks, role and city. No payment data exists anywhere in the system.
- **Injection:** Prisma parameterizes everything; CSV export escapes formula-leading cells (`= + - @`) and quotes (existing `csvCell` pattern).
- **Integrity:** zod on every input; no raw user strings into SQL.
- **Display:** public views render the fixed free-entry wording. Historical legacy money values are never rendered.

## 11. Trade-offs

| Decision | Trade-off | Why here |
|---|---|---|
| One Postgres, no cache | Reads repeat queries | Scale is tiny; correctness and simplicity win |
| Serializable joins | Slight contention, retry on conflict | Oversell and duplicate joins are user-visible bugs; the cost is negligible at this scale |
| Taxonomy as strings | No DB-level enum | Validated in code; avoids lookup-table joins |
| No email on roster | Hosts coordinate outside the board | The board carries the match and roster fields, not contact data |
| Automatic report consequence | Reports carry real weight without human review | Fast protection for players; the audit log is the only record |
| Free-entry constants at write and display | Legacy columns remain in the schema | Additive-only migration on the shared database; history is not rewritten |

## 12. Resolutions to the open questions

1. **Roster visibility** → host only (least privilege).
2. **Player contact** → no email shared by the board. Sponsors see only opted-in profile fields.
3. **Moderation** → categorized report with an automatic consequence and audit entry, no review queue.
4. **Who posts** → any registered player (one account, both actions; no separate organizer role).
5. **Slots** → optional; enforced atomically, never oversold.
6. **Money** → none. All listings are free entry, and Final Circle never holds or moves funds.
