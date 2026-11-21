# Match Platform — System Design

Companion to `docs/superpowers/specs/2026-11-19-match-platform-design.md`. This document argues the design from established principles and resolves the hard parts (concurrency, idempotency, scaling, privacy) rather than leaving them to luck.

## 1. Problem

Two-sided marketplace: **posters** list matches, **players** join them, **sponsors** discover opted-in players. The platform must be correct under concurrency, cheap to run (free tiers), and honest with data. It must not need an operator.

## 2. Requirements

**Functional:** post a match; list/filter matches; join/leave; poster roster (name, UID, email, ranks); sponsor directory + CSV; admin close; player report.

**Non-functional:** correct under concurrent joins; no duplicate joins; no oversold slots; responsive board; no PII leakage; survives a single DB (no distributed consistency tricks).

## 3. Principles applied (and where)

| Principle | Source | Application |
|---|---|---|
| Make the database the source of truth; constraints beat app checks | Kleppmann, *Designing Data-Intensive Applications* | `@@unique` on joins; FK + cascade; status guards in the same transaction |
| Normalize for writes, denormalize only when reads demand it | DDIA / Codd's 3NF | `MatchEntry` is a proper junction table; no duplicated roster data |
| Idempotency at the storage layer | DDIA (unique constraints as consensus) | One join per (match, player); one report per (match, reporter) |
| Use the weakest isolation that is still correct | DDIA (transaction isolation) | Serializable for the join transaction; read-committed elsewhere |
| Back-of-envelope first, scale only when measured | Alex Xu, *System Design Interview* | Tiny scale → one Postgres, no cache layer yet |
| Least privilege | Saltzer & Schroeder | RBAC catalogue; sponsors see only opted-in; poster sees own roster only |
| Privacy by design | GDPR/DPDP art. 5, 25 | Opt-in consent; collect only what a flow needs |
| Fail closed | — | Missing session/permission redirects; validation server-side |

## 4. Capacity (honest)

Early product: hundreds of matches, thousands of users. One Postgres primary (Neon free) and one Node process (Vercel) are far more than enough. **No caching layer, no queue, no read replica yet** — adding them now is premature (YAGNI). The design below keeps the seams (indexed queries, cursor pagination, idempotent writes) so those can be added without rework.

## 5. Data model

- **`Match`** — the posting. Taxonomy as `String` enums-in-code (`mode`, `gameType`, `entry`, `prize`, `status`), parsed from `src/config/match.json` by zod. Strings over lookup tables: the sets are small, stable, and validated in code; a lookup table would add joins for no integrity gain (DDIA: normalize for the write path, but don't fragment what is read together).
- **`MatchEntry`** — junction table for the M:N between `Match` and `User`. This is 3NF-correct: the roster has no attributes of its own beyond `createdAt`, so it is exactly a relationship with a uniqueness rule.
- **`Report`** — junction with a `reason`; unique per (match, reporter) so one player can't spam reports.
- **Indexes** — match board: `@@index([status, date])`; joins: `@@unique([matchId, playerId])`; reports: `@@unique([matchId, reporterId])`; `User.email` unique; `RateLimitEntry @@index([key, createdAt])` (existing).
- **Why not a `slots` counter cache?** Because it must be decremented atomically with the join (see §6). A naive `slots - 1` read-modify-write is a lost-update bug.

## 6. Concurrency — the hard part

Three races, three principled fixes.

**(a) Double join.** App-level "check then insert" is a classic race (both requests pass the check). Fix: the database unique constraint is the gate; the insert catches `P2002` and returns a friendly "already on the roster". This is idempotency at the storage layer — no locks, no read-then-write.

**(b) Slot oversell.** If `slots` is set, the join must decrement and the entry must insert **atomically**. Use one transaction with an atomic conditional update:

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

**(c) Close vs join.** A match can be closed while a join is in flight. The join transaction re-checks `status: 'open'` in the same atomic `updateMany` (above), so a closed match can never accept the insert. Serializable isolation + retrying on `P2034` (serialization failure) closes the remaining window; the retry is cheap and rare at this scale.

**(d) No slot cap (`slots = null`).** The same transaction minus the decrement — `updateMany` matches only `status: 'open'`.

## 7. API and idempotency

- Actions are the write API (server actions); routes are the read API. Both validate with zod and authorize with `hasPermission`.
- Every write is idempotent or explicitly non-idempotent-with-guard: joins and reports are unique-constrained; posting is rate-limited per user; closing is a state set (naturally idempotent).
- **Pagination:** the board is cursor-paginated on `(date, id)` — stable under inserts, unlike `OFFSET` (which skips/duplicates when a new match is posted mid-scroll). Admin lists may use offset (small, operator-only).
- **Filtering** is by indexed columns only (status, date, city, mode, gameType).

## 8. Abuse and rate limiting

- Per-user token bucket via the existing `RateLimitEntry` limiter: post (5/15 min), join (10/min), export (10/hour), report (10/hour).
- Reports are first-class rows (not fire-and-forget), so an admin can see patterns; one per player per match prevents report spam.
- Closed matches are excluded from all public reads by default.

## 9. Scaling path (when measured, not before)

1. Read replica for `/matches` (read-heavy, slightly stale is fine).
2. CDN/cache for static assets and the board's first page (cache key = filter set).
3. Connection pooling via Neon's pooler (already the default).
4. Then: full-text search, match recommendations. Not now.

## 10. Security and privacy

- **Authentication:** session cookie (existing JWT), httpOnly, sameSite lax, secure in prod.
- **Authorization:** catalogue-first RBAC; every action re-checks, never trusts the client.
- **IDOR:** roster and posting management are scoped by `organizerId === session.userId`; sponsors can only read opted-in players.
- **PII:** player email is shown **only** to the match poster (needed for paid-entry coordination) and stated in the privacy policy; sponsors never get email. UID + ranks are game-public.
- **Injection:** Prisma parameterizes everything; CSV export escapes formula-leading cells (`= + - @`) and quotes (existing `csvCell` pattern).
- **Integrity:** zod on every input; no raw user strings into SQL.

## 11. Trade-offs

| Decision | Trade-off | Why here |
|---|---|---|
| One Postgres, no cache | Reads repeat queries | Scale is tiny; correctness and simplicity win |
| Serializable joins | Slight contention, retry on conflict | Oversell/duplicate joins are user-visible bugs; the cost is negligible at this scale |
| Taxonomy as strings | No DB-level enum | Validated in code; avoids lookup-table joins |
| Email to poster | PII exposure | Needed for paid entry; opt-out would break the flow; disclosed |
| No slot cap unless set | A match can be "unlimited" | Simplest honest default; cap is optional |

## 12. Resolutions to the open questions

1. **Roster visibility** → poster only (least privilege).
2. **Player contact** → poster sees UID + email (disclosed; no one else does).
3. **Moderation** → admin close + player report (first-class rows, audited, one per player).
4. **Who posts** → any registered player (one account, both actions; no separate organizer role).
5. **Slots** → optional; enforced atomically, never oversold.
