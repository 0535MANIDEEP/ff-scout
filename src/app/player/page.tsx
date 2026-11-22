import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/shared/auth/session';
import { prisma } from '@/shared/db/client';
import { RANKS, ROLE_IDS, GAME_ROLE_LABEL } from '@/lib/config';
import SignOut from '@/components/SignOut';
import RoleAvatar from '@/components/RoleAvatar';
import { saveProfile, leaveMatch } from './actions';
import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Your dashboard, Final Circle');

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H3 = 'mb-2 text-lg font-bold leading-[1.2] tracking-[-0.01em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const CARD_COPY = 'text-sm leading-[1.6] text-muted';
const SMALL = 'text-sm text-muted';
const APPROVED = 'font-mono text-sm font-bold text-[#1F6B3A]';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const DASHBOARD = 'grid grid-cols-[2fr_1fr] gap-6 max-[1024px]:grid-cols-1';
const LIST = 'flex flex-col gap-3';
const ROWITEM = 'flex min-h-[72px] items-center justify-between gap-4 rounded-card border border-[#CFC8B9] bg-panel p-4 text-ink hover:border-vermilion max-[600px]:flex-col max-[600px]:items-start';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default async function PlayerDashboard({ searchParams }: { searchParams: Promise<{ done?: string; e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');

  const sp = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: s.id },
    select: { id: true, displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true, teamName: true },
  });
  if (!user) redirect('/login');

  const joins = await prisma.matchEntry.findMany({
    where: { playerId: s.id },
    orderBy: { createdAt: 'desc' },
    include: { match: { select: { id: true, title: true, mode: true, gameType: true, date: true, city: true, status: true } } },
  });

  return (
    <div className={`${SHELL} pb-12`}>
      <div className="mt-8 flex items-baseline justify-between max-[600px]:flex-wrap max-[600px]:gap-y-3">
        <div className="flex items-center gap-[14px]">
          <RoleAvatar role={user.role} iglCapable={false} size={56} />
          <div>
            <h1 className={H1}>Welcome, {user.displayName}</h1>
            <p className={SUBTEXT}>
              UID {user.gameUid ?? '—'} · BR {user.brRank ?? '—'} · CS {user.csRank ?? '—'} · {user.role ? GAME_ROLE_LABEL[user.role] : '—'} · {user.city}
            </p>
          </div>
        </div>
        <div className="flex gap-2"><Link href="/settings" className={GHOST}>Settings</Link><SignOut /></div>
      </div>

      {sp.done && <p className={`mt-3 ${APPROVED}`}>Saved.</p>}
      {sp.e === 'invalid' && <p className="mt-3 text-[13px] text-risk">Check your details, something is missing or invalid.</p>}
      {sp.e === 'team' && <p className="mt-3 text-[13px] text-risk">Team name must be 2–30 characters.</p>}

      <div className={`mt-6 ${DASHBOARD}`}>
        <section className={CARD}>
          <h3 className={H3}>Your profile</h3>
          <p className={`mt-[6px] ${CARD_COPY}`}>This is what organizers see. Players reach you in-game by UID.</p>
          <form action={saveProfile} className="mt-[14px] grid gap-[10px]">
            <label className={LABEL_FLUSH}>Display name<input className={INPUT} name="displayName" defaultValue={user.displayName} required /></label>
            <label className={LABEL_FLUSH}>Free Fire UID<input className={INPUT} name="gameUid" defaultValue={user.gameUid ?? ''} inputMode="numeric" pattern="[0-9]{5,15}" required /></label>
            <label className={LABEL_FLUSH}>BR rank
              <select className={INPUT} name="brRank" defaultValue={user.brRank ?? ''} required>
                <option value="" disabled>Pick your BR rank</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className={LABEL_FLUSH}>CS rank
              <select className={INPUT} name="csRank" defaultValue={user.csRank ?? ''} required>
                <option value="" disabled>Pick your CS rank</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className={LABEL_FLUSH}>Role
              <select className={INPUT} name="role" defaultValue={user.role ?? ''} required>
                <option value="" disabled>Pick your role</option>
                {ROLE_IDS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className={LABEL_FLUSH}>Team / Guild name (used as default on esports joins)<input className={INPUT} name="teamName" defaultValue={user.teamName ?? ''} maxLength={30} placeholder="Optional, 2–30 characters" /></label>
            <label className={LABEL_FLUSH}>City<input className={INPUT} name="city" defaultValue={user.city} required /></label>
            <button className={BTN} type="submit">Save profile</button>
          </form>
        </section>
      </div>

      <section className={`mt-6 ${CARD}`}>
        <h3 className={H3}>Your joins</h3>
        {joins.length === 0 ? (
          <p className={`mt-2 ${CARD_COPY}`}>You haven't joined a match yet. Browse the board and tap Join.</p>
        ) : (
          <div className={`mt-3 ${LIST}`}>
            {joins.map((j) => (
              <div key={j.id} className={ROWITEM}>
                <div>
                  <strong className="text-base">{j.match.title}</strong>
                  <span className={SMALL}> · {j.match.gameType} · {j.match.mode} · {j.match.city} · {new Date(j.match.date).toLocaleDateString('en-IN')}</span>
                </div>
                <form action={leaveMatch} className="inline">
                  <input type="hidden" name="matchId" value={j.match.id} />
                  <button className={GHOST} type="submit">Leave</button>
                </form>
              </div>
            ))}
          </div>
        )}
        <div className="mt-[14px]"><Link href="/matches" className={GHOST}>Find a match</Link></div>
      </section>
    </div>
  );
}
