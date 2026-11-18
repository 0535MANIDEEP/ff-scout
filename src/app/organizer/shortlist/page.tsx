import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import SignOut from '@/components/SignOut';
import type { Role } from '@prisma/client';

const ROLES: Role[] = ['fragger', 'sniper', 'support', 'igled', 'lurker'];

export default async function OrganizerShortlist({ searchParams }: { searchParams: Promise<{ role?: string; rank?: string; city?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType !== 'organizer' && s.userType !== 'admin') redirect('/player');

  const { role: roleRaw, rank, city } = await searchParams;
  const role = ROLES.includes(roleRaw as Role) ? (roleRaw as Role) : undefined;
  const RANKS = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Heroic', 'Master'];
  const safeRank = rank && RANKS.includes(rank) ? rank : undefined;
  const where = {
    userType: 'player' as const,
    ...(role ? { role } : {}),
    ...(safeRank ? { rank: safeRank } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' as const } } : {}),
  };
  const players = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, displayName: true, role: true, rank: true, college: true, city: true, verified: true, status: true },
  });

  const ranks = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Heroic', 'Master'];

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 32, gap: 16 }}>
        <h1>Shortlist builder</h1>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
      </div>
      <p className="subtext">Filter verified FF rosters across colleges, cafés, LANs, guilds and sponsor activations. ₹499 per event unlock coming shortly.</p>

      <form method="get" action="/organizer/shortlist" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <select className="input" name="role" defaultValue={role ?? ''} aria-label="Role" style={{ minWidth: 140 }}>
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input" name="rank" defaultValue={safeRank ?? ''} aria-label="Rank" style={{ minWidth: 140 }}>
          <option value="">All ranks</option>
          {ranks.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input className="input" name="city" defaultValue={city ?? ''} placeholder="City contains…" aria-label="City" style={{ minWidth: 180 }} />
        <button className="btn" type="submit">Filter</button>
        {(role || safeRank || city) && <Link href="/organizer/shortlist" className="btn-ghost" style={{ textDecoration: 'none' }}>Clear</Link>}
      </form>

      <div className="shell" style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <a className="btn-ghost" href="/organizer/shortlist/download" style={{ textDecoration: 'none' }}>Download CSV shortlist (₹499 pending)</a>
      </div>
      <div className="list" style={{ marginTop: 20 }}>
        {players.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <h3>No players match</h3>
            <p className="subtext" style={{ marginTop: 8 }}>Verified players join when they upload their screenshot. Loosen the filters or check back after the admin reviews the queue.</p>
          </div>
        ) : players.map(p => (
          <div className="rowitem" key={p.id}>
            <div>
              <div className="tile-title">{p.displayName} <span className="small">· {p.rank} · {p.role} · {p.city}</span></div>
              <div className="tile-sub">{p.college || 'Affiliation withheld'} · {p.status}</div>
            </div>
            <span className="chip chip-sapphire">{p.verified ? 'Verified ✓' : 'Pending'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
