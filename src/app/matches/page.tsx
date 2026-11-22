import Link from 'next/link';
import { prisma } from '@/shared/db/client';
import { MATCH } from '@/shared/config/match';
import { runSeriesSweep } from '@/features/series/service';
import { seriesCueLabel } from '@/features/trust/rules';
import { FREE_ENTRY_NOTICE } from '@/features/disclosure/copy';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Find a Free Fire match in India',
  'Browse open free-entry Free Fire matches in India. Join without paying, and see who else is on the roster.',
  '/matches',
);
export const dynamic = 'force-dynamic';

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const EYEBROW = 'block font-mono text-xs font-semibold tracking-[0.08em] text-muted';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2SMALL = 'text-[15px] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const SMALL = 'text-sm text-muted';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';
const CHIP = 'inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[#CFC8B9] bg-[#E4DFD1] px-3 font-mono text-xs font-bold text-ink';
const ROW = 'flex min-h-[72px] items-center justify-between gap-4 rounded-card border border-[#CFC8B9] bg-panel p-4 text-inherit no-underline hover:border-vermilion max-[600px]:flex-col max-[600px]:items-start';
const LIST = 'flex flex-col gap-3';

export default async function MatchesBoard({ searchParams }: { searchParams: Promise<{ mode?: string; type?: string; city?: string }> }) {
  const sp = await searchParams;
  // Flag 4: board render = sweep tick; fault-isolated, board always renders.
  try { await runSeriesSweep(); } catch { /* never break the board */ }
  const now = new Date();
  const mode = MATCH.modes.includes(sp.mode ?? '') ? sp.mode : undefined;
  const type = MATCH.gameTypes.includes(sp.type ?? '') ? sp.type : undefined;
  const city = sp.city?.trim().slice(0, 80);

  const matches = await prisma.match.findMany({
    where: {
      status: 'open',
      ...(mode ? { mode } : {}),
      ...(type ? { gameType: type } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy: { date: 'asc' },
    take: 60,
    select: {
      id: true, title: true, mode: true, gameType: true, date: true, city: true,
      online: true, slots: true, status: true, endsAt: true,
      series: { select: { dayOfWeek: true, startTimeLocal: true } },
      organizer: { select: { displayName: true } },
    },
  });

  const happening = matches.filter(m => m.status === 'open' && m.date <= now && now <= m.endsAt).sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcoming = matches.filter(m => m.status === 'open' && m.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());

  const row = (m: (typeof matches)[number]) => (
    <Link key={m.id} href={`/matches/${m.id}`} className={ROW}>
      <div className="min-w-0">
        <strong className="text-base">{m.title}</strong>
        <div className={`mt-[2px] ${SMALL}`}>
          {m.gameType} · {m.mode} · {m.online ? 'Online' : m.city} · {new Date(m.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
        <div className={SMALL}>posted by {m.organizer.displayName}</div>
      </div>
      <div className="whitespace-nowrap text-right">
        <div className={CHIP}>Free entry</div>
        <div className={`mt-[6px] ${SMALL}`}>No advertised prize</div>
        {m.slots ? <div className={`mt-1 ${SMALL}`}>{m.slots} slots</div> : null}
        {m.series ? <div className={`mt-1 font-normal opacity-[0.85] ${CHIP}`}>{seriesCueLabel(m.series.dayOfWeek, m.series.startTimeLocal)}</div> : null}
      </div>
    </Link>
  );

  return (
    <div className={`${SHELL} pb-12`}>
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <div>
          <span className={EYEBROW}>THE BOARD · OPEN MATCHES</span>
          <h1 className={`mt-[10px] ${H1}`}>Find a match</h1>
        </div>
        <Link href="/post" className={GHOST}>Post a match</Link>
      </div>
      <p className={`mt-[10px] ${SMALL}`}>{FREE_ENTRY_NOTICE} <Link href="/safety" className="text-vermilion">Safety and legal</Link>.</p>

      <form method="get" action="/matches" className="mt-[18px] flex flex-wrap items-end gap-[10px]">
        <label className={LABEL_FLUSH}>Mode
          <select className={`min-w-[130px] ${INPUT}`} name="mode" defaultValue={mode ?? ''}>
            <option value="">All modes</option>
            {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className={LABEL_FLUSH}>Type
          <select className={`min-w-[120px] ${INPUT}`} name="type" defaultValue={type ?? ''}>
            <option value="">All types</option>
            {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className={LABEL_FLUSH}>City<input className={`min-w-[150px] ${INPUT}`} name="city" defaultValue={city ?? ''} placeholder="City contains…" /></label>
        <button className={BTN} type="submit">Filter</button>
        {(mode || type || city) && <Link href="/matches" className={GHOST}>Clear</Link>}
      </form>

      {happening.length === 0 && upcoming.length === 0 ? (
        <p className={`mt-7 ${SUBTEXT}`}>Nothing posted yet. You are looking at an honest board. The first match appears when someone posts it.</p>
      ) : (
        <>
          {happening.length > 0 && (
            <div>
              <h2 className={`mb-2 ${H2SMALL}`}>Happening now</h2>
              <div className={`mt-2 ${LIST}`}>{happening.map(row)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="mt-6">
              <h2 className={`mb-2 ${H2SMALL}`}>Next up</h2>
              <div className={`mt-2 ${LIST}`}>{upcoming.map(row)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
