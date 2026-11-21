# ADR 0006: Reframe in place instead of a clean rebuild

Date: 2026-11-22

## Status
Accepted.

## Context
The existing Final Circle is deployed, passes CI, SEO and real-Chrome audits, and already uses Next 16, React 19, TypeScript strict, Prisma 6 + Postgres and Zod 4. A clean rebuild would discard working behaviour, SEO and traffic to gain internal tidiness.

## Decision
Keep the repository, database and deploy. Rework internals slice by slice: feature services, opaque database sessions, Tailwind v4 as the single styling system. Remove sponsor directory/export, appearance presets, admin role console and waitlist capture.

## Consequences
No destructive migration. All users are signed out once when JWT cookies are replaced. Tailwind conversion is the largest visual risk and is verified in real Chrome after each slice. Lawyer review remains required before launch.
