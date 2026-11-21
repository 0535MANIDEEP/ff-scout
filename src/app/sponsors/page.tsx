import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { RANKS, ROLE_IDS, GAME_ROLE_LABEL } from '@/lib/config';
import SignOut from '@/components/SignOut';

export const metadata = { title: 'Candidate directory, Final Circle' };
export const dynamic = 'force-dynamic';

export default async function SponsorDirectory({ searchParams }: { searchParams: Promise<{ city?: string; rank?: string; role?: string }> }) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'talent:browse')) redirect('/player');

  const sp = await searchParams;
  const city = sp.city?.trim().slice(0, 80);
  const rank = RANKS.includes(sp.rank ?? '') ? sp.rank : undefined;
  const role = ROLE_IDS.includes(sp.role ?? '') ? sp.role : undefined;

  const players = await prisma.user.findMany({
    where: {
      userType: 'player',
      visibleToSponsors: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(rank ? { OR: [{ brRank: rank }, { csRank: rank }] } : {}),
      ...(role ? { role: role as 'rusher' | 'sniper' | 'support' | 'anchor' | 'lurker' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true },
  });

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <div>
          <span className="eyebrow-inline">CANDIDATE DIRECTORY</span>
          <h1 style={{ marginTop: 10 }}>Players who opted in</h1>
        </div>
        <SignOut />
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>
        Only players who turned on sponsor visibility appear here. Email addresses are never shown; reach players in-game by UID.
      </p>

      <form method="get" action="/sponsors" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, alignItems: 'flex-end' }}>
        <label className="label" style={{ margin: 0 }}>City<input className="input" name="city" defaultValue={city ?? ''} placeholder="City contains…" style={{ minWidth: 150 }} /></label>
        <label className="label" style={{ margin: 0 }}>Rank
          <select className="input" name="rank" defaultValue={rank ?? ''} style={{ minWidth: 140 }}>
            <option value="">Any rank</option>
            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="label" style={{ margin: 0 }}>Role
          <select className="input" name="role" defaultValue={role ?? ''} style={{ minWidth: 140 }}>
            <option value="">Any role</option>
            {ROLE_IDS.map(r => <option key={r} value={r}>{GAME_ROLE_LABEL[r]}</option>)}
          </select>
        </label>
        <button className="btn" type="submit">Filter</button>
        <Link href="/sponsors/export" className="btn-ghost" style={{ textDecoration: 'none' }}>Export CSV</Link>
      </form>

      {players.length === 0 ? (
        <p className="subtext" style={{ marginTop: 28 }}>No opted-in players match these filters yet.</p>
      ) : (
        <div className="list" style={{ marginTop: 20 }}>
          {players.map(p => (
            <div key={p.id} className="rowitem">
              <div>
                <strong>{p.displayName}</strong>
                <div className="small">UID {p.gameUid ?? '—'} · BR {p.brRank ?? '—'} · CS {p.csRank ?? '—'} · {p.role ? GAME_ROLE_LABEL[p.role] : '—'} · {p.city}</div>
              </div>
              <span className="chip">opted in</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
