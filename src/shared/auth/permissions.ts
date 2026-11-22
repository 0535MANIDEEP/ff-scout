// Catalogue-first authorization. Roles and permissions are defined HERE, once.
// Gates never compare raw role names; they ask for a capability.
// Adding a role = add to the enum in schema.prisma + migration + one line here.
// Adding a permission = one line here, then enforce it at the gates it applies to.

export type Role = 'player' | 'sponsor' | 'admin';

export type Permission =
  | 'match:join' | 'match:leave'
  | 'match:create' | 'match:manage' | 'match:roster' | 'match:moderate'
  | 'user:manage' | 'audit:read'
  | 'account:erase' | 'self:delete';

const CAPS: Record<Role, Permission[]> = {
  player:  ['match:create', 'match:manage', 'match:roster', 'match:join', 'match:leave', 'self:delete'],
  sponsor: ['self:delete'],
  admin:   ['user:manage', 'audit:read', 'account:erase', 'match:moderate'],
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return CAPS[role]?.includes(perm) ?? false;
}

// DB enum stores 'player' | 'sponsor' | 'admin'. Single mapping, fail-closed.
export const roleFromDb = (db: string): Role =>
  ({ player: 'player', sponsor: 'sponsor', admin: 'admin' }[db] ?? 'player') as Role;
