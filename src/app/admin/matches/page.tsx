import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import SignOut from '@/components/SignOut';
import { adminSetMatchStatus, adminPauseSeries } from './actions';
import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Matches console, Final Circle');
export const dynamic = 'force-dynamic';

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H3 = 'mb-2 text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.01em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const CARD_COPY = 'text-sm leading-[1.6] text-muted';
const SMALL = 'text-sm text-muted';
const APPROVED = 'font-mono text-sm font-bold text-[#1F6B3A]';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const LIST = 'flex flex-col gap-3';
const ROWITEM = 'flex min-h-[72px] items-center justify-between gap-4 rounded-card border border-[#CFC8B9] bg-panel p-4 text-ink hover:border-vermilion max-[600px]:flex-col max-[600px]:items-start';
const CHIP = 'inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[#CFC8B9] bg-[#E4DFD1] px-3 font-mono text-xs font-bold text-ink';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

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
    <div className={`${SHELL} pb-14`}>
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <h1 className={H1}>Matches console</h1>
        <div className="flex gap-2">
          <SignOut />
        </div>
      </div>
      <p className={`mt-2 ${SUBTEXT}`}>Every match on the board. Closing a match stops new joins. Reports from players appear below.</p>
      {sp.done && <p className={`mt-[10px] ${APPROVED}`}>Updated.</p>}
      {sp.e && <p className="mt-[10px] text-[13px] text-risk">Something was missing.</p>}

      <div className="mt-[18px] flex flex-col gap-3">
        {matches.map(m => (
          <div key={m.id} className={ROWITEM}>
            <div>
              <strong className="text-base">{m.title}</strong>
              <div className={SMALL}>{m.gameType} · {m.mode} · {m.city} · {new Date(m.date).toLocaleDateString('en-IN')} · {m.organizer.displayName}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={CHIP}>{m.status}</span>
              <form action={adminSetMatchStatus}>
                <input type="hidden" name="matchId" value={m.id} />
                <input type="hidden" name="status" value={m.status === 'open' ? 'closed' : 'open'} />
                <button className={GHOST} type="submit">{m.status === 'open' ? 'Close' : 'Reopen'}</button>
              </form>
            </div>
          </div>
        ))}
        {matches.length === 0 && <div className={CARD}>No matches yet.</div>}
      </div>

      {series.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h3 className={H3}>Series console</h3>
          <div className={`mt-2 ${LIST}`}>
            {series.map(s => (
              <div key={s.id} className={ROWITEM}>
                <div>
                  <strong className="text-base">{s.title}</strong>
                  <div className={SMALL}>Hosted by {s.organizer.displayName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={CHIP}>{s.status}</span>
                  {s.status === 'active' && (
                    <form action={adminPauseSeries}>
                      <input type="hidden" name="seriesId" value={s.id} />
                      <button className={GHOST} type="submit">Pause</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h3 className={H3}>Recent reports</h3>
        {reports.length === 0 ? <p className={`mt-2 ${CARD_COPY}`}>No reports yet.</p> : (
          <div className={`mt-3 ${LIST}`}>
            {reports.map((r, i) => (
              <div key={i} className={ROWITEM}>
                <div>
                  <strong className="text-base">{r.match.title}</strong>
                  <div className={SMALL}>{r.reason}</div>
                </div>
                <span className={SMALL}>by {r.reporter.displayName} · {r.createdAt.toISOString().slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
