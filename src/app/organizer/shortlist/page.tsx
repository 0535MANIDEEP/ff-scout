import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function OrganizerShortlist() {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType !== 'organizer' && s.userType !== 'admin') redirect('/player');
  const players = await prisma.user.findMany({
    where: { userType: 'player' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return (
    <main className="shell" style={{ paddingBottom: 48 }}>
      <h1 style={{ marginTop: 32 }}>Shortlist builder</h1>
      <p className="subtext">Filter verified FF rosters across colleges, cafés, LANs, guilds and sponsor activations. ₹499 per event unlock coming shortly.</p>
      <div className="shell" style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <a className="btn-ghost" href="/organizer/shortlist/download" style={{ textDecoration: 'none' }}>Download CSV shortlist (₹499 pending)</a>
      </div>
      <div className="list" style={{ marginTop: 20 }}>
        {players.map(p => (
          <div className="rowitem" key={p.id}>
            <div>
              <div className="tile-title">{p.displayName} <span className="small">· {p.rank} · {p.role} · {p.city}</span></div>
              <div className="tile-sub">{p.college || 'Affiliation withheld'} · {p.status}</div>
            </div>
            <span className="chip chip-sapphire">{p.verified ? 'Verified ✓' : 'Pending'}</span>
          </div>
        ))}
        {players.length === 0 && <div className="card">No verified players yet — you’ll be the first to pick from.</div>}
      </div>
    </main>
  );
}
