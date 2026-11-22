import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import SignOut from '@/components/SignOut';
import { adminSetMatchStatus, adminPauseSeries } from './actions';
import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Matches console, Final Circle');
export const dynamic = 'force-dynamic';

export default async function AdminMatches({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player');

  const sp = await searchParams;
  const [matches, reports, series] = await Promise.all([
    prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, title: true, mode: true, gameType: true, status: true, date: true, city: true, organizer: { select: { displayName: true } } },
    }),
    prisma.report.findMany({ orderBy: { createdAt: 'desc' }, take: 15, select: { reason: true, createdAt: true, match: { select: { title: true } }, reporter: { select: { displayName: true } } } }),
    prisma.matchSeries.findMany({ orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, title: true, status: true, organizer: { select: { displayName: true } } } }),
  ]);

  return (
    <div className="shell" style={{ paddingBottom: 56 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Matches console</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/roles" className="btn-ghost" style={{ textDecoration: 'none' }}>Roles</Link>
          <SignOut />
        </div>
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>Every match on the board. Closing a match stops new joins. Reports from players appear below.</p>
      {sp.done && <p className="approved" style={{ marginTop: 10 }}>Updated.</p>}
      {sp.e && <p style={{ color: 'var(--risk)', marginTop: 10, fontSize: 13 }}>Something was missing.</p>}

      <div className="list" style={{ marginTop: 18 }}>
        {matches.map(m => (
          <div key={m.id} className="rowitem">
            <div>
              <strong>{m.title}</strong>
              <div className="small">{m.gameType} · {m.mode} · {m.city} · {new Date(m.date).toLocaleDateString('en-IN')} · {m.organizer.displayName}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip">{m.status}</span>
              <form action={adminSetMatchStatus}>
                <input type="hidden" name="matchId" value={m.id} />
                <input type="hidden" name="status" value={m.status === 'open' ? 'closed' : 'open'} />
                <button className="btn-ghost" type="submit">{m.status === 'open' ? 'Close' : 'Reopen'}</button>
              </form>
            </div>
          </div>
        ))}
        {matches.length === 0 && <div className="card" style={{ padding: 24 }}>No matches yet.</div>}
      </div>

      {series.length > 0 && (
        <section className="card" style={{ marginTop: 24 }}>
          <h3>Series console</h3>
          <div className="list" style={{ marginTop: 8 }}>
            {series.map(s => (
              <div key={s.id} className="rowitem">
                <div>
                  <strong>{s.title}</strong>
                  <div className="small">Hosted by {s.organizer.displayName}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="chip">{s.status}</span>
                  {s.status === 'active' && (
                    <form action={adminPauseSeries}>
                      <input type="hidden" name="seriesId" value={s.id} />
                      <button className="btn-ghost" type="submit">Pause</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginTop: 24 }}>
        <h3>Recent reports</h3>
        {reports.length === 0 ? <p className="subtext" style={{ marginTop: 8 }}>No reports yet.</p> : (
          <div className="list" style={{ marginTop: 12 }}>
            {reports.map((r, i) => (
              <div key={i} className="rowitem">
                <div>
                  <strong>{r.match.title}</strong>
                  <div className="small">{r.reason}</div>
                </div>
                <span className="small">by {r.reporter.displayName} · {r.createdAt.toISOString().slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
