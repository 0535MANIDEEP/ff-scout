// Esports team/guild names (Option 1): pure helpers shared by join, roster, and the profile.

export const TEAM_NAME_MAX_LENGTH = 30;

// Trim + collapse inner whitespace. Shared: join form, roster column, and profile.
export function normalizeTeamName(name: string | null | undefined): string {
  return (name ?? '').trim().replace(/\s+/g, ' ');
}

// Valid team name: 2–30 chars after trim; empty/null = no team.
export function isValidTeamName(name: string | null | undefined): boolean {
  const n = normalizeTeamName(name);
  return n.length >= 2 && n.length <= TEAM_NAME_MAX_LENGTH;
}

// Sort/group key: trimmed + case-folded (spec: "trimmed/case-normalized").
export function teamKey(name: string | null | undefined): string {
  return normalizeTeamName(name).toLowerCase().replace(/\s+/g, '');
}

// Sort by teamKey (empty first); input array is not mutated.
export function sortByTeamKey<T>(rows: T[], teamOf: (row: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => teamKey(teamOf(a)).localeCompare(teamKey(teamOf(b))));
}
