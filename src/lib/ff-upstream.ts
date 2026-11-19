// Live game-profile lookup for /uid-check. The API key is optional: without it
// the pool half of the page still works, and the live half reports honestly
// that it is not enabled instead of failing silently.
//
// Provider: GamesKinbo Free Fire Info API — docs at https://api.gameskinbo.com/documentation.
// Free tier (₹0, no card): 50 calls/month, 5 req/min. Key goes in the Vercel
// dashboard, never in git. Regions are sent uppercase exactly as the provider
// documents (BD, IND, BR, ...). shapeProfile whitelists every field: whatever
// the provider returns outside that list never leaves the server.
//
// Rank codes are passed through as the provider reports them (e.g. 325), not
// mapped to tier names — the provider does not document the mapping, and
// guessing would put words in the game's mouth.

const ENDPOINT = 'https://api.gameskinbo.com/ff-info/get';

export type LiveProfile = {
  nickname: string;
  level: number | null;
  likes: number | null;
  region: string | null;
  season: number | null;
  brRank: number | null;   // provider rank code, e.g. 325 — not a tier name
  brPoints: number | null;
  csRank: number | null;
  csPoints: number | null;
  guild: string | null;
  guildMembers: number | null;
  lastLogin: string | null;
};

export type LiveOutcome =
  | { state: 'ok'; profile: LiveProfile }
  | { state: 'disabled' }    // no key configured on this deployment
  | { state: 'quota' }       // free monthly allowance or per-minute limit hit
  | { state: 'error' };

function points(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function dateInIndia(value: unknown): string | null {
  let seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds === 0) return null;
  if (seconds > 9999999999) seconds = Math.floor(seconds / 1000); // ms, not s
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
}

// Pure shaping: raw provider payload -> whitelisted profile. Returns null when
// the body is unreadable. Exported for tests.
export function shapeProfile(raw: Record<string, unknown> | null): LiveProfile | null {
  const account = raw?.AccountInfo as Record<string, unknown> | undefined;
  if (!account) return null;
  const profile = (raw?.AccountProfileInfo ?? {}) as Record<string, unknown>;
  const guild = (raw?.GuildInfo ?? {}) as Record<string, unknown>;
  return {
    nickname: String(account.AccountName ?? 'Unknown'),
    level: points(account.AccountLevel),
    likes: points(account.AccountLikes),
    region: account.AccountRegion ? String(account.AccountRegion) : null,
    season: points(account.AccountSeasonId),
    brRank: points(profile.BrMaxRank),
    brPoints: points(profile.BrRankPoint),
    csRank: points(profile.CsMaxRank),
    csPoints: points(profile.CsRankPoint),
    guild: guild.GuildName ? String(guild.GuildName) : null,
    guildMembers: points(guild.MemberNum),
    lastLogin: dateInIndia(account.AccountLastLogin),
  };
}

export async function fetchLiveProfile(uid: string, region: string): Promise<LiveOutcome> {
  const key = process.env.GAMESKINBO_API_KEY;
  if (!key) return { state: 'disabled' };

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region.toUpperCase())}`, {
      headers: { 'x-api-key': key, accept: 'application/json' },
      signal: AbortSignal.timeout(7000), // Vercel Hobby functions cap at 10s
      cache: 'no-store',
    });
  } catch {
    return { state: 'error' };
  }

  // 429 covers both the per-minute cap and the monthly allowance (provider docs).
  if (res.status === 429) return { state: 'quota' };
  // Everything else (401 bad key, 402 invalid UID/upstream error, 5xx) means the
  // lookup did not happen. 402 is never a payment prompt on this provider.
  if (!res.ok) return { state: 'error' };

  const raw = await res.json().catch(() => null) as Record<string, unknown> | null;
  const profile = shapeProfile(raw);
  // An unreadable body is an upstream problem, not a missing player — claiming
  // "no profile came back" here would be a guess.
  if (!profile) return { state: 'error' };
  return { state: 'ok', profile };
}
