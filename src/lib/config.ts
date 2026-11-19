// Configuration, loaded once, parsed with zod at import. Invalid JSON crashes
// the build loudly instead of failing silently in production.
import { z } from 'zod';
import rolesJson from '@/config/roles.json';
import ranksJson from '@/config/ranks.json';
import loadoutJson from '@/config/loadout.json';
import copyJson from '@/config/copy.json';

const roleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  short: z.string().min(1).max(3),
  iglEligible: z.boolean(),
  order: z.number().int().positive(),
  desc: z.string().min(1),
});

const rolesRoot = z.object({ roles: z.array(roleSchema).min(1) });
const ranksRoot = z.object({ ranks: z.array(z.object({ id: z.string().min(1), order: z.number().int().positive() })).min(1) });
const loadoutRoot = z.object({ loadout: z.array(z.object({ label: z.string(), q: z.string(), note: z.string(), price: z.string() })).min(1) });
const copyRoot = z.object({
  verify: z.record(z.string(), z.string()),
  roles: z.record(z.string(), z.string()),
  settings: z.record(z.string(), z.string()),
});

export const ROLES = rolesRoot.parse(rolesJson).roles.slice().sort((a, b) => a.order - b.order);
export const ROLE_IDS = ROLES.map(r => r.id) as [string, ...string[]];
export const GAME_ROLE_LABEL = Object.fromEntries(ROLES.map(r => [r.id, r.label])) as Record<string, string>;
export const GAME_ROLE_DESC = Object.fromEntries(ROLES.map(r => [r.id, r.desc])) as Record<string, string>;

export const RANKS = ranksRoot.parse(ranksJson).ranks.slice().sort((a, b) => a.order - b.order).map(r => r.id);

export const LOADOUT = loadoutRoot.parse(loadoutJson).loadout;

export const COPY = copyRoot.parse(copyJson);

export const roleLabel = (role: string | null | undefined): string => role && GAME_ROLE_LABEL[role] ? GAME_ROLE_LABEL[role] : 'Organizer';
