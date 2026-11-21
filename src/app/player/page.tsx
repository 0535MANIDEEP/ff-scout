import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RANKS, ROLE_IDS, GAME_ROLE_LABEL } from '@/lib/config';
import SignOut from '@/components/SignOut';
import RoleAvatar from '@/components/RoleAvatar';
import { saveProfile, setSponsorVisibility, leaveMatch } from './actions';

export default async function PlayerDashboard({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect('/login');
  const s = await verifySession(token);
  if (!s) redirect('/login');

  const sp = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: s.userId },
    select: { id: true, displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true, teamName: true, visibleToSponsors: true },
  });
  if (!user) redirect('/login');

  const joins = await prisma.matchEntry.findMany({
    where: { playerId: s.userId },
    orderBy: { createdAt: 'desc' },
    include: { match: { select: { id: true, title: true, mode: true, gameType: true, date: true, city: true, status: true } } },
  });

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 32 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <RoleAvatar role={user.role} iglCapable={false} size={56} />
          <div>
            <h1>Welcome, {user.displayName}</h1>
            <p className="subtext">
              UID {user.gameUid ?? '—'} · BR {user.brRank ?? '—'} · CS {user.csRank ?? '—'} · {user.role ? GAME_ROLE_LABEL[user.role] : '—'} · {user.city}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
      </div>

      {sp.done && <p className="approved" style={{ marginTop: 12 }}>Saved.</p>}
      {sp.e === 'invalid' && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>Check your details — something is missing or invalid.</p>}
      {sp.e === 'team' && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>Team name must be 2–30 characters.</p>}

      <div className="dashboard" style={{ marginTop: 24 }}>
        <section className="card">
          <h3>Your profile</h3>
          <p className="subtext" style={{ marginTop: 6 }}>This is what organizers and (if you opt in) sponsors see. Players reach you in-game by UID.</p>
          <form action={saveProfile} style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <label className="label">Display name<input className="input" name="displayName" defaultValue={user.displayName} required /></label>
            <label className="label">Free Fire UID<input className="input" name="gameUid" defaultValue={user.gameUid ?? ''} inputMode="numeric" pattern="[0-9]{5,15}" required /></label>
            <label className="label">BR rank
              <select className="input" name="brRank" defaultValue={user.brRank ?? ''} required>
                <option value="" disabled>Pick your BR rank</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="label">CS rank
              <select className="input" name="csRank" defaultValue={user.csRank ?? ''} required>
                <option value="" disabled>Pick your CS rank</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="label">Role
              <select className="input" name="role" defaultValue={user.role ?? ''} required>
                <option value="" disabled>Pick your role</option>
                {ROLE_IDS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="label">Team / Guild name (used as default on esports joins)<input className="input" name="teamName" defaultValue={user.teamName ?? ''} maxLength={30} placeholder="Optional — 2–30 characters" /></label>
            <label className="label">City<input className="input" name="city" defaultValue={user.city} required /></label>
            <button className="btn" type="submit">Save profile</button>
          </form>
        </section>

        <section className="card">
          <h3>Sponsor visibility</h3>
          <p className="subtext" style={{ marginTop: 6 }}>Opt in and sponsors can see your profile (displayName, UID, BR/CS ranks, role, city) and export you in a candidate CSV. Never your email.</p>
          <form action={setSponsorVisibility} style={{ marginTop: 14 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" name="visible" defaultChecked={user.visibleToSponsors} />
              <span>Let sponsors see my profile</span>
            </label>
            <button className="btn-ghost" type="submit" style={{ marginTop: 10 }}>Save</button>
          </form>
        </section>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h3>Your joins</h3>
        {joins.length === 0 ? (
          <p className="subtext" style={{ marginTop: 8 }}>You haven't joined a match yet. Browse the board and tap Join.</p>
        ) : (
          <div className="list" style={{ marginTop: 12 }}>
            {joins.map((j) => (
              <div key={j.id} className="rowitem">
                <div>
                  <strong>{j.match.title}</strong>
                  <span className="small"> · {j.match.gameType} · {j.match.mode} · {j.match.city} · {new Date(j.match.date).toLocaleDateString('en-IN')}</span>
                </div>
                <form action={leaveMatch} style={{ display: 'inline' }}>
                  <input type="hidden" name="matchId" value={j.match.id} />
                  <button className="btn-ghost" type="submit">Leave</button>
                </form>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14 }}><Link href="/matches" className="btn-ghost" style={{ textDecoration: 'none' }}>Find a match</Link></div>
      </section>
    </div>
  );
}
