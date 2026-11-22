# Releases

## 2026-11-22, free-entry reset

Final Circle is now a free notice board. Hosts post a match, players join, and no money moves through the platform. This entry is the current product truth. See [SPEC.md](SPEC.md) and [ADR 0005](docs/adr/0005-legal-safe-free-entry-and-revenue.md).

- Every match write and public view uses the free-entry constants in `src/features/disclosure/copy.ts`. The legacy `entryFee` and `prizePool` columns remain in the schema for history but are not written or displayed.
- Removed the old verification and unlock flows from the product and public copy. No human review path or gated tier remains.
- Added the self-serve weekly-series trust ladder: three hosted matches with at least two distinct non-host joiners, at most two active series, and automatic pause after two zero-join occurrences.
- Added report categories with an automated consequence. Two payment-request reports from players who joined close the match, pause the host's posting for exactly seven days from server time, and write an audit log entry. No human reviews first.
- Added `/safety` and `/advertise` with the full notice. Revenue is sponsor placements, disclosed affiliate links on `/loadout`, and sponsor-funded free events. The grievance address is configured with `NEXT_PUBLIC_CONTACT_EMAIL`.
- Schema changes are additive only. Tests run with `DATABASE_URL` removed.

The legal background is research, not legal advice. External legal review was not performed for this release; see `docs/handoff-launch.md` → Legal review decision.

## 2026-11-22, in-place reframe

- JWT cookies were replaced with database-backed sessions. All users are signed out once; log in again to continue.
- Removed the sponsor directory, waitlist capture, appearance presets and admin role console. Revenue remains sponsor placements, disclosed affiliate links and sponsor-funded free events.
- One Tailwind v4 styling system replaces the custom CSS system; `motion` and `jose` were removed.
- Match notes are now labelled Requirements. No schema field, column or new verification was added.

## 2026-11-22, client-readiness cleanup

- Removed AI-agent working documents and plan/spec archives from the repository; no agent instruction files are shipped.
- Public contact address and canonical URL are deployment settings (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`). No personal name, email, GitHub handle or local machine path remains in tracked files.
- Deleted obsolete Cloudinary proof-upload configuration and stale demo-account guidance.
- Documentation now points only at files that exist in this tree; no live doc carries a lawyer-review gate or a deleted route.
- Removed the unstored sign-up "where you are" field and corrected the privacy notice; removed dead exports, dead components and other unreachable code.
- No schema, session or money behaviour changed. The exact disclosure string is unchanged.

## v0.1.0, initial preview, 2026-11-18 (historical, removed)

The bullets below describe the old preview model. They are kept as history only. Every paid, verification and shortlist item was removed in the 2026-11-22 reset.

- [Historical, removed] Dark FF-themed landing, verified roster candidate flow
- [Historical, removed] Player sign-up with rank screenshot verification queue
- [Historical, removed] Organizer sign-up, shortlist builder, CSV export
- [Historical, removed] Admin verification queue (admin@ffscout.dev)
- [Historical, removed] Waitlist for organizers
- About, FAQ, privacy, terms
- Sakuga-vfx CTA (click bloom)
- Self-contained test suite (no external database needed)
- Next.js 16 with Turbopack, dark/light regions default to dark out of the box

Not yet shipped in that preview (historical, removed from scope):
- [Historical, removed] Razorpay checkout for the ₹499 unlock
- Email inbox for waitlist and verification notifications
- Real production data (everything was seeded demo)
