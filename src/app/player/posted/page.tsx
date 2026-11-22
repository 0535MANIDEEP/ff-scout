import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/shared/db/client';
import { MATCH } from '@/lib/config';
import { seriesEligibility } from '@/lib/series';
import { seriesCueLabel } from '@/lib/schedule';
import { FREE_ENTRY_NOTICE } from '@/features/disclosure/copy';
import { privateMetadata } from '@/lib/seo';
import { setMatchStatus, editSeries, pauseSeriesAction, resumeSeriesAction } from './actions';
import { sortByTeamKey } from '@/lib/team';

export const metadata = privateMetadata('Your matches, Final Circle');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SERIES_LOCKED_COPY = (eligibility: Awaited<ReturnType<typeof seriesEligibility>>) =>
  `${eligibility.qualified} of ${MATCH.trustLadderMinMatches} completed matches hosted so far. You need ${MATCH.trustLadderMinMatches} hosted matches with at least ${MATCH.trustLadderMinJoins} joiners each to open a weekly series.`;

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H3_SM = 'mb-2 text-[15px] font-bold leading-[1.2] tracking-[-0.01em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const CARD_COPY = 'text-sm leading-[1.6] text-muted';
const SMALL = 'text-sm text-muted';
const APPROVED = 'font-mono text-sm font-bold text-[#1F6B3A]';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const LIST = 'flex flex-col gap-3';
const ROWITEM = 'flex min-h-[72px] items-center justify-between gap-4 rounded-card border border-[#CFC8B9] bg-panel p-4 text-ink hover:border-vermilion max-[600px]:flex-col max-[600px]:items-start';
const CHIP = 'inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[#CFC8B9] bg-[#E4DFD1] px-3 font-mono text-xs font-bold text-ink';
const CHIP_SAPPHIRE = 'inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[#0F4C81] bg-[#E4DFD1] px-3 font-mono text-xs font-bold text-[#0F4C81]';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default async function PostedMatches({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:roster')) redirect('/player');

  const sp = await searchParams;
  const eligibility = await seriesEligibility(s.id);
  const [matches, series] = await Promise.all([
    prisma.match.findMany({
      where: { organizerId: s.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true, title: true, mode: true, gameType: true, status: true, date: true, city: true,
        entries: {
          select: {
            player: { select: { displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true, email: true } },
            teamName: true,
          },
        },
      },
    }),
    prisma.matchSeries.findMany({ where: { organizerId: s.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className={`${SHELL} pb-12`}>
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <h1 className={H1}>Your matches</h1>
        <Link href="/post" className={BTN}>Post a match</Link>
      </div>
      <p className={`mt-2 ${SUBTEXT}`}>Your postings and the players who joined. Players see only the joined count, never this list.</p>
      {sp.done && <p className={`mt-[10px] ${APPROVED}`}>Updated.</p>}
      {sp.e && <p className="mt-[10px] text-[13px] text-risk">{sp.e === 'forbidden' ? 'That match is not yours.' : sp.e === 'edited' ? 'Series updated.' : sp.e === 'paused' ? 'Series paused.' : sp.e === 'resumed' ? 'Series resumed.' : sp.e === 'seriesLocked' ? SERIES_LOCKED_COPY(eligibility) : 'Something was missing.'}</p>}

      {series.length > 0 && (
        <h2 className="mt-7 text-base font-bold leading-[1.2] tracking-[-0.02em] text-ink">Weekly series</h2>
      )}
      {series.map(s => (
        <section key={s.id} className={`mt-4 ${CARD}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <strong className="text-[17px]">{s.title}</strong>
              <div className={SMALL}>{s.mode} · {s.gameType} · {seriesCueLabel(s.dayOfWeek, s.startTimeLocal)} · {s.durationMinutes} min</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={CHIP}>{s.status}</span>
              {s.status === 'active' ? (
                <form action={pauseSeriesAction}><input type="hidden" name="seriesId" value={s.id} /><button className={GHOST} type="submit">Pause</button></form>
              ) : (
                <form action={resumeSeriesAction}><input type="hidden" name="seriesId" value={s.id} /><button className={GHOST} type="submit">Resume</button></form>
              )}
            </div>
          </div>
          <details className="mt-[10px]">
            <summary className={`${GHOST} cursor-pointer`}>Edit series</summary>
            <form action={editSeries} className="mt-3 grid gap-[10px]">
              <input type="hidden" name="seriesId" value={s.id} />
              <div className="grid grid-cols-2 gap-3">
                <label className={LABEL_FLUSH}>Title<input className={INPUT} name="title" defaultValue={s.title} required maxLength={90} /></label>
                <label className={LABEL_FLUSH}>Mode<select className={INPUT} name="mode" required defaultValue={s.mode}>{MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className={LABEL_FLUSH}>Game type<select className={INPUT} name="gameType" required defaultValue={s.gameType}>{MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}</select></label>
                <label className={LABEL_FLUSH}>City<input className={INPUT} name="city" defaultValue={s.city} required minLength={2} maxLength={80} /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className={LABEL_FLUSH}>Online<select className={INPUT} name="online" required defaultValue={s.online ? 'yes' : 'no'}><option value="no">In-person</option><option value="yes">Online</option></select></label>
              </div>
              <p className={CARD_COPY}>{FREE_ENTRY_NOTICE}</p>
              <div className="grid grid-cols-3 gap-3">
                <label className={LABEL_FLUSH}>Day<select className={INPUT} name="dayOfWeek" required defaultValue={String(s.dayOfWeek)}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
                <label className={LABEL_FLUSH}>Start time<input className={INPUT} name="startTimeLocal" type="time" defaultValue={s.startTimeLocal} required /></label>
                <label className={LABEL_FLUSH}>Duration<select className={INPUT} name="durationMinutes" required defaultValue={String(s.durationMinutes)}>{MATCH.durationOptionsMinutes.map(v => <option key={v} value={v}>{v} min</option>)}</select></label>
              </div>
              <button className={`${BTN} mt-1`} type="submit">Save series</button>
            </form>
          </details>
        </section>
      ))}

      {matches.length === 0 ? (
        <p className={`mt-6 ${SUBTEXT}`}>You haven't posted a match yet. Post one and it appears here.</p>
      ) : (
        <div className="mt-6 grid gap-5">
          {matches.map(m => (
            <section key={m.id} className={CARD}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <strong className="text-[17px]">{m.title}</strong>
                  <div className={SMALL}>{m.gameType} · {m.mode} · {m.city} · {new Date(m.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={CHIP}>{m.status}</span>
                  <form action={setMatchStatus}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value={m.status === 'open' ? 'closed' : 'open'} />
                    <button className={GHOST} type="submit">{m.status === 'open' ? 'Close' : 'Reopen'}</button>
                  </form>
                </div>
              </div>

              <h3 className={`mt-4 ${H3_SM}`}>Roster · {m.entries.length}</h3>
              {m.entries.length === 0 ? (
                <p className={`mt-[6px] ${CARD_COPY}`}>No one has joined yet.</p>
              ) : (
                <div className={`mt-2 ${LIST}`}>
                  {sortByTeamKey(m.entries, (e) => e.teamName).map(e => (
                    <div key={e.player.email + e.player.displayName} className={ROWITEM}>
                      <div>
                        <strong className="text-base">{e.player.displayName}</strong>
                        <div className={SMALL}>UID {e.player.gameUid ?? '—'} · BR {e.player.brRank ?? '—'} · CS {e.player.csRank ?? '—'} · {e.player.role ?? '—'} · {e.player.city}</div>
                        {e.teamName && <div className={SMALL}>Team: {e.teamName}</div>}
                      </div>
                      <a className={CHIP_SAPPHIRE} href={`mailto:${e.player.email}`}>Email</a>
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
