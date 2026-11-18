import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function PlayerDashboard() {
  // Server-side auth check — the pattern used on every protected page in this
  // project: read the session cookie, verify its signature + expiry, look up
  // the user fresh from the DB. Never trust a cookie without re-verifying.
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  if (!token) redirect('/login');
  const s = await verifySession(token);
  if (!s) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: s.userId }, include: { proofs: true, matches: true } });
  if (!user) redirect('/login');

  // Compute today's verification queue numbers — cheap enough for one user.
  const pending = user.proofs.filter(p => p.status === 'pending').length;
  const approved = user.proofs.filter(p => p.status === 'approved').length;

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      {/* Header row: greeting + sign-out. Sign-out is a POST so a stray GET
          (bot, prefetch) can never log a user out. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 32 }}>
        <div><h1>Welcome, {user.displayName}</h1>
          <p className="subtext">IGN {user.displayName} · {user.rank} rank · {user.role}</p></div>
        <form action="/sign-out" method="post"><button className="btn-ghost" type="submit">Sign out</button></form>
      </div>
      <div className="dashboard">
        <section className="card">
          <h3>Rank verification</h3>
          <div className="kv"><span>Rank</span><span>{user.rank}</span></div>
          <div className="kv"><span>K/D / ADPR</span><span>Not yet — capture after verification</span></div>
          <div className="kv"><span>Verified screenshots</span><span>{approved > 0 ? `${approved} approved` : 'None yet'}</span></div>
          <div className="kv"><span>Pending review</span><span className="pending">{pending > 0 ? `${pending} awaiting` : '—'}</span></div>
          <div className="kv"><span>Profile status</span><span>{user.verified ? 'Verified ✓' : 'Awaiting screen upload'}</span></div>
          <Link href="/verify" className="btn" style={{ marginTop: 14, display: 'inline-flex', textDecoration: 'none' }}>Upload rank screenshot</Link>
        </section>
        <section className="card">
          <h3>Quick actions</h3>
          <div className="list">
            <div className="rowitem"><span>Availability</span><span className="chip">{user.status}</span></div>
            <div className="rowitem"><span>Contact admin</span><a href="mailto:ops@ffscout.app" className="chip chip-sapphire">Email</a></div>
          </div>
        </section>
      </div>
    </div>
  );
}
