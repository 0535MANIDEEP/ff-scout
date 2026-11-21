import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { setMatchStatus } from './actions';

export const metadata = { title: 'Your matches, Final Circle' };

export default async function PostedMatches({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:roster')) redirect('/player');

  const sp = await searchParams;
  const matches = await prisma.match.findMany({
    where: { organizerId: s.userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, title: true, mode: true, gameType: true, status: true, date: true, city: true,
      entries: {
        select: {
          player: { select: { displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true, email: true } },
        },
      },
    },
  });

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Your matches</h1>
        <Link href="/post" className="btn" style={{ textDecoration: 'none' }}>Post a match</Link>
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>Your postings and the players who joined. Players see only the joined count, never this list.</p>
      {sp.done && <p className="approved" style={{ marginTop: 10 }}>Updated.</p>}
      {sp.e && <p style={{ color: 'var(--risk)', marginTop: 10, fontSize: 13 }}>{sp.e === 'forbidden' ? 'That match is not yours.' : 'Something was missing.'}</p>}

      {matches.length === 0 ? (
        <p className="subtext" style={{ marginTop: 24 }}>You haven't posted a match yet. Post one and it appears here.</p>
      ) : (
        <div style={{ display: 'grid', gap: 20, marginTop: 24 }}>
          {matches.map(m => (
            <section key={m.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: 17 }}>{m.title}</strong>
                  <div className="small">{m.gameType} · {m.mode} · {m.city} · {new Date(m.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="chip">{m.status}</span>
                  <form action={setMatchStatus}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value={m.status === 'open' ? 'closed' : 'open'} />
                    <button className="btn-ghost" type="submit">{m.status === 'open' ? 'Close' : 'Reopen'}</button>
                  </form>
                </div>
              </div>

              <h3 style={{ marginTop: 16, fontSize: 15 }}>Roster · {m.entries.length}</h3>
              {m.entries.length === 0 ? (
                <p className="subtext" style={{ marginTop: 6 }}>No one has joined yet.</p>
              ) : (
                <div className="list" style={{ marginTop: 8 }}>
                  {m.entries.map(e => (
                    <div key={e.player.email + e.player.displayName} className="rowitem">
                      <div>
                        <strong>{e.player.displayName}</strong>
                        <div className="small">UID {e.player.gameUid ?? '—'} · BR {e.player.brRank ?? '—'} · CS {e.player.csRank ?? '—'} · {e.player.role ?? '—'} · {e.player.city}</div>
                      </div>
                      <a className="chip chip-sapphire" href={`mailto:${e.player.email}`}>Email</a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
