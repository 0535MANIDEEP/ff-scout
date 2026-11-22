// Configuration, loaded once, parsed with zod at import. Invalid JSON crashes
// the build loudly instead of failing silently in production.
import { z } from 'zod';
import rolesJson from '@/config/roles.json';
import ranksJson from '@/config/ranks.json';
import loadoutJson from '@/config/loadout.json';
import copyJson from '@/config/copy.json';
import matchJson from '@/config/match.json';

const roleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int().positive(),
});

const rolesRoot = z.object({ roles: z.array(roleSchema).min(1) });
const ranksRoot = z.object({ ranks: z.array(z.object({ id: z.string().min(1), order: z.number().int().positive() })).min(1) });
const loadoutRoot = z.object({ loadout: z.array(z.object({ label: z.string(), q: z.string(), note: z.string(), price: z.string() })).min(1) });
const copyRoot = z.object({
  settings: z.record(z.string(), z.string()),
});

export const ROLES = rolesRoot.parse(rolesJson).roles.slice().sort((a, b) => a.order - b.order);
export const ROLE_IDS = ROLES.map(r => r.id) as [string, ...string[]];
export const GAME_ROLE_LABEL = Object.fromEntries(ROLES.map(r => [r.id, r.label])) as Record<string, string>;

export const RANKS = ranksRoot.parse(ranksJson).ranks.slice().sort((a, b) => a.order - b.order).map(r => r.id);

export const LOADOUT = loadoutRoot.parse(loadoutJson).loadout;

const matchRoot = z.object({
  modes: z.array(z.string().min(1)).min(1),
  gameTypes: z.array(z.string().min(1)).min(1),
  entry: z.array(z.string().min(1)).min(1),
  prize: z.array(z.string().min(1)).min(1),
  status: z.array(z.string().min(1)).min(1),
  trustLadderMinMatches: z.number().int().positive(),
  trustLadderMinJoins: z.number().int().positive(),
  activeSeriesCap: z.number().int().positive(),
  lookaheadWeeks: z.number().int().positive(),
  autoPauseAfterDeadOccurrences: z.number().int().positive(),
  durationOptionsMinutes: z.array(z.number().int().positive()).min(1),
  defaultDurationMinutes: z.number().int().positive(),
  lazyGenThrottleMinutes: z.number().int().positive(),
});
export const MATCH = matchRoot.parse(matchJson);

export const COPY = copyRoot.parse(copyJson);

