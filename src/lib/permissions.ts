// Catalogue-first authorization. Roles and permissions are defined HERE, once.
// Gates never compare raw role names; they ask for a capability.
// Adding a role = add to the enum in schema.prisma + migration + one line here.
// Adding a permission = one line here, then enforce it at the gates it applies to.

export type Role = 'player' | 'verifier' | 'organizer' | 'admin';

export type Permission =
  | 'proof:read'      // view pending proofs in the review queue
  | 'proof:review'    // approve or reject proofs
  | 'roster:search'   // filter the verified-players shortlist
  | 'roster:export'   // download the shortlist CSV
  | 'user:manage'     // change any user's role, incl. verifiers
  | 'audit:read'      // read the audit log
  | 'account:erase'   // erase an account (DPDP) — admin only, never delegated
  | 'self:delete';    // a non-admin can delete their own account

const CAPS: Record<Role, Permission[]> = {
  player:    ['self:delete'],
  verifier:  ['proof:read', 'proof:review', 'self:delete'],
  organizer: ['roster:search', 'roster:export', 'self:delete'],
  admin:     ['proof:read', 'proof:review', 'roster:search', 'roster:export', 'user:manage', 'audit:read', 'account:erase'],
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return CAPS[role]?.includes(perm) ?? false;
}

// DB enum stores 'moderator'; the product name is 'verifier'. Single mapping.
export const roleFromDb = (db: string): Role =>
  ({ player: 'player', moderator: 'verifier', organizer: 'organizer', admin: 'admin' }[db] ?? 'player') as Role;

export const dbRoleFor = (role: Role): string =>
  ({ player: 'player', verifier: 'moderator', organizer: 'organizer', admin: 'admin' }[role]);

export const ROLE_LABEL: Record<Role, string> = {
  player: 'Player',
  verifier: 'Verifier',
  organizer: 'Organizer',
  admin: 'Admin',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  player: 'Own dashboard, rank proof upload, settings, own erasure.',
  verifier: 'Read queue (no emails), approve/reject with a mandatory reason. Audited, revocable.',
  organizer: 'Search the verified shortlist, export CSV, own account settings.',
  admin: 'Everything: roles, erasure, audit log, queue, CSV.',
};
