import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { MATCH } from '@/lib/config';
import { seriesEligibility } from '@/lib/series';
import { seriesCueLabel } from '@/lib/schedule';
import { setMatchStatus, editSeries, pauseSeriesAction, resumeSeriesAction } from './actions';

export const metadata = { title: 'Your matches, Final Circle' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SERIES_LOCKED_COPY = (eligibility: Awaited<ReturnType<typeof seriesEligibility>>) =>
  `${eligibility.qualified} of ${MATCH.trustLadderMinMatches} completed matches hosted so far — you need ${MATCH.trustLadderMinMatches} hosted matches with at least ${MATCH.trustLadderMinJoins} joiners each to open a weekly series.`;

export default async function PostedMatches({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:roster')) redirect('/player');

  const sp = await searchParams;
  const eligibility = await seriesEligibility(s.userId);
  const [matches, series] = await Promise.all([
    prisma.match.findMany({
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
    }),
    prisma.matchSeries.findMany({ where: { organizerId: s.userId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Your matches</h1>
        <Link href="/post" className="btn" style={{ textDecoration: 'none' }}>Post a match</Link>
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>Your postings and the players who joined. Players see only the joined count, never this list.</p>
      {sp.done && <p className="approved" style={{ marginTop: 10 }}>Updated.</p>}
      {sp.e && <p style={{ color: 'var(--risk)', marginTop: 10, fontSize: 13 }}>{sp.e === 'forbidden' ? 'That match is not yours.' : sp.e === 'edited' ? 'Series updated.' : sp.e === 'paused' ? 'Series paused.' : sp.e === 'resumed' ? 'Series resumed.' : sp.e === 'seriesLocked' ? SERIES_LOCKED_COPY(eligibility) : 'Something was missing.'}</p>}

      {series.length > 0 && (
        <h2 style={{ marginTop: 28, fontSize: 16 }}>Weekly series</h2>
      )}
      {series.map(s => (
        <section key={s.id} className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <strong style={{ fontSize: 17 }}>{s.title}</strong>
              <div className="small">{s.mode} · {s.gameType} · {seriesCueLabel(s.dayOfWeek, s.startTimeLocal)} · {s.durationMinutes} min</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip">{s.status}</span>
              {s.status === 'active' ? (
                <form action={pauseSeriesAction}><input type="hidden" name="seriesId" value={s.id} /><button className="btn-ghost" type="submit">Pause</button></form>
              ) : (
                <form action={resumeSeriesAction}><input type="hidden" name="seriesId" value={s.id} /><button className="btn-ghost" type="submit">Resume</button></form>
              )}
            </div>
          </div>
          <details style={{ marginTop: 10 }}>
            <summary className="btn-ghost" style={{ cursor: 'pointer' }}>Edit series</summary>
            <form action={editSeries} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <input type="hidden" name="seriesId" value={s.id} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="label">Title<input className="input" name="title" defaultValue={s.title} required maxLength={90} /></label>
                <label className="label">Mode<select className="input" name="mode" required defaultValue={s.mode}>{MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="label">Game type<select className="input" name="gameType" required defaultValue={s.gameType}>{MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}</select></label>
                <label className="label">Entry<select className="input" name="entry" required defaultValue={s.entry}>{MATCH.entry.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label className="label">Prize<select className="input" name="prize" required defaultValue={s.prize}>{MATCH.prize.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
                <label className="label">City<input className="input" name="city" defaultValue={s.city} required minLength={2} maxLength={80} /></label>
                <label className="label">Online<select className="input" name="online" required defaultValue={s.online ? 'yes' : 'no'}><option value="no">In-person</option><option value="yes">Online</option></select></label>
                <label className="label">Entry fee (if paid)<input className="input" name="entryFee" defaultValue={s.entryFee ?? ''} maxLength={40} /></label>
                <label className="label">Prize pool (if pool)<input className="input" name="prizePool" defaultValue={s.prizePool ?? ''} maxLength={40} /></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label className="label">Day<select className="input" name="dayOfWeek" required defaultValue={String(s.dayOfWeek)}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
                <label className="label">Start time<input className="input" name="startTimeLocal" type="time" defaultValue={s.startTimeLocal} required /></label>
                <label className="label">Duration<select className="input" name="durationMinutes" required defaultValue={String(s.durationMinutes)}>{MATCH.durationOptionsMinutes.map(v => <option key={v} value={v}>{v} min</option>)}</select></label>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 4 }}>Save series</button>
            </form>
          </details>
        </section>
      ))}

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
