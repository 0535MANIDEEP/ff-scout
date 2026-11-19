# Moderation & Verifier Tiers — Final Circle

Decision (2026-11-19): verification work is delegatable to trusted humans under a least-privilege tier; authorization beyond that tier is never delegated. This doc is the contract for every present and future verifier.

## Tiers

| Tier | `userType` | Can do | Cannot do |
|---|---|---|---|
| Admin (owner) | `admin` | Approve/reject proofs, delete/erase accounts, refunds, promote/demote roles, DB access | — |
| Verifier | `moderator` | View pending queue (IGN, rank, role, UID, affiliation, screenshot), approve/reject with a **required** rejection reason. Every action is audit-logged with `by: 'moderator'`. | Email addresses, account erasure, role changes, CSV export, refunds, `/settings` self-elevation, verifier promotion |
| Organizer | `organizer` | Filter shortlist, download CSV of verified players | Approve proofs |
| Player | `player` | Sign up, upload proof, manage own settings | — |

## Promotion (one command, by admin, never self-serve)

```bash
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient();
p.user.update({ where: { email: 'THEIR_EMAIL' }, data: { userType: 'moderator' } }).then(u=>console.log('promoted', u.email)).finally(()=>p.$disconnect())"
```
Run from repo root with `.env` containing `DATABASE_URL`. Verify with the same query using `isVerifier` logic in `/admin/verify`.

## Revocation (under one minute)

```bash
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient();
p.user.update({ where: { email: 'THEIR_EMAIL' }, data: { userType: 'organizer' } }).then(()=>console.log('revoked')).finally(()=>p.$disconnect())"
```

## Operating rules

1. **Admin spot-audits.** For the first two weeks with any verifier, admin reviews every Nth verifier decision (N = 4). Any disagreement > 10% of audited decisions revokes the tier.
2. **Verifiers never see email.** The queue redacts PII other than IGN/UID/affiliation/rank/role. Any verifier asking for email is denied and logged.
3. **No self-promotion path.** No UI exists for a verifier to grant roles to anyone, including themselves.
4. **Reversal, not appeals court.** A bad approve is reversed by admin by flipping the proof to rejected and writing the reason; the player sees "Last decision" honestly.
5. **Kill switch is the row.** If ANY verifier misuses access: set `userType` back to `organizer`, freeze nothing else, review the audit log for blast radius.
6. **Verifiers are named humans.** "Anonymous community moderators" are out of scope until the platform has real events and a code of conduct; promotion before that is a liability, not a feature.

## Escalation

- Player disputes a rejection → verifier states what the screenshot showed → admin reviews → reverse if wrong.
- Abusive/fake proofs (obvious propaganda, stolen screenshots) → verifier rejects + reason; player can re-upload. Three strikes → admin bans permanently and re-offers any roster slot.
- Verifier conflict of interest (friend in queue) → must abstain; admin handles.

## Metrics that decide whether to promote a third verifier

- Median review time < 24h for 2 consecutive weeks
- Reversal rate of verifier approvals < 10%
- Queue never blocked by verifier availability

## Non-negotiables

- Money, bans, erasure, DB access: admin only, forever, no appeal.
- Every moderator action is audit-logged with tier. `auditLog.detail.by ∈ {'admin','moderator'}` is the audit filter.
- No verifier PII ends up in the repo, in tickets, or in screenshots.
