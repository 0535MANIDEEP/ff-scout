import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BRAND } from '@/lib/brand';
import SignOut from '@/components/SignOut';

export default async function PlayerDashboard() {
  // Server-side auth check — the pattern used on every protected page in this
  // project: read the session cookie, verify its signature + expiry, look up
  // the user fresh from the DB. Never trust a cookie without re-verifying.
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect('/login');
  const s = await verifySession(token);
  if (!s) redirect('/login');
  const user = await prisma.user.findUnique({
    where: { id: s.userId },
    select: {
      displayName: true,
      rank: true,
      role: true,
      status: true,
      verified: true,
      proofs: { select: { status: true } },
    },
  });
  if (!user) redirect('/login');

  const pending = user.proofs.filter(p => p.status === 'pending').length;
  const approved = user.proofs.filter(p => p.status === 'approved').length;

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      {/* Header row: greeting + sign-out. Sign-out is a POST so a stray GET
          (bot, prefetch) can never log a user out. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 32 }}>
        <div><h1>Welcome, {user.displayName}</h1>
          <p className="subtext">IGN {user.displayName} · {user.rank} rank · {user.role}</p></div>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
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
            <Link href="/settings" className="rowitem" style={{ textDecoration: 'none' }}><span>Availability</span><span className="chip">{user.status}</span></Link>
            <div className="rowitem"><span>Contact admin</span><a href={`mailto:${BRAND.email}`} className="chip chip-sapphire">Email</a></div>
          </div>
        </section>
      </div>
    </div>
  );
}
