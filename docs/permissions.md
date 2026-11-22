# Roles & Permissions — Final Circle

DevOps-style RBAC for the platform. **Roles are designed in `src/lib/permissions.ts` first; assignment is server-side only.** No one writes raw SQL for access control, ever.

## Adding a role
1. `schema.prisma`: extend `enum UserType` (and `src/lib/auth.ts` SessionPayload union)
2. Migration: additive only (`ALTER TYPE "UserType" ADD VALUE`)
3. `roleFromDb`/`dbRoleFor` in `permissions.ts` get one mapping each
4. `CAPS` in `permissions.ts` defines its power set
5. Every gate checks capabilities — nothing else changes

## Adding a permission
1. Add to the `Permission` union in `permissions.ts`
2. Add to the roles that hold it in `CAPS`
3. Enforce at its gates via `hasPermission()`
4. Document here

## Hard rules
- Gates never compare raw role names (`userType === 'admin'` is a code smell; use `hasPermission(role, 'x')`)
- Erasure (`account:erase`) is admin-only, permanently
- Only `player`, `sponsor` (email contact only) and `admin` (match close) exist in `UserType`. There is no verifier or moderator role, and no human approval queue.
