// Live game-profile lookup for /uid-check. The API key is optional: without it
// the pool half of the page still works, and the live half reports honestly
// that it is not enabled instead of failing silently.
//
// Free tier (₹0, no card): 50 calls/month, 5 req/min. Key goes in the Vercel
// dashboard, never in git. Response fields are whitelisted below: whatever the
// provider returns outside this list never leaves the server.

const ENDPOINT = 'https://api.gameskinbo.com/ff-info/get';

export type LiveProfile = {
  nickname: string;
  level: number | null;
  likes: number | null;
  region: string | null;
  season: number | null;
  brRank: string;
  brPoints: number | null;
  csRank: string;
  csPoints: number | null;
  guild: string | null;
  guildMembers: number | null;
  lastLogin: string | null;
};

export type LiveOutcome =
  | { state: 'ok'; profile: LiveProfile }
  | { state: 'disabled' }    // no key configured on this deployment
  | { state: 'quota' }       // free monthly allowance or per-minute limit hit
  | { state: 'not_found' }
  | { state: 'error' };

// Rank codes as the game reports them, mapped to tier names. Unknown codes
// read as Unranked rather than guessing a tier the game may have renamed.
const RANK_BY_CODE: Record<number, string> = {
  100: 'Bronze I', 110: 'Bronze II', 120: 'Bronze III',
  200: 'Silver I', 210: 'Silver II', 220: 'Silver III',
  300: 'Gold I', 310: 'Gold II', 320: 'Gold III',
  400: 'Platinum I', 410: 'Platinum II', 420: 'Platinum III',
  500: 'Diamond I', 510: 'Diamond II', 520: 'Diamond III',
  600: 'Heroic', 700: 'Grandmaster',
};

function rankName(code: unknown): string {
  const n = Number(code);
  if (!n) return 'Unranked';
  return RANK_BY_CODE[n] ?? 'Unranked';
}

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

export async function fetchLiveProfile(uid: string, region: string): Promise<LiveOutcome> {
  const key = process.env.GAMESKINBO_API_KEY;
  if (!key) return { state: 'disabled' };

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region)}`, {
      headers: { 'x-api-key': key, accept: 'application/json' },
      signal: AbortSignal.timeout(7000), // Vercel Hobby functions cap at 10s
      cache: 'no-store',
    });
  } catch {
    return { state: 'error' };
  }

  if (res.status === 402 || res.status === 429) return { state: 'quota' };
  if (!res.ok) return { state: 'error' };

  const raw = await res.json().catch(() => null) as Record<string, unknown> | null;
  const account = raw?.AccountInfo as Record<string, unknown> | undefined;
  if (!account) return { state: 'not_found' };

  const profile = (raw?.AccountProfileInfo ?? {}) as Record<string, unknown>;
  const guild = (raw?.GuildInfo ?? {}) as Record<string, unknown>;

  return {
    state: 'ok',
    profile: {
      nickname: String(account.AccountName ?? 'Unknown'),
      level: points(account.AccountLevel),
      likes: points(account.AccountLikes),
      region: account.AccountRegion ? String(account.AccountRegion) : null,
      season: points(account.AccountSeasonId),
      brRank: rankName(profile.BrMaxRank),
      brPoints: points(profile.BrRankPoint),
      csRank: rankName(profile.CsMaxRank),
      csPoints: points(profile.CsRankPoint),
      guild: guild.GuildName ? String(guild.GuildName) : null,
      guildMembers: points(guild.MemberNum),
      lastLogin: dateInIndia(account.AccountLastLogin),
    },
  };
}
