# Safety and enforcement: Final Circle

Decision, 2026-11-22: Final Circle has no verifier tier and no human approval queue. Trust is self-serve, and the consequence for a payment-request report is automatic. Source of truth: `SPEC.md` and `docs/adr/0005-legal-safe-free-entry-and-revenue.md`.

Legal background is research, not legal advice. A qualified lawyer must review the final product and copy before launch.

## Roles

| Role | `userType` | Can do | Cannot do |
|---|---|---|---|
| Player | `player` | Post matches, join matches, host weekly series, report a match, manage own settings | Approve players, review reports, change other roles |
| Sponsor | `sponsor` | Email contact for placements and sponsor-funded free events | See player profiles, change matches or reports |
| Admin | `admin` | Close a match from the matches console | Verify players, pre-approve posts, skip a report consequence |

There is no `moderator` or `verifier` tier and no `organizer` role. Roles are set server side. There is no UI for self-promotion.

## Self-serve trust ladder

Weekly series unlock automatically when a host has three hosted matches, each with at least two distinct non-host joiners. A host can keep at most two active series. Two zero-join occurrences pause the series automatically. No one reviews an application and no one grants the ladder by hand.

## Report consequence

Every match has a report form with a category. When two `payment_request` reports come from players who actually joined that match:

1. The match closes.
2. The host's posting is paused for exactly seven days from server time.
3. An audit log entry is written.

The consequence applies without human review. There is no review step to wait for and no appeal queue. The joined-report counts shown on the match page come from the database, never from a hardcoded number.

## Grievance path

Report the match in the app first. If that is not possible, write to manideepdaram@gmail.com. If it is still unresolved, the complainant may approach the Online Gaming Authority of India within 30 days. For data rights under the DPDP Act, the same email is the Grievance Officer address. A qualified lawyer must review the final notice before launch.

## Operating rules

- No screenshot review, rank verification, badges or verified list. A player's UID and ranks are self-declared.
- No money disputes are adjudicated, because no money moves through Final Circle.
- No manual reversal of a report consequence through a review queue. The audit log is the record.
- No named community moderators, no verifier promotion commands and no verifier PII in tickets or screenshots.
- No role can be changed from the UI.
- Under-18 accounts can be reported to the grievance address for erasure.

## What we watch

The board shows real database state: open matches, joined counts and joined-report counts. Do not add fixed numbers, trust badges or enforcement statistics to public copy.
